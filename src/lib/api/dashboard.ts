import {apiClient} from "@/lib/api/client";

export type DashboardSummary = {
    wallet: {
        currency: string;
        balanceMinor: number;
    };
    access: {
        planCode: string;
        status: "active" | "quota_exhausted" | "expired" | "unavailable";
        dataLimitBytes: number;
        usedBytes: number;
        remainingBytes: number;
        connection?: {dnsServers: string[]};
    } | null;
    entitlement: {
        clientIp: string;
        status: "active" | "inactive";
    } | null;
    recentPayments: {
        id: string;
        status: string;
        amountMinor: number;
        currency: string;
        createdAt: string;
    }[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>(
        "/api/v1/me/dashboard"
    );
    return response.data;
}
