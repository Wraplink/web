import axios from "axios";

import {apiClient} from "@/lib/api/client";

export type ConnectionMode =
    | "smart"
    | "gaming"
    | "streaming";

export type ConnectionStatus = {
    connected: boolean;
    dnsReady: boolean;
    agentReady: boolean;
    sniReady: boolean;
    routeReady: boolean;
    readinessReason: string;
    latency: number | null;
    packetLoss: number | null;
    primaryDns: string;
    secondaryDns: string;
    edge: string;
    region: string;
    country: string;
    load: number | null;
    mode: ConnectionMode;
    clientIp: string;
    planCode: string;
    remainingBytes: number | null;
    expiresAt: string | null;
};

export type DiagnosticType =
    | "ping"
    | "dns"
    | "route";

export type DiagnosticResult = {
    success: boolean;
    value: string;
    latency?: number;
    scope?: "backend" | "control-plane";
};

export type ConnectionEvent = {
    id: string;
    type: "success" | "info" | "warning";
    title: string;
    time: string;
};

type BackendAccessInfo = {
    dnsRegistryReady?: boolean;
    readiness?: {
        dnsReady: boolean;
        agentReady: boolean;
        sniReady: boolean;
        routeReady: boolean;
        reason: string;
        clientVerified: boolean;
    };
    subscriptionId: string;
    planCode: string;
    status:
        | "active"
        | "quota_exhausted"
        | "expired"
        | "unavailable";
    dataLimitBytes: number;
    usedBytes: number;
    remainingBytes: number;
    startsAt: string;
    expiresAt: string;
    connection?: {
        dnsServers: string[];
        proxy?: {
            host: string;
            port: number;
            protocol: string;
        };
    };
};

type BackendEntitlement = {
    id: string;
    subscriptionId: string;
    clientIp: string;
    status: "active" | "inactive";
    planCode: string;
    dataLimitBytes: number;
    usedBytes: number;
    remainingBytes: number;
    startsAt: string;
    expiresAt: string;
    activatedAt: string;
};

type BackendModeResponse = {
    mode: ConnectionMode;
};

type BackendErrorResponse = {
    error?: string;
    code?: string;
};

export class ConnectionActivationError extends Error {
    constructor(public readonly code: string) {
        super(code);
        this.name = "ConnectionActivationError";
    }
}

export async function getConnectionStatus(): Promise<ConnectionStatus> {
    // The mode belongs to the account and persists independently of an
    // active entitlement, so the selection works before connecting too.
    const mode = await getCurrentMode();
    const entitlement = await getCurrentEntitlement();
    if (entitlement?.status !== "active") {
        return disconnectedStatus(mode);
    }

    // Entitlement activation is authoritative. A temporary failure in the
    // separate access-details endpoint must not make the power button bounce off.
    let access: BackendAccessInfo | null = null;
    try {
        const response = await apiClient.get<BackendAccessInfo>(
            "/api/v1/me/network/access"
        );
        access = response.data;
    } catch (error) {
        // Authentication failures must still be handled by the API client.
        if (!axios.isAxiosError(error) || error.response?.status === 401 || error.response?.status === 403) {
            throw error;
        }
    }

    // Backend chooses these addresses from the registered dns-control nodes.
    // Never substitute static frontend IPs or cached values.
    const dnsServers = Array.from(new Set(
        (access?.connection?.dnsServers ?? [])
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean)
    )).slice(0, 2);

    return {
        connected: true,
        dnsReady: access?.status === "active" && access?.dnsRegistryReady === true && dnsServers.length > 0,
        agentReady: access?.readiness?.agentReady === true,
        sniReady: access?.readiness?.sniReady === true,
        routeReady: access?.readiness?.routeReady === true,
        readinessReason: access?.readiness?.reason ?? "READINESS_UNAVAILABLE",
        latency: null,
        packetLoss: null,
        primaryDns: dnsServers[0] ?? "-",
        secondaryDns: dnsServers[1] ?? "-",
        edge: `Entitled IP ${entitlement.clientIp}`,
        region: "-",
        country: "-",
        load: null,
        mode,
        clientIp: entitlement.clientIp,
        planCode: access?.planCode ?? entitlement.planCode,
        remainingBytes: access?.remainingBytes ?? entitlement.remainingBytes,
        expiresAt: access?.expiresAt ?? entitlement.expiresAt,
    };
}

