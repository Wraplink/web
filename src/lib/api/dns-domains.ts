export type DnsMode = "SNI_HIJACK" | "FULL_ROUTE" | "DIRECT";
export type DnsDomain = {
  id: string; domain: string; enabled: boolean; mode: DnsMode;
  agentId: string | null; overrideIp: string | null;
  fallbackMode: "DIRECT" | "REFUSE"; priority: number;
};
export type DnsDomainInput = Omit<DnsDomain, "id">;
const endpoint = "/api/v1/admin/dns/domains";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "include", ...init,
    headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}
export const dnsDomainsApi = {
  list: () => request<DnsDomain[]>(endpoint),
  create: (input: DnsDomainInput) => request<DnsDomain>(endpoint, {method:"POST",body:JSON.stringify(input)}),
  update: (id:string,input:DnsDomainInput) => request<DnsDomain>(`${endpoint}/${encodeURIComponent(id)}`,{method:"PUT",body:JSON.stringify(input)}),
  remove: async (id:string) => {
    const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`,{method:"DELETE",credentials:"include"});
    if (!response.ok) throw new Error(await response.text());
  }
};
