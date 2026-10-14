import {apiClient} from "@/lib/api/client";

export type DailyUsage = {
    date: string;
    uploadBytes: number;
    downloadBytes: number;
    totalBytes: number;
};

export type UsageSummary = {
    subscriptionId: string;
    planCode: string;
    status: string;
    dataLimitBytes: number;
    usedBytes: number;
    remainingBytes: number;
    percentUsed: number;
    startsAt: string;
    expiresAt: string;
    daily: DailyUsage[];
};

export async function getUsage(
    days: number
): Promise<UsageSummary> {
    const normalizedDays = Math.min(
        90,
        Math.max(1, Math.trunc(days))
    );

    const response = await apiClient.get<UsageSummary>(
        "/api/v1/me/usage",
        {
            params: {
                days: normalizedDays,
            },
        }
    );

    return response.data;
}
