import {apiClient} from "@/lib/api/client";

export type PendingReceipt = {
    id: string;
    plans?: {orderNumber:number;subscriptionId:string;planName:string;planCode:string;amountMinor:number;currency:string;durationDays:number;dataLimitBytes:number}[];
    orderCount?: number;
    paymentGroupId?: string | null;
    subscriptionId: string;
    userId: string;
    filename: string;
    contentType: string;
    payableMinor: number;
    currency: string;
    createdAt: string;
};

export async function listPendingReceipts(): Promise<PendingReceipt[]> {
    const {data} = await apiClient.get<{receipts: PendingReceipt[]}>("/api/v1/admin/payment-reviews/receipts");
    return data.receipts;
}

export async function reviewReceipt(id: string, decision: "approved" | "rejected"): Promise<void> {
    await apiClient.post(`/api/v1/admin/payment-reviews/receipts/${encodeURIComponent(id)}/decision`, {decision});
}

export async function downloadReceipt(id: string): Promise<Blob> {
    const {data} = await apiClient.get<Blob>(
        `/api/v1/admin/payment-reviews/receipts/${encodeURIComponent(id)}/attachment`,
        {responseType: "blob"}
    );
    return data;
}
