import {apiClient} from "@/lib/api/client";

export type DiscountQuote = {code: string; discountMinor: number; payableMinor: number; currency: string};
export type CardReceiptResult = {id: string; status: string; discountMinor: number; payableMinor: number; currency: string};

export async function quoteDiscount(subscriptionId: string, code: string): Promise<DiscountQuote> {
    const {data} = await apiClient.post<DiscountQuote>(
        `/api/v1/me/subscriptions/${encodeURIComponent(subscriptionId)}/discount-quote`, {code});
    return data;
}

export async function submitCardReceipt(subscriptionId: string, file: File, discountCode: string): Promise<CardReceiptResult> {
    const form = new FormData();
    form.append("receipt", file);
    if (discountCode.trim()) form.append("discountCode", discountCode.trim());
    const {data} = await apiClient.post<CardReceiptResult>(
        `/api/v1/me/subscriptions/${encodeURIComponent(subscriptionId)}/card-receipt`, form);
    return data;
}

export async function getCardReceipt(subscriptionId: string): Promise<CardReceiptResult | null> {
    try {
        const {data} = await apiClient.get<CardReceiptResult>(
            `/api/v1/me/subscriptions/${encodeURIComponent(subscriptionId)}/card-receipt`
        );
        return data;
    } catch (error) {
        if (typeof error === "object" && error !== null && "response" in error &&
            (error as {response?: {status?: number}}).response?.status === 404) return null;
        throw error;
    }
}
