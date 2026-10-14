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

export async function getConnectionStatus(): Promise<ConnectionStatus> {
    try {
        const response = await apiClient.get<BackendAccessInfo>(
            "/api/v1/me/network/access"
        );

        const dnsServers =
            response.data.connection?.dnsServers ?? [];

        return {
            connected:
                response.data.status === "active",
            latency: 0,
            packetLoss: 0,
            primaryDns: dnsServers[0] ?? "-",
            secondaryDns: dnsServers[1] ?? "-",
            edge: "Managed by DNS Control",
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

// Connection provisioning is intentionally not exposed by the website
// backend. dns-control owns network orchestration and edge selection.
export async function connect(): Promise<void> {
    throw new Error(
        "Network provisioning is not available from the website API yet."
    );
}

export async function disconnect(): Promise<void> {
    throw new Error(
        "Network provisioning is not available from the website API yet."
    );
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
