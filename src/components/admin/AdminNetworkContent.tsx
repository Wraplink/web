"use client";
import {Link} from "@/i18n/navigation";
import {useEffect,useState} from "react";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type DomainPolicy={domain:string;mode:"normal"|"hijack"|"route"|"specific_ip";specific_ip?:string;route?:{destination_ip:string;protocol:"tcp"|"udp";destination_port_start?:number;destination_port_end?:number};connection_modes?:string[]};
type DNSNode={id:string;region:string;addresses:string[];lastSeenAt:string;online:boolean};

export default function AdminNetworkContent(){
 const locale=useLocale();
 const [nodes,setNodes]=useState<DNSNode[]>([]);
 const [domains,setDomains]=useState<DomainPolicy[]>([]);
 const [revision,setRevision]=useState(0);
 const [domain,setDomain]=useState("");
 const [mode,setMode]=useState<DomainPolicy["mode"]>("normal");
 const [ip,setIp]=useState("");
 const [protocol,setProtocol]=useState<"tcp"|"udp">("tcp");
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 async function load(){
  setLoading(true);setError("");
  try{const {data}=await apiClient.get<{nodes:DNSNode[]}>("/api/v1/admin/network/dns-controls");setNodes(data.nodes);const policies=await apiClient.get<{revision:number;domains:DomainPolicy[]}>("/api/v1/admin/network/domains");setDomains(policies.data.domains);setRevision(policies.data.revision)}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to load DNS controllers")}
  finally{setLoading(false)}
 }
 useEffect(()=>{void load()},[]);
 async function save(){setSaving(true);setError("");setMessage("");try{
 const policy:DomainPolicy={domain:domain.trim().toLowerCase(),mode};
 if(mode==="specific_ip")policy.specific_ip=ip.trim();
 if(mode==="route")policy.route={destination_ip:ip.trim(),protocol};
 await apiClient.put("/api/v1/admin/network/domains",policy);
 setDomain("");setIp("");setMessage("Policy saved. DNS Control will apply it after synchronization.");await load();
 }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||"Unable to save policy")}finally{setSaving(false)}}
 async function remove(name:string){if(!window.confirm("Delete policy for "+name+"?"))return;setError("");try{await apiClient.delete("/api/v1/admin/network/domains/"+encodeURIComponent(name));await load()}catch{setError("Unable to delete policy")}}
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
   {(mode==="specific_ip"||mode==="route")&&<label className="text-sm"> {mode==="route"?"Destination IPv4":"DNS response IP"}<input required value={ip} onChange={e=>setIp(e.target.value)} placeholder="192.0.2.10" className="mt-1 w-full rounded-lg border bg-transparent p-2"/></label>}
   {mode==="route"&&<label className="text-sm">Protocol<select value={protocol} onChange={e=>setProtocol(e.target.value as "tcp"|"udp")} className="mt-1 w-full rounded-lg border bg-gray-900 p-2"><option value="tcp">TCP</option><option value="udp">UDP</option></select></label>}
   <div className="md:col-span-2"><button disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-white disabled:opacity-50">{saving?"Saving…":"Save domain policy"}</button></div>
  </form>
  {message&&<p role="status" className="mt-3 text-green-400">{message}</p>}
  <div className="mt-5 space-y-2">{domains.map(p=><div key={p.domain} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"><div><strong>{p.domain}</strong><p className="text-sm text-gray-400">{p.mode}{p.specific_ip?" · "+p.specific_ip:""}{p.route?" · "+p.route.destination_ip+" / "+p.route.protocol:""}</p></div><div className="flex gap-2"><button type="button" onClick={()=>edit(p)} className="rounded border px-3 py-1">Edit</button><button type="button" onClick={()=>void remove(p.domain)} className="rounded border border-red-400/40 px-3 py-1 text-red-300">Delete</button></div></div>)}</div>
  </section>
  <div className="mt-8 rounded-xl border border-white/15 p-5"><h2 className="font-semibold">Edge agents and routing</h2><p className="mt-2 text-sm text-gray-400">Live agent inventory, allocation policies and routing actions require a separately authenticated dns-control integration. No operational controls are exposed until that connection is secured.</p></div>
  <Link href="/admin" locale={locale} className="mt-8 inline-block text-cyan-300">Back to admin overview</Link>
 </main>;
}
