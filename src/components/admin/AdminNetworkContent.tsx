"use client";
import {Link} from "@/i18n/navigation";
import {useEffect,useMemo,useRef,useState} from "react";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type RouteIP={agentId:string;publicIp:string;enabled:boolean;lastSeenAt:string|null;domain:string;state:string};
type EdgeAgent={id:string;region:string;status:string;sniCapacity:number;routeCapacity:number;registeredAt:string;lastSeenAt:string;online:boolean};
type DNSNode={id:string;region:string;addresses:string[];lastSeenAt:string;online:boolean};

const REFRESH_SECONDS=15;
const PENDING_REFRESH_SECONDS=3;

export default function AdminNetworkContent(){
 const locale=useLocale();
 const [nodes,setNodes]=useState<DNSNode[]>([]);
 const [agents,setAgents]=useState<EdgeAgent[]>([]);
 const [routeIPs,setRouteIPs]=useState<RouteIP[]>([]);
 const [networkSearch,setNetworkSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [refreshIn,setRefreshIn]=useState(REFRESH_SECONDS);
 const [checkingNodes,setCheckingNodes]=useState(false);
 const checkingRef=useRef(false);
 const normalizedNetworkSearch=networkSearch.trim().toLowerCase();
 const visibleAgents=useMemo(()=>agents.filter(a=>[a.id,a.region,a.status,a.online?"online":"offline"].some(v=>v.toLowerCase().includes(normalizedNetworkSearch))),[agents,normalizedNetworkSearch]);
 const visibleNodes=useMemo(()=>nodes.filter(node=>[node.id,node.region,...node.addresses,node.online?"online":"offline"].some(value=>value.toLowerCase().includes(normalizedNetworkSearch))),[nodes,normalizedNetworkSearch]);
 const visibleRouteIPs=useMemo(()=>routeIPs.filter(item=>[item.agentId,item.publicIp,item.domain,item.state,item.enabled?"enabled":"disabled"].some(value=>value.toLowerCase().includes(normalizedNetworkSearch))),[routeIPs,normalizedNetworkSearch]);
 const pendingRoutes=routeIPs.some(ip=>ip.enabled&&ip.domain&&ip.state!=="active");
 const pendingRoutesRef=useRef(false);
 pendingRoutesRef.current=pendingRoutes;
 async function refreshNodes(){
  if(checkingRef.current)return;
  checkingRef.current=true;setCheckingNodes(true);
  try{
   const {data}=await apiClient.get<{nodes:DNSNode[]}>("/api/v1/admin/network/dns-controls");
   setNodes(data.nodes);await Promise.all([loadRouteIPs(),loadAgents()]);setError("");
  }catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to refresh DNS controller status")}
  finally{checkingRef.current=false;setCheckingNodes(false);setRefreshIn(pendingRoutesRef.current?PENDING_REFRESH_SECONDS:REFRESH_SECONDS)}
 }
 async function load(){
  setLoading(true);setError("");
  try{const {data}=await apiClient.get<{nodes:DNSNode[]}>("/api/v1/admin/network/dns-controls");setNodes(data.nodes);await Promise.all([loadRouteIPs(),loadAgents()])}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to load DNS controllers")}
  finally{setLoading(false);setRefreshIn(REFRESH_SECONDS)}
 }
 async function loadAgents(){
  try{const {data}=await apiClient.get<{agents:EdgeAgent[]}>("/api/v1/admin/network/agents");setAgents(data.agents)}
  catch{setError("Unable to load authoritative Edge Agent health")}
 }
 async function loadRouteIPs(){
  try {const {data}=await apiClient.get<{addresses:RouteIP[]}>("/api/v1/admin/network/route-agent-ips");setRouteIPs(data.addresses)}
  catch {setError("Unable to load route agent IP inventory")}
 }
 useEffect(()=>{void load()},[]);
 useEffect(()=>{
  const timer=window.setInterval(()=>{
   if(document.visibilityState!=="visible"||checkingRef.current)return;
   setRefreshIn(seconds=>{
    if(seconds<=1){void refreshNodes();return pendingRoutesRef.current?PENDING_REFRESH_SECONDS:REFRESH_SECONDS}
    return Math.min(seconds-1,pendingRoutesRef.current?PENDING_REFRESH_SECONDS:REFRESH_SECONDS);
   });
  },1000);
  return ()=>window.clearInterval(timer);
 },[]);
 useEffect(()=>{if(pendingRoutes)setRefreshIn(seconds=>Math.min(seconds,PENDING_REFRESH_SECONDS))},[pendingRoutes]);

 return <main className="mx-auto max-w-5xl px-6 py-12">
  <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">Network operations</h1><div className="flex items-center gap-3"><span role="status" className="text-sm text-gray-400">{checkingNodes?"Checking DNS controllers…":`Auto-refresh in ${refreshIn}s`}</span><button onClick={()=>{setRefreshIn(REFRESH_SECONDS);void refreshNodes()}} disabled={loading||checkingNodes} className="rounded-lg border px-4 py-2 disabled:opacity-50">Refresh now</button></div></div>
  <p className="mt-3 text-gray-400">DNS controller registration and heartbeat status from the backend registry.</p>
  {error&&<p role="alert" className="mt-4 text-red-400">{error}</p>}
  <label className="mt-6 block text-sm">{locale==="fa"?"جست‌وجوی شبکه":"Search network"}<input type="search" value={networkSearch} onChange={e=>setNetworkSearch(e.target.value)} placeholder={locale==="fa"?"شناسه کنترلر، منطقه، IP، دامنه یا وضعیت":"Controller, region, IP, domain or status"} className="mt-2 block w-full max-w-lg rounded-lg border border-white/20 bg-transparent p-3" /></label>
  {loading?<p className="mt-6">Loading controllers…</p>:<div className="mt-6 space-y-3">
   {visibleNodes.length===0&&<p>{networkSearch?"No matching DNS controllers.":"No registered DNS controllers."}</p>}
   {visibleNodes.map(node=><article key={node.id} className="rounded-xl border border-white/15 bg-white/5 p-5">
    <div className="flex justify-between gap-3"><h2 className="break-all font-semibold">{node.id}</h2><span className={node.online?"text-green-400":"text-amber-300"}>{node.online?"Online":"Offline"}</span></div>
    <p className="mt-2 text-sm text-gray-400">Region: {node.region||"Unspecified"}</p>
    <p className="text-sm text-gray-400">Addresses: {node.addresses.join(", ")||"None"}</p>
    <p className="text-sm text-gray-400">Last registration: {new Date(node.lastSeenAt).toLocaleString()}</p>
   </article>)}
  </div>}
  <section className="mt-8 rounded-xl border border-white/15 p-5">
   <h2 className="font-semibold">{locale==="fa"?"سلامت عامل‌های شبکه":"Edge Agent health"}</h2>
   <p className="mt-2 text-sm text-gray-400">{locale==="fa"?"وضعیت و آخرین ضربان قلب ثبت‌شده در بک‌اند":"Backend-authoritative status, heartbeat freshness and advertised capacity"}</p>
   <div className="mt-4 flex flex-wrap gap-3 text-sm"><span>Online: {agents.filter(a=>a.online).length}</span><span>Offline/stale: {agents.filter(a=>!a.online).length}</span><span>Total: {agents.length}</span></div>
   <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Agent</th><th className="p-2">Region</th><th className="p-2">Health</th><th className="p-2">SNI / Route capacity</th><th className="p-2">Last heartbeat</th></tr></thead>
   <tbody>{visibleAgents.map(a=><tr key={a.id} className="border-t border-white/10"><td className="p-2">{a.id}</td><td className="p-2">{a.region||"—"}</td><td className={a.online?"p-2 text-green-400":"p-2 text-amber-300"}>{a.online?"Online":"Offline / stale"}</td><td className="p-2">{a.sniCapacity} / {a.routeCapacity}</td><td className="p-2">{new Date(a.lastSeenAt).toLocaleString(locale)}</td></tr>)}</tbody></table></div>
   {visibleAgents.length===0&&<p className="mt-3 text-sm text-gray-400">{networkSearch?"No matching Edge Agents.":"No registered Edge Agents."}</p>}
  </section>
  <div className="mt-5"><Link href="/admin/domain-policies" className="text-cyan-300 underline">{locale==="fa"?"مدیریت سیاست‌های تفکیک دامنه":"Manage domain resolution policies"}</Link></div>
  <section className="mt-8 rounded-xl border border-white/15 p-5">
   <h2 className="font-semibold">Edge agent public IP inventory</h2>
   <p className="mt-2 text-sm text-gray-400">Backend-registered routing IPs and their current assignments. Addresses marked free can accept a waiting Full Route domain after allocation is enabled.</p>
   <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Agent</th><th className="p-2">Public IP</th><th className="p-2">Domain</th><th className="p-2">Status</th></tr></thead>
   <tbody>{visibleRouteIPs.map(item=><tr key={item.agentId+item.publicIp} className="border-t border-white/10"><td className="p-2">{item.agentId}</td><td className="p-2">{item.publicIp}</td><td className="p-2">{item.domain||"Free"}</td><td className="p-2">{!item.enabled?"Disabled":item.state||"Available"}</td></tr>)}</tbody></table></div>
   {visibleRouteIPs.length===0&&<p className="mt-3 text-sm text-gray-400">{networkSearch?"No matching edge routing IPs.":"No edge routing IPs registered yet."}</p>}
  </section>
  <Link href="/admin" locale={locale} className="mt-8 inline-block text-cyan-300">Back to admin overview</Link>
 </main>;
}
