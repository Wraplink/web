import {apiClient} from "@/lib/api/client";

export type PaymentCard = {id:string;cardNumber:string;cardholderName:string;bankName:string;active:boolean};

export async function listPaymentCards():Promise<PaymentCard[]> {
 const {data}=await apiClient.get<{cards:PaymentCard[]}>("/api/v1/payment-cards");
 return data.cards;
}
export async function adminListPaymentCards():Promise<PaymentCard[]> {
 const {data}=await apiClient.get<{cards:PaymentCard[]}>("/api/v1/admin/payment-reviews/cards");
 return data.cards;
}
export async function adminCreatePaymentCard(body:{cardNumber:string;cardholderName:string;bankName:string}):Promise<PaymentCard> {
 const {data}=await apiClient.post<PaymentCard>("/api/v1/admin/payment-reviews/cards",body);
 return data;
}
export async function adminSetPaymentCardActive(id:string,active:boolean):Promise<void> {
 await apiClient.patch(`/api/v1/admin/payment-reviews/cards/${encodeURIComponent(id)}`,{active});
}
