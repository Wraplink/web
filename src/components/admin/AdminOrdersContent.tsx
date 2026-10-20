"use client";
import {useEffect,useState} from "react";
import {adminOrders,type AdminOrder} from "@/lib/api/admin";
export default function AdminOrdersContent(){
 const [items,setItems]=useState<AdminOrder[]>([]);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function load(){setBusy(true);setError("");try{setItems(await adminOrders())}catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to load orders")}finally{setBusy(false)}}
 useEffect(()=>{void load()},[]);
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold">Order management</h1><button disabled={busy} onClick={()=>void load()} className="rounded-lg border px-4 py-2">Refresh</button></div>
  {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}
  <div className="overflow-x-auto rounded-xl border border-white/15"><table className="w-full text-left text-sm">
   <thead className="bg-white/10"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Receipt</th><th className="p-3">Amount (minor)</th><th className="p-3">Created</th></tr></thead>
   <tbody>{items.map(o=><tr key={o.id} className="border-t border-white/10"><td className="p-3 font-mono text-xs">{o.id}</td><td className="p-3">{o.email}</td><td className="p-3">{o.status}</td><td className="p-3">{o.receiptStatus||"—"}</td><td className="p-3">{o.amountMinor} {o.currency}</td><td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
  </table></div><p className="mt-3 text-xs text-gray-500">Latest 100 orders. Receipt decisions are available in Payment reviews.</p>
 </main>;
}
