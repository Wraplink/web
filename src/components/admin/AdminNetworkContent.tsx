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
 const [nodeType,setNodeType]=useState<"all"|"dns"|"edge">("all");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [refreshIn,setRefreshIn]=useState(REFRESH_SECONDS);
 const [checkingNodes,setCheckingNodes]=useState(false);
 const checkingRef=useRef(false);
 const normalizedNetworkSearch=networkSearch.trim().toLowerCase();
 const unifiedNodes=useMemo(()=>[
  ...nodes.map(node=>({key:"dns:"+node.id,id:node.id,type:"dns" as const,region:node.region,online:node.online,addresses:node.addresses.join(", "),capacity:"—",lastSeenAt:node.lastSeenAt})),
  ...agents.map(agent=>({key:"edge:"+agent.id,id:agent.id,type:"edge" as const,region:agent.region,online:agent.online,addresses:"—",capacity:agent.sniCapacity+" / "+agent.routeCapacity,lastSeenAt:agent.lastSeenAt}))
 ],[nodes,agents]);
 const visibleNodes=useMemo(()=>unifiedNodes.filter(node=>(nodeType==="all"||node.type===nodeType)&&[node.id,node.type,node.type==="dns"?"dns control":"edge agent",node.region,node.addresses,node.capacity,node.online?"online":"offline"].some(value=>value.toLowerCase().includes(normalizedNetworkSearch))),[unifiedNodes,nodeType,normalizedNetworkSearch]);
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
  <section className="mt-8 rounded-xl border border-white/15 p-5">
   <h2 className="font-semibold">{locale==="fa"?"وضعیت کنترلرهای DNS و عامل‌های شبکه":"DNS controllers and Edge Agents"}</h2>
   <p className="mt-2 text-sm text-gray-400">{locale==="fa"?"نمای یکپارچه وضعیت و آخرین فعالیت ثبت‌شده در بک‌اند":"Unified Backend-reported status and last activity"}</p>
   <div className="mt-4 flex flex-wrap gap-3 text-sm"><span>{locale==="fa"?"آنلاین":"Online"}: {unifiedNodes.filter(n=>n.online).length}</span><span>{locale==="fa"?"آفلاین":"Offline/stale"}: {unifiedNodes.filter(n=>!n.online).length}</span><span>{locale==="fa"?"مجموع":"Total"}: {unifiedNodes.length}</span></div>
   <div className="mt-5 flex flex-wrap items-end gap-4">
    <label className="block min-w-0 flex-1 text-sm">{locale==="fa"?"جست‌وجوی شبکه":"Search network"}<input type="search" value={networkSearch} onChange={e=>setNetworkSearch(e.target.value)} placeholder={locale==="fa"?"شناسه، نوع، منطقه، IP یا وضعیت":"ID, type, region, IP or status"} className="mt-2 block w-full rounded-lg border border-white/20 bg-transparent p-3" /></label>
    <label className="block text-sm">{locale==="fa"?"نوع":"Type"}<select value={nodeType} onChange={e=>setNodeType(e.target.value as "all"|"dns"|"edge")} className="mt-2 block w-full rounded-lg border border-white/20 bg-slate-950 p-3"><option value="all">{locale==="fa"?"همه":"All types"}</option><option value="dns">DNS Control</option><option value="edge">Edge Agent</option></select></label>
   </div>
   {loading?<p className="mt-5">{locale==="fa"?"در حال بارگذاری…":"Loading network nodes…"}</p>:<div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm" dir={locale==="fa"?"rtl":"ltr"}><thead><tr><th scope="col" className="p-2">{locale==="fa"?"شناسه":"Node"}</th><th scope="col" className="p-2">{locale==="fa"?"نوع":"Type"}</th><th scope="col" className="p-2">{locale==="fa"?"منطقه":"Region"}</th><th scope="col" className="p-2">{locale==="fa"?"وضعیت":"Health"}</th><th scope="col" className="p-2">{locale==="fa"?"آدرس‌های DNS":"DNS addresses"}</th><th scope="col" className="p-2">{locale==="fa"?"ظرفیت SNI / Route":"SNI / Route capacity"}</th><th scope="col" className="p-2">{locale==="fa"?"آخرین فعالیت":"Last activity"}</th></tr></thead><tbody>{visibleNodes.map(node=><tr key={node.key} className="border-t border-white/10"><td className="p-2 font-medium">{node.id}</td><td className="p-2">{node.type==="dns"?"DNS Control":"Edge Agent"}</td><td className="p-2">{node.region||"—"}</td><td className={node.online?"p-2 text-green-400":"p-2 text-amber-300"}>{node.online?(locale==="fa"?"آنلاین":"Online"):(locale==="fa"?"آفلاین / قدیمی":"Offline / stale")}</td><td className="p-2">{node.addresses||"—"}</td><td className="p-2">{node.capacity}</td><td className="p-2">{node.lastSeenAt?new Date(node.lastSeenAt).toLocaleString(locale):"—"}</td></tr>)}</tbody></table>{visibleNodes.length===0&&<p className="mt-4 text-sm text-gray-400">{locale==="fa"?"موردی مطابق فیلترها یافت نشد.":"No network nodes match your filters."}</p>}</div>}
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
