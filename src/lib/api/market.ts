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

type PlansResponse = {plans: MarketPlan[]};

function validPlan(value: MarketPlan): boolean {
    return Boolean(value && typeof value.code === "string" &&
        typeof value.name === "string" &&
        Number.isSafeInteger(value.priceMinor) && value.priceMinor >= 0 &&
        /^[A-Z]{3}$/.test(value.currency) &&
        Number.isInteger(value.durationDays) && value.durationDays > 0);
}

export async function listMarketPlans(): Promise<MarketPlan[]> {
    const response = await apiClient.get<PlansResponse>("/api/v1/plans");
    if (!response.data || !Array.isArray(response.data.plans)) {
        throw new Error("Invalid plan catalog returned by backend");
    }
    if (!response.data.plans.every(validPlan)) {
        throw new Error("Backend returned a plan with invalid pricing or duration");
    }
    return response.data.plans;
}

export async function getMarketPlan(code: string): Promise<MarketPlan> {
    const response = await apiClient.get<MarketPlan>(
        `/api/v1/plans/${encodeURIComponent(code)}`
    );
    if (!validPlan(response.data)) {
        throw new Error("Invalid plan returned by backend");
    }
    return response.data;
}

export function formatPlanPrice(plan: MarketPlan, locale: string): string {
    const formatter = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency",
        currency: plan.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    // Backend prices are in minor currency units (e.g. cents for USD).
    const digits = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: plan.currency,
    }).resolvedOptions().maximumFractionDigits;
    return formatter.format(plan.priceMinor / 10 ** digits);
}
