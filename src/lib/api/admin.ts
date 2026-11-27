import {apiClient} from "@/lib/api/client";

export type AdminUser={id:string;email:string;name:string;status:string;emailVerified:boolean;createdAt:string};
export type AdminOrder={id:string;userId:string;email:string;status:string;amountMinor:number;currency:string;receiptStatus:string;createdAt:string};
export type AdminSectionPermission =
 "users" | "orders" | "payment_methods" | "plans" | "starter_plans" |
 "support" | "contact_messages" | "network_monitor" | "network_manage" | "domain_policies";
export type GrantableAdminPermission = AdminSectionPermission | "payment_review" | "discount_admin";
export type AdminCapability = GrantableAdminPermission | "access";
export type AdminPermission={userId:string;email:string;paymentReview:boolean;discountAdmin:boolean;sections:AdminSectionPermission[]};

export async function adminCapabilities(): Promise<AdminCapability[]> {
 const {data} = await apiClient.get<{permissions: AdminCapability[]}>("/api/v1/admin/access/me");
 return data.permissions;
}

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
export async function updateAdminPermission(userId:string,permission:GrantableAdminPermission,enabled:boolean):Promise<void>{
 await apiClient.put(`/api/v1/admin/access/users/${encodeURIComponent(userId)}/permissions/${permission}`,{enabled});
}

export async function updateAdminUserStatus(userId:string,action:"suspend"|"restore"|"delete"):Promise<void>{
 await apiClient.patch(`/api/v1/admin/access/users/${encodeURIComponent(userId)}/status`,{action});
}
