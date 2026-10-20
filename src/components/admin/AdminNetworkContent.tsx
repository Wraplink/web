"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type DNSNode={id:string;region:string;addresses:string[];lastSeenAt:string;online:boolean};

export default function AdminNetworkContent(){
 const locale=useLocale();
 const prefix=locale==="fa"?"/fa":"";
 const [nodes,setNodes]=useState<DNSNode[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 async function load(){
  setLoading(true);setError("");
  try{const {data}=await apiClient.get<{nodes:DNSNode[]}>("/api/v1/admin/network/dns-controls");setNodes(data.nodes)}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to load DNS controllers")}
  finally{setLoading(false)}
 }
 useEffect(()=>{void load()},[]);
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
  <div className="mt-8 rounded-xl border border-white/15 p-5"><h2 className="font-semibold">Edge agents and routing</h2><p className="mt-2 text-sm text-gray-400">Live agent inventory, allocation policies and routing actions require a separately authenticated dns-control integration. No operational controls are exposed until that connection is secured.</p></div>
  <Link href={prefix+"/admin"} className="mt-8 inline-block text-cyan-300">Back to admin overview</Link>
 </main>;
}
