import {apiClient} from "@/lib/api/client";

export type AdminUser={id:string;email:string;name:string;status:string;emailVerified:boolean;createdAt:string};
export type AdminOrder={id:string;userId:string;email:string;status:string;amountMinor:number;currency:string;receiptStatus:string;createdAt:string};
export type AdminPermission={userId:string;email:string;paymentReview:boolean;discountAdmin:boolean};

export async function adminUsers(search=""):Promise<AdminUser[]>{
 const {data}=await apiClient.get<{users:AdminUser[]}>("/api/v1/admin/access/users",{params:{search,limit:100}});
 return data.users;
}
export async function adminOrders():Promise<AdminOrder[]>{
 const {data}=await apiClient.get<{orders:AdminOrder[]}>("/api/v1/admin/access/orders",{params:{limit:100}});
 return data.orders;
}
export async function adminPermissions():Promise<AdminPermission[]>{
 const {data}=await apiClient.get<{users:AdminPermission[]}>("/api/v1/admin/access/permissions");
 return data.users;
}
export async function updateAdminPermission(userId:string,permission:"payment_review"|"discount_admin",enabled:boolean):Promise<void>{
 await apiClient.put(`/api/v1/admin/access/users/${encodeURIComponent(userId)}/permissions/${permission}`,{enabled});
}
