"use client";

import {useCallback, useEffect, useState} from "react";
import {apiClient} from "@/lib/api/client";

type Address = {id:string; ipAddress:string; label:string; verifiedAt?:string; createdAt:string};
type HistoryEvent = {id:string; ipAddress:string; type:string; createdAt:string};
type Collection<T> = {items:T[]};
const base = "/api/v1/me/public-ips";

export default function PublicIPManager({locale}:{locale:string}) {
 const fa=locale==="fa";
 const [addresses,setAddresses]=useState<Address[]>([]);
 const [history,setHistory]=useState<HistoryEvent[]>([]);
 const [observed,setObserved]=useState("");
 const [ip,setIP]=useState("");
 const [label,setLabel]=useState("");
 const [busy,setBusy]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [editLabel,setEditLabel]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const tr=(en:string,persian:string)=>fa?persian:en;
 const refresh=useCallback(async()=>{
  const [saved,events,detected]=await Promise.all([
   apiClient.get<Collection<Address>>(base),
   apiClient.get<Collection<HistoryEvent>>(base+"/history"),
   apiClient.get<{ipAddress:string}>(base+"/observed").catch(()=>({data:{ipAddress:""}}))
  ]);
  setAddresses(saved.data.items??[]);
  setHistory(events.data.items??[]);
  setObserved(detected.data.ipAddress??"");
 },[]);
 useEffect(()=>{
  let active=true;
  refresh().catch(()=>{if(active)setError(fa?"دریافت اطلاعات IP ناموفق بود.":"Could not load IP addresses.");})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false};
 },[refresh,fa]);
 const run=async(action:()=>Promise<unknown>,success:string)=>{
  setBusy(true);setError("");setNotice("");
  try{await action();await refresh();setNotice(success)}
  catch(e:unknown){
   const status=(e as {response?:{status?:number}})?.response?.status;
   setError(status===409?tr("This address is in use or cannot be changed.","این آدرس در حال استفاده است یا قابل تغییر نیست."):
    status===401?tr("Please sign in again.","لطفاً دوباره وارد شوید."):
    status===400?tr("Check the IP address and label.","آدرس IP و عنوان را بررسی کنید."):
    status===422?tr("Your public IPv4 could not be determined. Check your connection.","IP عمومی شما قابل تشخیص نیست. اتصال را بررسی کنید."):
    tr("Operation failed. Please try again.","عملیات ناموفق بود. دوباره تلاش کنید."));
  }finally{setBusy(false)}
 };
 return <section className="mx-auto max-w-4xl space-y-6 px-4 py-10 text-white">
  <header className="space-y-2">
   <h1 className="text-2xl font-bold">{tr("My public IP addresses","آدرس‌های IP من")}</h1>
   <p className="text-sm text-slate-300">{tr("Save and verify IPv4 addresses. Network activation is not available yet.","آدرس‌های IPv4 را ذخیره و تأیید کنید. فعال‌سازی در شبکه هنوز در دسترس نیست.")}</p>
  </header>
  {error&&<p role="alert" className="rounded-lg border border-red-500 p-3 text-red-200">{error}</p>}
  {notice&&<p role="status" className="rounded-lg border border-emerald-600 p-3 text-emerald-200">{notice}</p>}
  <form className="space-y-3 rounded-xl border border-white/20 p-5" onSubmit={e=>{
   e.preventDefault();
   void run(async()=>{await apiClient.post(base+"/",{ipAddress:ip.trim(),label:label.trim()});setIP("");setLabel("")},tr("IP saved.","آدرس IP ذخیره شد."));
  }}>
   <h2 className="font-semibold">{tr("Add an address","افزودن آدرس")}</h2>
   {observed&&<button type="button" disabled={busy} className="text-sm text-sky-300 underline" onClick={()=>setIP(observed)}>
    {tr("Use my current IP: ","استفاده از IP فعلی: ")}{observed}
   </button>}
   <div className="flex flex-wrap gap-3">
    <input aria-label="IPv4" required value={ip} onChange={e=>setIP(e.target.value)} placeholder="203.0.113.10" className="min-w-48 flex-1 rounded border border-white/30 bg-transparent p-2" />
    <input aria-label={tr("Label","عنوان")} value={label} maxLength={100} onChange={e=>setLabel(e.target.value)} placeholder={tr("Home, office...","خانه، محل کار...")} className="min-w-40 flex-1 rounded border border-white/30 bg-transparent p-2" />
    <button disabled={busy} className="rounded bg-sky-600 px-4 py-2 disabled:opacity-50">{tr("Save","ذخیره")}</button>
   </div>
  </form>
  <div className="space-y-3">
   <h2 className="text-lg font-semibold">{tr("Saved addresses","آدرس‌های ذخیره‌شده")}</h2>
   {loading?<p>{tr("Loading...","در حال بارگذاری...")}</p>:addresses.length===0?<p>{tr("No addresses saved.","آدرسی ذخیره نشده است.")}</p>:addresses.map(a=>
    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/20 p-4">
     <div><p className="font-mono" dir="ltr">{a.ipAddress}</p><p className="text-sm text-slate-300">{a.label||"—"}</p>
      <p className="text-xs text-slate-400">{a.verifiedAt?tr("Verified","تأیید شده"):tr("Not verified","تأیید نشده")}</p></div>
     <div className="flex flex-wrap gap-2">
      {editing===a.id?
       <form className="flex gap-2" onSubmit={e=>{
        e.preventDefault();
        void run(async()=>{await apiClient.patch(base+"/"+a.id,{label:editLabel.trim()});setEditing(null)},tr("Label updated.","عنوان به‌روزرسانی شد."));
       }}>
        <input aria-label={tr("New label","عنوان جدید")} value={editLabel} maxLength={100} onChange={e=>setEditLabel(e.target.value)} className="w-36 rounded border border-white/30 bg-transparent p-2"/>
        <button disabled={busy} className="rounded border border-sky-400 px-3 py-2">{tr("Save","ذخیره")}</button>
        <button type="button" onClick={()=>setEditing(null)}>{tr("Cancel","انصراف")}</button>
       </form>:
       <button disabled={busy} className="rounded border border-white/30 px-3 py-2" onClick={()=>{setEditing(a.id);setEditLabel(a.label)}}>{tr("Rename","تغییر عنوان")}</button>}
      {!a.verifiedAt&&<button disabled={busy} className="rounded border border-sky-400 px-3 py-2 disabled:opacity-50" onClick={()=>void run(()=>apiClient.post(base+"/"+a.id+"/verify"),tr("IP verified.","IP تأیید شد."))}>{tr("Verify from this IP","تأیید از همین IP")}</button>}
      <button disabled={busy} className="rounded border border-red-400 px-3 py-2 text-red-200 disabled:opacity-50" onClick={()=>{
       if(window.confirm(tr("Delete this unused address?","این آدرس بدون استفاده حذف شود؟")))void run(()=>apiClient.delete(base+"/"+a.id),tr("IP deleted.","IP حذف شد."));
      }}>{tr("Delete","حذف")}</button>
     </div>
    </div>)}
  </div>
  <div className="space-y-3">
   <h2 className="text-lg font-semibold">{tr("IP history","تاریخچه IP")}</h2>
   {history.length===0?<p className="text-sm text-slate-300">{tr("No history yet.","هنوز سابقه‌ای وجود ندارد.")}</p>:<ul className="space-y-2">{history.map(item=>
    <li key={item.id} className="flex flex-wrap justify-between gap-2 rounded border border-white/15 p-3 text-sm">
     <span><span dir="ltr" className="font-mono">{item.ipAddress}</span> · {item.type}</span>
     <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(fa?"fa-IR":"en-US")}</time>
    </li>)}</ul>}
  </div>
 </section>;
}
