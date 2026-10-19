import {apiClient} from "@/lib/api/client";

export type UserSubscription = {
    id: string;
    planCode: string;
    planName: string;
    priceMinor: number;
    currency: string;
    durationDays: number;
    status: "pending_payment" | "active" | "expired" | "cancelled";
    createdAt: string;
    startsAt?: string | null;
    expiresAt?: string | null;
    cancelledAt?: string | null;
};

export async function listSubscriptions(): Promise<UserSubscription[]> {
    const {data} = await apiClient.get<{subscriptions: UserSubscription[]}>("/api/v1/me/subscriptions");
    if (!Array.isArray(data.subscriptions)) throw new Error("Invalid subscriptions response");
    return data.subscriptions;
}

export async function cancelPendingSubscription(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/me/subscriptions/${encodeURIComponent(id)}`);
}