export async function connect(clientIp?: string): Promise<void> {
    try {
        await apiClient.post<BackendEntitlement>(
            "/api/v1/me/network/entitlement",
            clientIp === undefined ? undefined : {clientIp}
        );
    } catch (error) {
        if (axios.isAxiosError<BackendErrorResponse>(error)) {
            const code = error.response?.data?.code;
            if (code && ["NO_USABLE_SUBSCRIPTION", "CLIENT_IP_IN_USE", "INVALID_CLIENT_IP", "CLIENT_IP_MISMATCH", "PUBLIC_IPV4_REQUIRED"].includes(code)) {
                throw new ConnectionActivationError(code);
            }
        }
        throw new ConnectionActivationError("CONNECTION_FAILED");
    }
}

export async function getSavedConnectionIps(): Promise<string[]> {
    const {data} = await apiClient.get<{ips: string[]}>("/api/v1/me/network/saved-ips");
    return data.ips;
}

export async function deleteSavedConnectionIp(clientIp: string): Promise<void> {
    await apiClient.delete("/api/v1/me/network/saved-ips", {params: {clientIp}});
}

export async function disconnect(): Promise<void> {
    try {
        await apiClient.delete(
            "/api/v1/me/network/entitlement"
        );
    } catch (error) {
        // Disconnect is idempotent from the UI perspective.
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
        ) {
            return;
        }

        throw readableBackendError(
            error,
            "Could not deactivate network entitlement"
        );
    }
}

export async function updateConnectionMode(
    mode: ConnectionMode
): Promise<void> {
    try {
        await apiClient.put<BackendModeResponse>(
            "/api/v1/me/network/mode",
            {mode}
        );
    } catch (error) {
        throw readableBackendError(error, "Could not update connection mode");
    }
}

async function getCurrentMode(): Promise<ConnectionMode> {
    const response = await apiClient.get<BackendModeResponse>(
        "/api/v1/me/network/mode"
    );
    const mode = response.data.mode;
    if (mode !== "smart" && mode !== "gaming" && mode !== "streaming") {
        throw new Error("Unsupported connection mode returned by backend");
    }
    return mode;
}

export async function runDiagnostic(
    type: DiagnosticType
): Promise<DiagnosticResult> {
    try {
        const response = await apiClient.post<DiagnosticResult>(
            `/api/v1/me/network/diagnostics/${type}`
        );
        return response.data;
    } catch (error) {
        throw readableBackendError(error, "Could not run network diagnostic");
    }
}

export type ConnectionEventsPage = {
    events: ConnectionEvent[];
    nextCursor?: string;
};

export async function getConnectionEvents(before?: string): Promise<ConnectionEventsPage> {
    const params = new URLSearchParams({limit: "10"});
    if (before) params.set("before", before);
    const response = await apiClient.get<ConnectionEventsPage>(
        `/api/v1/me/network/events?${params.toString()}`
    );
    return response.data;
}

async function getCurrentEntitlement(): Promise<BackendEntitlement | null> {
    try {
        const response = await apiClient.get<BackendEntitlement>(
            "/api/v1/me/network/entitlement"
        );

        return response.data;
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
        ) {
            return null;
        }

        throw error;
    }
}

function readableBackendError(
    error: unknown,
    fallback: string
): Error {
    if (axios.isAxiosError<BackendErrorResponse>(error)) {
        const message = error.response?.data?.error?.trim();
        if (message) {
            return new Error(message);
        }
    }

    if (error instanceof Error) {
        return error;
    }

    return new Error(fallback);
}

function disconnectedStatus(mode: ConnectionMode): ConnectionStatus {
    return {
        connected: false,
        dnsReady: false,
        agentReady: false,
        sniReady: false,
        routeReady: false,
        readinessReason: "ACCESS_NOT_ACTIVE",
        latency: null,
        packetLoss: null,
        primaryDns: "-",
        secondaryDns: "-",
        edge: "-",
        region: "-",
        country: "-",
        load: null,
        mode,
        clientIp: "-",
        planCode: "-",
        remainingBytes: null,
        expiresAt: null,
    };
}
