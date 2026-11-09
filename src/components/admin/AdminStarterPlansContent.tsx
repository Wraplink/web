"use client";
import {useEffect,useState} from "react";
import {useLocale} from "next-intl";
import {Link} from "@/i18n/navigation";
import {apiClient} from "@/lib/api/client";

type Plan={id:string;name:string;code:string;priceMinor:number;active:boolean;archivedAt:string|null};
type Policy={id:string;planId:string;enabled:boolean;priority:number;region:string;assignmentTrigger:string;activationTrigger:string;reservationTtlSeconds:number;trialDurationSeconds:number};
export default function AdminStarterPlansContent(){
 const fa=useLocale()==="fa";
 const [plans,setPlans]=useState<Plan[]>([]);
 const [policies,setPolicies]=useState<Policy[]>([]);
 const [planId,setPlanId]=useState("");
 const [minutes,setMinutes]=useState(60);
 const [days,setDays]=useState(7);
 const [priority,setPriority]=useState(0);
 const [region,setRegion]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 async function load(){
  setLoading(true);setError("");
  try{
   const [p,s]=await Promise.all([
    apiClient.get<{plans:Plan[]}>("/api/v1/admin/plans/"),
    apiClient.get<{policies:Policy[]}>("/api/v1/admin/starter-policies/")
   ]);
   setPlans(p.data.plans??[]);setPolicies(s.data.policies??[]);
  }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"دریافت اطلاعات ناموفق بود.":"Unable to load starter policies."))}
  finally{setLoading(false)}
 }
 useEffect(()=>{void load()},[]);
 async function create(e:React.FormEvent){
  e.preventDefault();setError("");setNotice("");
  if(!planId||!Number.isSafeInteger(minutes)||minutes<1||!Number.isSafeInteger(days)||days<1||!Number.isSafeInteger(priority)){setError(fa?"مقادیر معتبر نیست.":"Invalid policy values.");return}
  setSaving(true);
  try{
   await apiClient.post("/api/v1/admin/starter-policies/",{
    planId,enabled:false,priority,region:region.trim(),
    assignmentTrigger:"email_verified",activationTrigger:"manual",
    reservationTtlSeconds:days*86400,trialDurationSeconds:minutes*60
   });
   setNotice(fa?"سیاست ساخته شد. پس از بررسی آن را فعال کنید.":"Policy created disabled. Review it before enabling.");
   await load();
  }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"ساخت سیاست ناموفق بود.":"Could not create policy."))}
  finally{setSaving(false)}
 }
 async function toggle(p:Policy){
  if(p.enabled&&!window.confirm(fa?"سیاست غیرفعال شود؟ رزروهای قبلی باقی می‌مانند.":"Disable this policy? Existing reservations remain."))return;
  setBusy(p.id);setError("");setNotice("");
  try{
   await apiClient.patch(`/api/v1/admin/starter-policies/${encodeURIComponent(p.id)}`,{enabled:!p.enabled});
   await load();
   setNotice(fa?"وضعیت سیاست به‌روز شد.":"Policy status updated.");
  }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"به‌روزرسانی ناموفق بود.":"Could not update policy."))}
  finally{setBusy(null)}
 }
 const eligible=plans.filter(p=>p.active&&!p.archivedAt&&p.priceMinor===0);
 return <main className="mx-auto max-w-5xl px-6 py-10" dir={fa?"rtl":"ltr"}>
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">{fa?"پلن‌های شروع رایگان":"Starter Plans"}</h1><Link href="/admin/plans" className="text-cyan-300">{fa?"مدیریت پلن‌ها":"Manage plans"}</Link></div>
  <p className="mt-3 text-sm text-slate-400">{fa?"پس از تأیید ایمیل، یک پلن رایگان برای کاربر جدید رزرو می‌شود. زمان استفاده با فعال‌سازی دستی شروع می‌شود.":"Reserve one free trial after email verification. The trial countdown starts only when the user activates it."}</p>
  {error&&<p role="alert" className="mt-4 text-red-300">{error}</p>}{notice&&<p role="status" className="mt-4 text-green-300">{notice}</p>}
  <form onSubmit={create} className="mt-6 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 sm:grid-cols-2">
   <label className="text-sm">{fa?"پلن رایگان":"Free plan"}<select required value={planId} onChange={e=>setPlanId(e.target.value)} className="mt-1 w-full rounded border border-white/20 bg-slate-900 p-2"><option value="">{fa?"انتخاب کنید":"Select a plan"}</option>{eligible.map(p=><option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}</select></label>
   <label className="text-sm">{fa?"مدت آزمایشی (دقیقه)":"Trial duration (minutes)"}<input type="number" min={1} max={525600} required value={minutes} onChange={e=>setMinutes(Number(e.target.value))} className="mt-1 w-full rounded border bg-transparent p-2"/></label>
   <label className="text-sm">{fa?"اعتبار رزرو (روز)":"Reservation TTL (days)"}<input type="number" min={1} max={365} required value={days} onChange={e=>setDays(Number(e.target.value))} className="mt-1 w-full rounded border bg-transparent p-2"/></label>
   <label className="text-sm">{fa?"اولویت":"Priority"}<input type="number" required value={priority} onChange={e=>setPriority(Number(e.target.value))} className="mt-1 w-full rounded border bg-transparent p-2"/></label>
   <label className="text-sm sm:col-span-2">{fa?"منطقه (فعلاً خالی بگذارید)":"Region (leave blank for currently supported global assignment)"}<input value={region} onChange={e=>setRegion(e.target.value)} disabled placeholder={fa?"همه مناطق":"All regions"} className="mt-1 w-full rounded border bg-transparent p-2 disabled:opacity-60"/></label>
   <p className="text-xs text-slate-400 sm:col-span-2">{fa?"سیاست جدید ابتدا غیرفعال ایجاد می‌شود. فقط پلن‌های فعال و رایگان قابل انتخاب‌اند.":"New policies start disabled. Only active, zero-price plans can be selected."}</p>
   <button disabled={saving||!eligible.length} className="rounded bg-cyan-400 px-5 py-2 font-semibold text-slate-950 disabled:opacity-50">{saving?"…":fa?"ایجاد سیاست":"Create policy"}</button>
  </form>
  <h2 className="mt-9 text-xl font-bold">{fa?"سیاست‌های موجود":"Existing policies"}</h2>
  {loading?<p className="mt-4 text-slate-400">{fa?"در حال بارگذاری…":"Loading…"}</p>:policies.length===0?<p className="mt-4 text-slate-400">{fa?"هنوز سیاستی ایجاد نشده است.":"No starter policies yet."}</p>:<div className="mt-4 space-y-3">{policies.map(p=><article key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 p-4"><div><h3 className="font-semibold">{plans.find(x=>x.id===p.planId)?.name??p.planId}</h3><p className="mt-1 text-sm text-slate-400">{fa?"مدت":"Duration"}: {p.trialDurationSeconds/60} {fa?"دقیقه":"min"} · TTL: {p.reservationTtlSeconds/86400} {fa?"روز":"days"} · {fa?"اولویت":"Priority"}: {p.priority}</p><p className="text-xs text-slate-500">{p.assignmentTrigger} · {p.activationTrigger} · {p.region||"global"}</p></div><button disabled={busy!==null} onClick={()=>void toggle(p)} className={`rounded border px-4 py-2 disabled:opacity-50 ${p.enabled?"border-amber-400/40 text-amber-300":"border-cyan-400/40 text-cyan-300"}`}>{busy===p.id?"…":p.enabled?(fa?"غیرفعال کردن":"Disable"):(fa?"فعال کردن":"Enable")}</button></article>)}</div>}
 </main>;
}
