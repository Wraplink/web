import {apiClient} from "@/lib/api/client";

export type PendingReceipt = {
    id: string;
    customer?: {email:string;fullName:string;accountStatus:string;emailVerified:boolean};
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

export type ReviewFilters = {orderNumber?:string;account?:string;dateFrom?:string;dateTo?:string};
export async function listPendingReceipts(filters:ReviewFilters = {}): Promise<PendingReceipt[]> {
    const {data} = await apiClient.get<{receipts: PendingReceipt[]}>("/api/v1/admin/payment-reviews/receipts", {params:filters});
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
