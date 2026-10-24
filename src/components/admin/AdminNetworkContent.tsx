"use client";
import {Link} from "@/i18n/navigation";
import {useEffect,useState} from "react";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type DomainPolicy={domain:string;mode:"normal"|"hijack"|"route"|"specific_ip";specific_ip?:string;route?:{destination_ip?:string;protocol:"tcp"|"udp"|"tcp_udp";destination_port_start?:number;destination_port_end?:number};connection_modes?:string[]};
type RouteIP={agentId:string;publicIp:string;enabled:boolean;lastSeenAt:string|null;domain:string;state:string};
type DNSNode={id:string;region:string;addresses:string[];lastSeenAt:string;online:boolean};

export default function AdminNetworkContent(){
 const locale=useLocale();
 const [nodes,setNodes]=useState<DNSNode[]>([]);
 const [routeIPs,setRouteIPs]=useState<RouteIP[]>([]);
 const [domains,setDomains]=useState<DomainPolicy[]>([]);
 const [revision,setRevision]=useState(0);
 const [search,setSearch]=useState("");
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(25);
 const [total,setTotal]=useState(0);
 const [policiesLoading,setPoliciesLoading]=useState(false);
 const [domain,setDomain]=useState("");
 const [mode,setMode]=useState<DomainPolicy["mode"]>("normal");
 const [ip,setIp]=useState("");
 const [protocol,setProtocol]=useState<"tcp"|"udp"|"tcp_udp">("tcp");
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [deleteTarget,setDeleteTarget]=useState<string|null>(null);
 const [deleting,setDeleting]=useState(false);
 async function load(){
  setLoading(true);setError("");
  try{const {data}=await apiClient.get<{nodes:DNSNode[]}>("/api/v1/admin/network/dns-controls");setNodes(data.nodes);await Promise.all([loadPolicies(search,page,pageSize),loadRouteIPs()])}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to load DNS controllers")}
  finally{setLoading(false)}
 }
 async function loadRouteIPs(){
  try {const {data}=await apiClient.get<{addresses:RouteIP[]}>("/api/v1/admin/network/route-agent-ips");setRouteIPs(data.addresses)}
  catch {setError("Unable to load route agent IP inventory")}
 }
 async function loadPolicies(query:string,currentPage:number,size:number){
  setPoliciesLoading(true);
  try{
   const {data}=await apiClient.get<{revision:number;domains:DomainPolicy[];total?:number;page?:number;pageSize?:number}>("/api/v1/admin/network/domains",{params:{search:query,page:currentPage,pageSize:size}});
   setDomains(data.domains);setRevision(data.revision);setTotal(data.total??data.domains.length);
  }catch{setError("Unable to load domain policies")}finally{setPoliciesLoading(false)}
 }
 useEffect(()=>{void load()},[]);
 useEffect(()=>{void loadPolicies(search,page,pageSize)},[search,page,pageSize]);
 async function save(){setSaving(true);setError("");setMessage("");try{
 const policy:DomainPolicy={domain:domain.trim().toLowerCase(),mode};
 if(mode==="specific_ip")policy.specific_ip=ip.trim();
 if(mode==="route")policy.route={protocol,...(ip.trim()?{destination_ip:ip.trim()}:{})};
 await apiClient.put("/api/v1/admin/network/domains",policy);
 setDomain("");setIp("");setMessage(mode==="route"?"Full Route policy saved. An agent public IP must be allocated and forwarding acknowledged before DNS can activate this domain.":"Policy saved. DNS Control will apply it after synchronization.");await Promise.all([loadPolicies(search,page,pageSize),loadRouteIPs()]);
 }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||"Unable to save policy")}finally{setSaving(false)}}
 async function remove(name:string){setDeleting(true);setError("");try{await apiClient.delete("/api/v1/admin/network/domains/"+encodeURIComponent(name));if(domains.length===1&&page>1)setPage(page-1);else await Promise.all([loadPolicies(search,page,pageSize),loadRouteIPs()]);setDeleteTarget(null)}catch{setError("Unable to delete policy")}finally{setDeleting(false)}}
 function edit(p:DomainPolicy){setDomain(p.domain);setMode(p.mode);setIp(p.mode==="specific_ip"?p.specific_ip||"":p.route?.destination_ip||"");setProtocol(p.route?.protocol||"tcp")}

 return <main className="mx-auto max-w-5xl px-6 py-12">
  <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">Network operations</h1><button onClick={()=>void load()} disabled={loading} className="rounded-lg border px-4 py-2">Refresh</button></div>
  <p className="mt-3 text-gray-400">DNS controller registration and heartbeat status from the backend registry.</p>
  {error&&<p role="alert" className="mt-4 text-red-400">{error}</p>}
  {loading?<p className="mt-6">Loading controllers…</p>:<div className="mt-6 space-y-3">
   {nodes.length===0&&<p>No registered DNS controllers.</p>}
   {nodes.map(node=><article key={node.id} className="rounded-xl border border-white/15 bg-white/5 p-5">
    <div className="flex justify-between gap-3"><h2 className="break-all font-semibold">{node.id}</h2><span className={node.online?"text-green-400":"text-amber-300"}>{node.online?"Online":"Offline"}</span></div>
    <p className="mt-2 text-sm text-gray-400">Region: {node.region||"Unspecified"}</p>
    <p className="text-sm text-gray-400">Addresses: {node.addresses.join(", ")||"None"}</p>
    <p className="text-sm text-gray-400">Last registration: {new Date(node.lastSeenAt).toLocaleString()}</p>
   </article>)}
  </div>}
  <section className="mt-8 rounded-xl border border-white/15 p-5">
  <h2 className="text-xl font-semibold">Domain resolution policies</h2>
  <p className="mt-2 text-sm text-gray-400">Revision {revision}. Normal uses public DNS, SNI hijack uses a ready edge agent, full route requires a destination IPv4, and specific IP returns your configured DNS address.</p>
  <form onSubmit={e=>{e.preventDefault();void save()}} className="mt-4 grid gap-3 md:grid-cols-2">
   <label className="text-sm">Domain<input required value={domain} onChange={e=>setDomain(e.target.value)} placeholder="example.com" className="mt-1 w-full rounded-lg border bg-transparent p-2"/></label>
   <label className="text-sm">Resolution mode<select value={mode} onChange={e=>setMode(e.target.value as DomainPolicy["mode"])} className="mt-1 w-full rounded-lg border bg-gray-900 p-2"><option value="normal">Normal DNS</option><option value="hijack">SNI hijack</option><option value="route">Full route</option><option value="specific_ip">Specific IP</option></select></label>
   {(mode==="specific_ip"||mode==="route")&&<label className="text-sm"> {mode==="route"?"Destination IPv4 (optional override)":"DNS response IP"}<input required={mode==="specific_ip"} value={ip} onChange={e=>setIp(e.target.value)} placeholder="192.0.2.10" className="mt-1 w-full rounded-lg border bg-transparent p-2"/></label>}
   {mode==="route"&&<label className="text-sm">Protocol<select value={protocol} onChange={e=>setProtocol(e.target.value as "tcp"|"udp"|"tcp_udp")} className="mt-1 w-full rounded-lg border bg-gray-900 p-2"><option value="tcp">TCP</option><option value="udp">UDP</option><option value="tcp_udp">TCP/UDP</option></select></label>}
   {mode==="route"&&<div className="md:col-span-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
   Full Route uses public DNS to discover the destination when no override is provided. It requires a dedicated public IP from a connected edge agent. Saving this policy does not immediately activate DNS routing. The domain remains awaiting allocation and agent confirmation until forwarding is ready.
  </div>}
   <div className="md:col-span-2"><button disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-white disabled:opacity-50">{saving?"Saving…":"Save domain policy"}</button></div>
  </form>
  {message&&<p role="status" className="mt-3 text-green-400">{message}</p>}
  <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
   <label className="text-sm">Search domains<input type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by domain" className="mt-1 block rounded-lg border bg-transparent p-2"/></label>
   <label className="text-sm">Per page<select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}} className="mt-1 block rounded-lg border bg-gray-900 p-2">{[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
  </div>
  {policiesLoading&&<p role="status" className="mt-3 text-sm text-gray-400">Loading policies…</p>}
  {!policiesLoading&&domains.length===0&&<p className="mt-3 text-sm text-gray-400">No matching domains found.</p>}
  <div className="mt-5 space-y-2">{domains.map(p=><div key={p.domain} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"><div><strong>{p.domain}</strong><p className="text-sm text-gray-400">{p.mode}{p.specific_ip?" · "+p.specific_ip:""}{p.route?" · "+(p.route.destination_ip||"Automatic DNS")+" / "+p.route.protocol:""}</p>{p.mode==="route"&&(()=>{const assigned=routeIPs.find(i=>i.domain===p.domain&&i.enabled);return <p className={assigned?.state==="active"?"text-sm text-green-400":"text-sm text-amber-300"}>Routing: {assigned?assigned.state||"Pending": "Waiting for an available agent IP"}{assigned?" · "+assigned.publicIp+" ("+assigned.agentId+")":""}</p>})()}</div><div className="flex gap-2"><button type="button" onClick={()=>edit(p)} className="rounded border px-3 py-1">Edit</button><button type="button" onClick={()=>setDeleteTarget(p.domain)} className="rounded border border-red-400/40 px-3 py-1 text-red-300">Delete</button></div></div>)}</div>
  <nav aria-label="Domain policy pages" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
   <span>{total===0?"0 results":`${(page-1)*pageSize+1}–${Math.min(page*pageSize,total)} of ${total}`}</span>
   <div className="flex items-center gap-3"><button type="button" disabled={page<=1||policiesLoading} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><span>Page {page} of {Math.max(1,Math.ceil(total/pageSize))}</span><button type="button" disabled={page>=Math.ceil(total/pageSize)||policiesLoading} onClick={()=>setPage(p=>p+1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div>
  </nav>
  </section>
  <section className="mt-8 rounded-xl border border-white/15 p-5">
   <h2 className="font-semibold">Edge agent public IP inventory</h2>
   <p className="mt-2 text-sm text-gray-400">Backend-registered routing IPs and their current assignments. Addresses marked free can accept a waiting Full Route domain after allocation is enabled.</p>
   <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Agent</th><th className="p-2">Public IP</th><th className="p-2">Domain</th><th className="p-2">Status</th></tr></thead>
   <tbody>{routeIPs.map(item=><tr key={item.agentId+item.publicIp} className="border-t border-white/10"><td className="p-2">{item.agentId}</td><td className="p-2">{item.publicIp}</td><td className="p-2">{item.domain||"Free"}</td><td className="p-2">{!item.enabled?"Disabled":item.state||"Available"}</td></tr>)}</tbody></table></div>
   {routeIPs.length===0&&<p className="mt-3 text-sm text-gray-400">No edge routing IPs registered yet.</p>}
  </section>
  {deleteTarget&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onMouseDown={e=>{if(e.target===e.currentTarget&&!deleting)setDeleteTarget(null)}}>
   <div role="alertdialog" aria-modal="true" aria-labelledby="delete-domain-title" aria-describedby="delete-domain-description" className="w-full max-w-md rounded-2xl border border-white/15 bg-gray-950 p-6 text-white shadow-2xl" onKeyDown={e=>{if(e.key==="Escape"&&!deleting)setDeleteTarget(null)}}>
    <h2 id="delete-domain-title" className="text-xl font-semibold">Delete domain policy?</h2>
    <p id="delete-domain-description" className="mt-3 text-sm text-gray-300">This will remove the resolution policy for <strong className="break-all text-white">{deleteTarget}</strong>. DNS Control will apply the change after synchronization.</p>
    <div className="mt-6 flex justify-end gap-3">
     <button type="button" autoFocus disabled={deleting} onClick={()=>setDeleteTarget(null)} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50">Cancel</button>
     <button type="button" disabled={deleting} onClick={()=>void remove(deleteTarget)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">{deleting?"Deleting…":"Delete policy"}</button>
    </div>
   </div>
  </div>}
  <Link href="/admin" locale={locale} className="mt-8 inline-block text-cyan-300">Back to admin overview</Link>
 </main>;
}
