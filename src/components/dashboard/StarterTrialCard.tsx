"use client";
import {useCallback,useEffect,useState} from "react";
import {apiClient} from "@/lib/api/client";
import {Link} from "@/i18n/navigation";

type Claim={id:string;planId:string;state:string;reservationExpiresAt?:string;activatedAt?:string;subscriptionId?:string;startsAt?:string;expiresAt?:string};
type Activation={claimId:string;subscriptionId:string;startsAt:string;expiresAt:string};
const remaining=(date:string,now:number)=>{
 const seconds=Math.max(0,Math.ceil((new Date(date).getTime()-now)/1000));
 const d=Math.floor(seconds/86400),h=Math.floor(seconds%86400/3600),m=Math.floor(seconds%3600/60),s=seconds%60;
 return [d?d+"d":null,h+"h",m+"m",s+"s"].filter(Boolean).join(" ");
};
export default function StarterTrialCard({locale}:{locale:string}){
 const fa=locale==="fa";
 const [claims,setClaims]=useState<Claim[]>([]);
 const [activation,setActivation]=useState<Activation|null>(null);
 const [now,setNow]=useState(()=>Date.now());
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const load=useCallback(async()=>{
  try{
   const {data}=await apiClient.get<{claims:Claim[]}>("/api/v1/me/starter-claims");
   setClaims(data.claims??[]);setError("");
  }catch{setError(fa?"دریافت پلن آزمایشی ناموفق بود.":"Unable to load trial status.")}
  finally{setLoading(false)}
 },[fa]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 const claim=claims[0];
 if(loading)return <p role="status" className="mt-6 text-slate-400">{fa?"در حال دریافت پلن آزمایشی…":"Loading starter trial…"}</p>;
 if(!claim && !error)return null;
 const reserved=claim?.state==="reserved"&&!!claim.reservationExpiresAt&&new Date(claim.reservationExpiresAt).getTime()>now;
 const expired=claim?.state==="expired"||(claim?.state==="reserved"&&!reserved);
 const active=claim?.state==="active";
 const activeExpiry=claim?.expiresAt??activation?.expiresAt;
 async function activate(){
  if(!claim||busy)return;
  setBusy(true);setError("");
  try{
   const {data}=await apiClient.post<Activation>(`/api/v1/me/starter-claims/${encodeURIComponent(claim.id)}/activate`,{});
   setActivation(data);
   await load();
  }catch(e){
   const status=(e as {response?:{status?:number}}).response?.status;
   setError(status===409?(fa?"رزرو منقضی شده یا اشتراک فعال دیگری دارید.":"Reservation expired or another subscription is active."):(fa?"فعال‌سازی ناموفق بود.":"Trial activation failed."));
  }finally{setBusy(false)}
 }
 return <section className="mt-8 rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-6" dir={fa?"rtl":"ltr"}>
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{fa?"هدیه شروع رایگان":"Your free starter trial"}</h2><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm text-cyan-200">{reserved?(fa?"آماده فعال‌سازی":"Ready to activate"):active?(fa?"فعال":"Active"):expired?(fa?"منقضی شده":"Expired"):claim?.state}</span></div>
  {claim&&<p className="mt-2 text-sm text-slate-400">{fa?"شناسه پلن":"Plan ID"}: {claim.planId}</p>}
  {reserved&&<><p className="mt-4 text-sm text-slate-300">{fa?"زمان باقی‌مانده برای فعال‌سازی":"Time left to activate"}: <strong className="text-white">{remaining(claim.reservationExpiresAt!,now)}</strong></p><p className="mt-2 text-sm text-slate-400">{fa?"مدت آزمایش پس از فعال‌سازی آغاز می‌شود؛ نیازی به پرداخت نیست.":"Your trial time starts after activation. No payment required."}</p><button type="button" disabled={busy} onClick={()=>void activate()} className="mt-4 rounded-xl bg-cyan-400 px-5 py-2 font-bold text-slate-950 disabled:opacity-50">{busy?"…":fa?"فعال‌سازی آزمایشی":"Activate Trial"}</button></>}
  {active&&<><p className="mt-4 text-sm text-emerald-300">{fa?"پلن آزمایشی فعال شده است.":"Your trial is activated."}</p>{activeExpiry&&<p className="mt-2 text-sm">{fa?"زمان باقی‌مانده":"Time remaining"}: {remaining(activeExpiry,now)}</p>}<Link href="/connection" className="mt-4 inline-block rounded-xl border border-cyan-400/40 px-4 py-2 text-cyan-300">{fa?"تنظیم اتصال و DNS":"Set up connection and DNS"}</Link></>}
  {expired&&<p className="mt-4 text-sm text-slate-300">{fa?"فرصت فعال‌سازی پایان یافته است؛ این پیشنهاد فقط یک بار ارائه می‌شود.":"The activation window has expired. This offer is available only once."}</p>}
  {error&&<div role="alert" className="mt-4 text-sm text-red-300">{error}<button type="button" onClick={()=>void load()} className="ms-3 underline">{fa?"تلاش دوباره":"Retry"}</button></div>}
 </section>;
}
