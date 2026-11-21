"use client";
import {Link} from "@/i18n/navigation";
import {useEffect,useMemo,useRef,useState} from "react";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type RouteIP={agentId:string;publicIp:string;enabled:boolean;lastSeenAt:string|null;domain:string;state:string};
type EdgeAgent={id:string;region:string;status:string;sniCapacity:number;routeCapacity:number;registeredAt:string;lastSeenAt:string;online:boolean;fullRouteStatus?:string};
type DNSNode={id:string;region:string;addresses:string[];lastSeenAt:string;online:boolean};

type FullRouteStatus="offline"|"unavailable"|"disabled"|"provisioned"|"unknown";
function fullRouteStatus(agent:EdgeAgent):FullRouteStatus{
 if(!agent.online)return "offline";
 if(agent.fullRouteStatus==="disabled"||agent.fullRouteStatus==="unavailable"||agent.fullRouteStatus==="provisioned")return agent.fullRouteStatus;
 return "unknown";
}
const REFRESH_SECONDS=15;
const PENDING_REFRESH_SECONDS=3;

export default function AdminNetworkContent(){
 const locale=useLocale();
 const [nodes,setNodes]=useState<DNSNode[]>([]);
 const [agents,setAgents]=useState<EdgeAgent[]>([]);
 const [routeIPs,setRouteIPs]=useState<RouteIP[]>([]);
 const [networkSearch,setNetworkSearch]=useState("");
 const [nodeType,setNodeType]=useState<"all"|"dns"|"edge">("all");
 const [fullRouteFilter,setFullRouteFilter]=useState<"all"|FullRouteStatus>("all");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [refreshIn,setRefreshIn]=useState(REFRESH_SECONDS);
 const [checkingNodes,setCheckingNodes]=useState(false);
 const [deletingNode,setDeletingNode]=useState<string|null>(null);
 const [deleteTarget,setDeleteTarget]=useState<{id:string;type:"dns"|"edge";region:string}|null>(null);
 const checkingRef=useRef(false);
 const normalizedNetworkSearch=networkSearch.trim().toLowerCase();
 const unifiedNodes=useMemo(()=>[
  ...nodes.map(node=>({key:"dns:"+node.id,id:node.id,type:"dns" as const,region:node.region,online:node.online,addresses:node.addresses.join(", "),capacity:"—",fullRoute:null as FullRouteStatus|null,lastSeenAt:node.lastSeenAt})),
  ...agents.map(agent=>({key:"edge:"+agent.id,id:agent.id,type:"edge" as const,region:agent.region,online:agent.online,addresses:"—",capacity:agent.sniCapacity+" / "+agent.routeCapacity,fullRoute:fullRouteStatus(agent) as FullRouteStatus|null,lastSeenAt:agent.lastSeenAt}))
 ],[nodes,agents]);
 const visibleNodes=useMemo(()=>unifiedNodes.filter(node=>(nodeType==="all"||node.type===nodeType)&&(fullRouteFilter==="all"||node.fullRoute===fullRouteFilter)&&[node.id,node.type,node.type==="dns"?"dns control":"edge agent",node.region,node.addresses,node.capacity,node.online?"online":"offline",node.fullRoute||""].some(value=>value.toLowerCase().includes(normalizedNetworkSearch))),[unifiedNodes,nodeType,fullRouteFilter,normalizedNetworkSearch]);
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
 async function removeNode(){
  if(!deleteTarget||deletingNode)return;
  const target=deleteTarget;
  setDeletingNode(target.type+":"+target.id);setError("");
  try{
   await apiClient.delete(`/api/v1/admin/network/nodes/${target.type}/${encodeURIComponent(target.id)}`);
   setDeleteTarget(null);
   await refreshNodes();
  }catch(e){
   const status=(e as {response?:{status?:number;data?:{error?:string}}}).response?.status;
   setError(status===409?(locale==="fa"?"نود هنوز فعال است یا دارای آدرس مسیریابی ثبت‌شده است. ابتدا منابع مسیریابی را آزاد کنید.":"Node is still active or has registered route IP inventory. Retire route resources first."):status===403?(locale==="fa"?"دسترسی مدیر لازم است.":"Administrator permission required."):(locale==="fa"?"حذف نود ناموفق بود.":"Failed to remove node."));
  }finally{setDeletingNode(null)}
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
  <p className="mt-3"><Link href="/admin/network/online-users" className="text-cyan-300 underline">{locale==="fa"?"کاربران آنلاین شبکه":"Online network sessions"}</Link></p>
  {error&&<p role="alert" className="mt-4 text-red-400">{error}</p>}
  <section className="mt-8 rounded-xl border border-white/15 p-5">
   <h2 className="font-semibold">{locale==="fa"?"وضعیت کنترلرهای DNS و عامل‌های شبکه":"DNS controllers and Edge Agents"}</h2>
   <p className="mt-2 text-sm text-gray-400">{locale==="fa"?"نمای یکپارچه وضعیت و آخرین فعالیت ثبت‌شده در بک‌اند":"Unified Backend-reported status and last activity"}</p>
   <div className="mt-4 flex flex-wrap gap-3 text-sm"><span>{locale==="fa"?"آنلاین":"Online"}: {unifiedNodes.filter(n=>n.online).length}</span><span>{locale==="fa"?"آفلاین":"Offline/stale"}: {unifiedNodes.filter(n=>!n.online).length}</span><span>{locale==="fa"?"مجموع":"Total"}: {unifiedNodes.length}</span></div>
   <div className="mt-5 flex flex-wrap items-end gap-4">
    <label className="block min-w-0 flex-1 text-sm">{locale==="fa"?"جست‌وجوی شبکه":"Search network"}<input type="search" value={networkSearch} onChange={e=>setNetworkSearch(e.target.value)} placeholder={locale==="fa"?"شناسه، نوع، منطقه، IP یا وضعیت":"ID, type, region, IP or status"} className="mt-2 block w-full rounded-lg border border-white/20 bg-transparent p-3" /></label>
    <label className="block text-sm">{locale==="fa"?"نوع":"Type"}<select value={nodeType} onChange={e=>setNodeType(e.target.value as "all"|"dns"|"edge")} className="mt-2 block w-full rounded-lg border border-white/20 bg-slate-950 p-3"><option value="all">{locale==="fa"?"همه":"All types"}</option><option value="dns">DNS Control</option><option value="edge">Edge Agent</option></select></label>
    <label className="block text-sm">{locale==="fa"?"وضعیت Full Route":"Full Route status"}<select value={fullRouteFilter} onChange={e=>setFullRouteFilter(e.target.value as "all"|FullRouteStatus)} className="mt-2 block w-full rounded-lg border border-white/20 bg-slate-950 p-3"><option value="all">{locale==="fa"?"همه":"All"}</option><option value="provisioned">{locale==="fa"?"آماده تخصیص":"Provisioned"}</option><option value="disabled">{locale==="fa"?"غیرفعال":"Disabled"}</option><option value="offline">{locale==="fa"?"آفلاین":"Offline"}</option><option value="unavailable">{locale==="fa"?"بدون آی‌پی مسیر":"Unavailable"}</option><option value="unknown">{locale==="fa"?"نامشخص":"Unknown"}</option></select></label>
   </div>
   {loading?<p className="mt-5">{locale==="fa"?"در حال بارگذاری…":"Loading network nodes…"}</p>:<div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm" dir={locale==="fa"?"rtl":"ltr"}><thead><tr><th scope="col" className="p-2">{locale==="fa"?"شناسه":"Node"}</th><th scope="col" className="p-2">{locale==="fa"?"نوع":"Type"}</th><th scope="col" className="p-2">{locale==="fa"?"منطقه":"Region"}</th><th scope="col" className="p-2">{locale==="fa"?"وضعیت":"Health"}</th><th scope="col" className="p-2">{locale==="fa"?"آدرس‌های DNS":"DNS addresses"}</th><th scope="col" className="p-2">{locale==="fa"?"وضعیت Full Route":"Full Route status"}</th><th scope="col" className="p-2">{locale==="fa"?"ظرفیت SNI / Route":"SNI / Route capacity"}</th><th scope="col" className="p-2">{locale==="fa"?"آخرین فعالیت":"Last activity"}</th><th scope="col" className="p-2">{locale==="fa"?"عملیات":"Actions"}</th></tr></thead><tbody>{visibleNodes.map(node=><tr key={node.key} className="border-t border-white/10"><td className="p-2 font-medium">{node.id}</td><td className="p-2">{node.type==="dns"?"DNS Control":"Edge Agent"}</td><td className="p-2">{node.region||"—"}</td><td className={node.online?"p-2 text-green-400":"p-2 text-amber-300"}>{node.online?(locale==="fa"?"آنلاین":"Online"):(locale==="fa"?"آفلاین / قدیمی":"Offline / stale")}</td><td className="p-2">{node.addresses||"—"}</td><td className={node.fullRoute==="provisioned"?"p-2 text-green-400":node.fullRoute==="offline"?"p-2 text-red-400":"p-2 text-amber-300"}>{node.fullRoute===null?"—":node.fullRoute==="provisioned"?(locale==="fa"?"آماده تخصیص (تأیید نشده)":"Provisioned (unverified)"):node.fullRoute==="offline"?(locale==="fa"?"آفلاین":"Offline"):node.fullRoute==="disabled"?(locale==="fa"?"غیرفعال":"Disabled"):node.fullRoute==="unknown"?(locale==="fa"?"نامشخص (نیازمند به‌روزرسانی بک‌اند)":"Unknown (update backend)"):(locale==="fa"?"ناموجود":"Unavailable")}</td><td className="p-2">{node.capacity}</td><td className="p-2">{node.lastSeenAt?new Date(node.lastSeenAt).toLocaleString(locale):"—"}</td><td className="p-2"><button type="button" disabled={node.online||!!deletingNode} onClick={()=>setDeleteTarget({id:node.id,type:node.type,region:node.region})} className="rounded border border-red-400/50 px-3 py-1 text-red-300 disabled:cursor-not-allowed disabled:opacity-30" title={node.online?(locale==="fa"?"نود آنلاین قابل حذف نیست":"Online nodes cannot be removed"):undefined}>{locale==="fa"?"حذف":"Remove"}</button></td></tr>)}</tbody></table>{visibleNodes.length===0&&<p className="mt-4 text-sm text-gray-400">{locale==="fa"?"موردی مطابق فیلترها یافت نشد.":"No network nodes match your filters."}</p>}</div>}
  </section>
  {deleteTarget&&<div role="dialog" aria-modal="true" aria-labelledby="delete-node-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-950 p-6"><h2 id="delete-node-title" className="text-lg font-semibold">{locale==="fa"?"تأیید حذف نود":"Confirm node removal"}</h2><p className="mt-3 text-sm text-gray-300">{deleteTarget.id} · {deleteTarget.type==="dns"?"DNS Control":"Edge Agent"} · {deleteTarget.region||"—"}</p><p className="mt-3 text-sm text-amber-200">{locale==="fa"?"حذف فقط برای نود آفلاین و بدون تخصیص فعال مجاز است.":"Only offline nodes without active assignments can be removed."}</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={!!deletingNode} onClick={()=>setDeleteTarget(null)} className="rounded-lg border px-4 py-2">{locale==="fa"?"انصراف":"Cancel"}</button><button type="button" disabled={!!deletingNode} onClick={()=>void removeNode()} className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50">{deletingNode?(locale==="fa"?"در حال حذف…":"Removing…"):(locale==="fa"?"حذف نود":"Remove node")}</button></div></div></div>}
  <div className="mt-5 flex flex-wrap gap-5"><Link href="/admin/network/dns-queries" className="text-cyan-300 underline">{locale==="fa"?"پایش درخواست‌های DNS":"Monitor DNS queries"}</Link><Link href="/admin/domain-policies" className="text-cyan-300 underline">{locale==="fa"?"مدیریت سیاست‌های تفکیک دامنه":"Manage domain resolution policies"}</Link></div>
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
