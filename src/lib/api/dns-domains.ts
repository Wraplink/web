import { apiClient } from "./client";
export type DnsMode = "SNI_HIJACK" | "FULL_ROUTE" | "DIRECT";
export type DnsDomain = {
 id: string; domain: string; enabled: boolean; mode: DnsMode;
 agentId: string | null; overrideIp: string | null;
 fallbackMode: "DIRECT" | "REFUSE"; priority: number;
};
export type DnsDomainInput = Omit<DnsDomain,"id">;
const endpoint = "/api/v1/admin/dns/domains";
export const dnsDomainsApi = {
 list: async (): Promise<DnsDomain[]> => (await apiClient.get<DnsDomain[]>(endpoint)).data,
 create: async (input:DnsDomainInput):Promise<DnsDomain> => (await apiClient.post<DnsDomain>(endpoint,input)).data,
 update: async (id:string,input:DnsDomainInput):Promise<DnsDomain> => (await apiClient.put<DnsDomain>(`${endpoint}/${encodeURIComponent(id)}`,input)).data,
 remove: async (id:string):Promise<void> => {await apiClient.delete(`${endpoint}/${encodeURIComponent(id)}`);}
};
