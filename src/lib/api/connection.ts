import axios from "axios";

import {apiClient} from "@/lib/api/client";

export type ConnectionMode =
    | "smart"
    | "gaming"
    | "streaming";

export type ConnectionStatus = {
    connected: boolean;
    latency: number;
    packetLoss: number;
    primaryDns: string;
    secondaryDns: string;
    edge: string;
    region: string;
    country: string;
    load: number;
    mode: ConnectionMode;
};

export type DiagnosticType =
    | "ping"
    | "dns"
    | "route";

export type DiagnosticResult = {
    success: boolean;
    value: string;
    latency?: number;
};

export type ConnectionEvent = {
    id: string;
    type: "success" | "info" | "warning";
    title: string;
    time: string;
};

type BackendAccessInfo = {
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

type BackendErrorResponse = {
    error?: string;
};

export async function getConnectionStatus(): Promise<ConnectionStatus> {
    try {
        const accessResponse = await apiClient.get<BackendAccessInfo>(
            "/api/v1/me/network/access"
        );

        const entitlement = await getCurrentEntitlement();
        const dnsServers =
            accessResponse.data.connection?.dnsServers ?? [];

        return {
            connected:
                accessResponse.data.status === "active" &&
                entitlement?.status === "active",
            latency: 0,
            packetLoss: 0,
            primaryDns: dnsServers[0] ?? "-",
            secondaryDns: dnsServers[1] ?? "-",
            edge: entitlement
                ? `Entitled IP ${entitlement.clientIp}`
                : "Managed by DNS Control",
            region: "-",
            country: "-",
            load: 0,
            mode: "smart",
        };
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
        ) {
            return disconnectedStatus();
        }

        throw error;
    }
}

export async function connect(): Promise<void> {
    try {
        await apiClient.post<BackendEntitlement>(
            "/api/v1/me/network/entitlement"
        );
    } catch (error) {
        throw readableBackendError(
            error,
            "Could not activate network entitlement"
        );
    }
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
    _mode: ConnectionMode
): Promise<void> {
    throw new Error(
        "Connection modes are not available from the website API yet."
    );
}

export async function runDiagnostic(
    type: DiagnosticType
): Promise<DiagnosticResult> {
    if (type === "dns") {
        const status = await getConnectionStatus();

        if (
            status.connected &&
            status.primaryDns !== "-"
        ) {
            return {
                success: true,
                value: status.primaryDns,
            };
        }

        return {
            success: false,
            value: "No active DNS entitlement",
        };
    }

    return {
        success: false,
        value: "Diagnostic is not available yet",
    };
}

export async function getConnectionEvents(): Promise<ConnectionEvent[]> {
    return [];
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

function disconnectedStatus(): ConnectionStatus {
    return {
        connected: false,
        latency: 0,
        packetLoss: 0,
        primaryDns: "-",
        secondaryDns: "-",
        edge: "-",
        region: "-",
        country: "-",
        load: 0,
        mode: "smart",
    };
}
