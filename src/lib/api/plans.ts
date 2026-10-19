import {apiClient} from "@/lib/api/client";

export type MarketPlan = {
    id: string;
    code: string;
    name: string;
    description: string;
    priceMinor: number;
    currency: string;
    durationDays: number;
    dataLimitBytes: number;
    createdAt: string;
};

export async function getMarketPlans(): Promise<MarketPlan[]> {
    const {data} = await apiClient.get<{plans: MarketPlan[]}>("/api/v1/plans");
    if (!Array.isArray(data.plans)) {
        throw new Error("Invalid plans response");
    }
    return data.plans;
}

export async function getMarketPlan(code: string): Promise<MarketPlan> {
    const {data} = await apiClient.get<MarketPlan>(`/api/v1/plans/${encodeURIComponent(code)}`);
    return data;
}

export async function createPendingSubscription(planCode: string) {
    const {data} = await apiClient.post<{id: string; status: string}>(
        "/api/v1/me/subscriptions", {planCode}
    );
    return data;
}

export async function paySubscriptionWithWallet(subscriptionId: string) {
    const {data} = await apiClient.post(
        `/api/v1/me/subscriptions/${encodeURIComponent(subscriptionId)}/pay-with-wallet`
    );
    return data;
}
