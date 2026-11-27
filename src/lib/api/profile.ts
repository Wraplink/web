import {apiClient} from "@/lib/api/client";
export type Profile={id:string;email:string;full_name:string;email_verified:boolean;has_password?:boolean;account_status:string;last_login_at?:string;created_at:string;updated_at:string};
export type ManagedSession={id:string;ipAddress:string|null;userAgent:string;expiresAt:string};
export async function getProfile(){const {data}=await apiClient.get<Profile>("/api/v1/me/");return data;}
export async function updateProfile(fullName:string){const {data}=await apiClient.patch<Profile>("/api/v1/me/",{full_name:fullName});return data;}
export async function changeProfilePassword(currentPassword:string,newPassword:string){await apiClient.post("/api/v1/me/password",{currentPassword,newPassword});}
export async function getProfileSessions(){const {data}=await apiClient.get<{sessions:ManagedSession[]}>("/api/v1/me/sessions");return data.sessions;}
export async function revokeProfileSession(id:string){await apiClient.delete("/api/v1/me/sessions/"+encodeURIComponent(id));}
export async function revokeOtherProfileSessions(){await apiClient.post("/api/v1/me/sessions/revoke-others");}

export async function deleteProfile(confirmation: {currentPassword: string} | {confirmationEmail: string}) {
    await apiClient.delete("/api/v1/me/", {data: confirmation});
}
