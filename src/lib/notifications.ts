import {apiClient} from "@/lib/api/client";
export type NotificationType="order"|"payment"|"support"|"security"|"system";
export type Notification={id:string;type:NotificationType;title:string;message:string;createdAt:string;read:boolean;link?:string|null};
export type NotificationPreferencesData={orders:boolean;payments:boolean;support:boolean;security:boolean;system:boolean};
export async function getNotifications(limit=50,offset=0){const {data}=await apiClient.get<{notifications:Notification[];unreadCount:number;limit:number;offset:number}>("/api/v1/notifications/",{params:{limit,offset}});return data;}
export async function markRead(id:string){await apiClient.post("/api/v1/notifications/"+encodeURIComponent(id)+"/read");}
export async function markAllRead(){await apiClient.post("/api/v1/notifications/read-all");}
export async function getPreferences(){const {data}=await apiClient.get<NotificationPreferencesData>("/api/v1/notifications/preferences");return data;}
export async function savePreferences(prefs:NotificationPreferencesData){const {data}=await apiClient.put<NotificationPreferencesData>("/api/v1/notifications/preferences",prefs);return data;}
