import {apiClient} from "@/lib/api/client";

export type AdminDiscount = {
    id: string;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    currency: string | null;
    active: boolean;
    startsAt: string | null;
    expiresAt: string | null;
    maxRedemptions: number | null;
    redemptions: number;
    createdAt: string;
};

export type CreateDiscount = {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    currency: string | null;
    active: boolean;
    startsAt: string | null;
    expiresAt: string | null;
    maxRedemptions: number | null;
};

const base = "/api/v1/admin/payment-reviews/discounts";

export async function listAdminDiscounts(): Promise<AdminDiscount[]> {
    const {data} = await apiClient.get<{discounts: AdminDiscount[]}>(base);
    return data.discounts;
}

export async function createAdminDiscount(input: CreateDiscount): Promise<void> {
    await apiClient.post(base, input);
}

export async function disableAdminDiscount(id: string): Promise<void> {
    await apiClient.post(`${base}/${encodeURIComponent(id)}/disable`);
}
