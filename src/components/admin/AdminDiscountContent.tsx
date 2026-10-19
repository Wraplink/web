"use client";
import {useEffect,useState} from "react";
import {createAdminDiscount,disableAdminDiscount,listAdminDiscounts,type AdminDiscount} from "@/lib/api/adminDiscounts";

export default function AdminDiscountContent(){
 const [items,setItems]=useState<AdminDiscount[]>([]);
 const [code,setCode]=useState("");
 const [kind,setKind]=useState<"percent"|"fixed">("percent");
 const [value,setValue]=useState("");
 const [currency,setCurrency]=useState("USD");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [denied,setDenied]=useState(false);
 async function refresh(){
  try{setItems(await listAdminDiscounts());setDenied(false)}
  catch(e){if((e as {response?:{status?:number}}).response?.status===403)setDenied(true);else setError("Unable to load discounts")}
 }
 useEffect(()=>{void refresh()},[]);
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");
  try{
   const amount=Number(value);
   if(!Number.isSafeInteger(amount)||amount<=0||(kind==="percent"&&amount>10000))throw new Error("Invalid discount value");
   await createAdminDiscount({code:code.trim().toUpperCase(),discountType:kind,discountValue:amount,currency:kind==="fixed"?currency.toUpperCase():null,active:true,startsAt:null,expiresAt:null,maxRedemptions:null});
   setCode("");setValue("");await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Failed to create discount")}
  finally{setBusy(false)}
 }
 async function disable(id:string){
  if(!window.confirm("Disable this discount code?"))return;
  setBusy(true);setError("");
  try{await disableAdminDiscount(id);await refresh()}catch{setError("Failed to disable discount")}finally{setBusy(false)}
 }
 return <main className="mx-auto max-w-5xl px-6 py-12">
  <h1 className="mb-4 text-3xl font-bold">Discount management</h1>
  {denied?<p role="alert">You do not have permission to manage discounts.</p>:<>
   {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}
   <form onSubmit={submit} className="mb-8 grid gap-4 rounded-xl border border-white/20 p-5 sm:grid-cols-2">
    <label>Code<input required minLength={3} maxLength={64} value={code} onChange={e=>setCode(e.target.value)} className="mt-2 w-full rounded border bg-transparent p-2"/></label>
    <label>Type<select value={kind} onChange={e=>setKind(e.target.value as "percent"|"fixed")} className="mt-2 w-full rounded border bg-gray-900 p-2"><option value="percent">Percentage (basis points)</option><option value="fixed">Fixed amount (minor units)</option></select></label>
    <label>Value<input required type="number" min={1} step={1} value={value} onChange={e=>setValue(e.target.value)} className="mt-2 w-full rounded border bg-transparent p-2"/></label>
    {kind==="fixed"&&<label>Currency<input required maxLength={3} value={currency} onChange={e=>setCurrency(e.target.value)} className="mt-2 w-full rounded border bg-transparent p-2"/></label>}
    <button disabled={busy} className="rounded bg-cyan-600 p-3 disabled:opacity-50">Create discount</button>
   </form>
   <div className="space-y-3">{items.map(item=><article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/20 p-4">
    <div><strong>{item.code}</strong><p className="text-sm text-gray-400">{item.discountType==="percent"?String(item.discountValue/100)+"%":String(item.discountValue)+" "+item.currency+" minor units"} · {item.redemptions} uses · {item.active?"Active":"Disabled"}</p></div>
    {item.active&&<button disabled={busy} onClick={()=>void disable(item.id)} className="rounded border border-red-500 px-3 py-2 text-red-300">Disable</button>}
   </article>)}</div>
  </>}
 </main>;
}
