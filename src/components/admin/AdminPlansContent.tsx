"use client";
import {useAdminCapabilities} from "./adminCapabilities";
import {useEffect,useMemo,useRef,useState} from "react";
import {Link} from "@/i18n/navigation";
import {useLocale} from "next-intl";
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {apiClient} from "@/lib/api/client";

type Plan={id:string;code:string;name:string;description:string;priceMinor:number;currency:string;durationDays:number;dataLimitBytes:number;unlimitedBandwidth:boolean;active:boolean;isPopular:boolean;publishAt:string|null;sortOrder:number;createdAt:string;archivedAt:string|null};
type Draft=Omit<Plan,"id"|"createdAt"|"archivedAt">;
const blank:Draft={code:"",name:"",description:"",priceMinor:0,currency:"IRR",durationDays:30,dataLimitBytes:0,unlimitedBandwidth:false,active:false,isPopular:false,publishAt:null,sortOrder:0};
const toLocal=(v:string|null)=>{if(!v)return "";const d=new Date(v);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
export default function AdminPlansContent(){
 const locale=useLocale(),fa=locale==="fa";
 const canManageStarter=useAdminCapabilities().includes("starter_plans");
 const [items,setItems]=useState<Plan[]>([]),[draft,setDraft]=useState<Draft>(blank),[search,setSearch]=useState(""),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [dateInput,setDateInput]=useState("");
 const [allowanceGB,setAllowanceGB]=useState("");
 const [pendingRetirement,setPendingRetirement]=useState<Plan|null>(null);
 const searchInput=useRef<HTMLInputElement>(null);
 const [retiringCode,setRetiringCode]=useState<string|null>(null);
 const [editingCode,setEditingCode]=useState<string|null>(null);
 async function load(){setLoading(true);setError("");try{const {data}=await apiClient.get<{plans:Plan[]}>("/api/v1/admin/plans/");setItems(data.plans??[])}catch(e){setError((e as {response?:{status?:number}}).response?.status===403?(fa?"دسترسی مدیر لازم است.":"Administrator permission required."):(fa?"دریافت پلن‌ها ناموفق بود.":"Unable to load plans."))}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 const filtered=useMemo(()=>items.filter(p=>(p.code+" "+p.name).toLowerCase().includes(search.toLowerCase())),[items,search]);
 const visible=filtered.slice((page-1)*10,page*10);
 const update=<K extends keyof Draft>(key:K,value:Draft[K])=>setDraft(p=>({...p,[key]:value}));
 function edit(p:Plan){setAllowanceGB(p.dataLimitBytes===0?"":String(p.dataLimitBytes/(1024**3)));setEditingCode(p.code);setDraft({code:p.code,name:p.name,description:p.description,priceMinor:p.priceMinor,currency:p.currency,durationDays:p.durationDays,dataLimitBytes:p.dataLimitBytes,unlimitedBandwidth:p.unlimitedBandwidth??false,active:p.active,isPopular:p.isPopular??false,publishAt:p.publishAt,sortOrder:p.sortOrder});setDateInput(toLocal(p.publishAt));setMessage("");window.scrollTo({top:0,behavior:"smooth"})}
 function reset(){setAllowanceGB("");setEditingCode(null);setDraft(blank);setDateInput("");setMessage("")}
 async function confirmRetirement(){
  if(!pendingRetirement||retiringCode!==null)return;
  const plan=pendingRetirement;
  setPendingRetirement(null);
  setRetiringCode(plan.code);setError("");setMessage("");
  try{const {data}=await apiClient.delete<{outcome:"deleted"|"archived"}>(`/api/v1/admin/plans/${encodeURIComponent(plan.code)}`);
   if(editingCode===plan.code)reset();await load();
   setMessage(data.outcome==="archived"?(fa?"پلن بایگانی شد؛ سوابق کاربران حفظ شدند.":"Plan archived; customer history preserved."):(fa?"پلن بدون سابقه حذف شد.":"Unused plan permanently deleted."));
  }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"حذف پلن ناموفق بود.":"Unable to retire plan."))}finally{setRetiringCode(null)}
 }
 async function save(){setSaving(true);setError("");setMessage("");try{
 if(!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(draft.code)||!draft.name.trim()||!Number.isSafeInteger(draft.priceMinor)||draft.priceMinor<0||!Number.isSafeInteger(draft.dataLimitBytes)||draft.dataLimitBytes<0||(draft.unlimitedBandwidth&&draft.dataLimitBytes!==0)||(!draft.unlimitedBandwidth&&draft.dataLimitBytes===0)||!Number.isInteger(draft.durationDays)||draft.durationDays<1){throw new Error(fa?"مقادیر پلن معتبر نیست.":"Invalid plan fields.")}
 const publishAt=dateInput?new Date(dateInput).toISOString():null;
 await apiClient.put("/api/v1/admin/plans/",{...draft,dataLimitBytes:draft.unlimitedBandwidth?0:draft.dataLimitBytes,publishAt});await load();reset();setMessage(fa?"پلن ذخیره شد.":"Plan saved.")
 }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(e instanceof Error?e.message:"Unable to save plan"))}finally{setSaving(false)}}
 const status=(p:Plan)=>p.archivedAt?(fa?"بایگانی‌شده":"Archived"):!p.active?(fa?"غیرفعال":"Disabled"):p.publishAt&&new Date(p.publishAt)>new Date()?(fa?"زمان‌بندی‌شده":"Scheduled"):(fa?"منتشرشده":"Published");
 return <main className="mx-auto max-w-5xl px-6 py-10">
 <div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-bold">{fa?"مدیریت پلن‌ها":"Manage plans"}</h1>{canManageStarter&&<Link href="/admin/starter-plans" className="text-cyan-300">{fa?"پلن‌های شروع رایگان":"Starter Plans"}</Link>}<Link href="/admin" className="text-cyan-300">{fa?"بازگشت به مدیریت":"Admin overview"}</Link></div>
 <p className="mt-3 text-sm text-gray-400">{fa?"پلن فقط در صورت فعال بودن و رسیدن زمان انتشار برای کاربران نمایش داده می‌شود.":"Plans become purchasable only when enabled and their publication date has arrived."}</p>
 {error&&<p role="alert" className="mt-4 text-red-300">{error}</p>}{message&&<p role="status" className="mt-4 text-green-300">{message}</p>}
 <form onSubmit={e=>{e.preventDefault();void save()}} className="mt-6 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 sm:grid-cols-2">
 <label className="text-sm">{fa?"کد پلن":"Code"}<input required disabled={editingCode!==null} value={draft.code} onChange={e=>update("code",e.target.value.toLowerCase())} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 <label className="text-sm">{fa?"نام":"Name"}<input required value={draft.name} onChange={e=>update("name",e.target.value)} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 <label className="text-sm sm:col-span-2">{fa?"توضیحات":"Description"}<textarea value={draft.description} onChange={e=>update("description",e.target.value)} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 {([["priceMinor",fa?"قیمت (واحد خرد)":"Price (minor units)"],["durationDays",fa?"مدت (روز)":"Duration (days)"],["dataLimitBytes",fa?"حجم ترافیک (بایت)":"Data limit (bytes)"],["sortOrder",fa?"ترتیب نمایش":"Sort order"]] as const).map(([key,label])=><label key={key} className="text-sm">{label}<input type="number" min="0" required disabled={key==="dataLimitBytes"&&draft.unlimitedBandwidth} value={draft[key]} onChange={e=>update(key,Number(e.target.value))} className="mt-1 w-full rounded border bg-transparent p-2" /></label>)}
 <label className="text-sm">{fa?"حجم ترافیک (گیگابایت)":"Data allowance (GB)"}<input type="number" min="0" step="any" disabled={draft.unlimitedBandwidth} value={allowanceGB} placeholder={fa?"مثلاً ۱۰":"e.g. 10"} onChange={e=>{const value=e.target.value;setAllowanceGB(value);const gb=Number(value);if(value!==""&&Number.isFinite(gb)&&gb>=0&&Number.isSafeInteger(Math.round(gb*1024**3)))update("dataLimitBytes",Math.round(gb*1024**3));}} className="mt-1 w-full rounded border bg-transparent p-2" /><span className="mt-1 block text-xs text-gray-400">{fa?"مقدار بالا به بایت تبدیل می‌شود؛ نامحدود با گزینه مستقل تنظیم می‌شود.":"Converted to bytes automatically; unlimited is configured separately."}</span></label>
 <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.unlimitedBandwidth} onChange={e=>{update("unlimitedBandwidth",e.target.checked);if(e.target.checked){update("dataLimitBytes",0);setAllowanceGB("")}}} />{fa?"پهنای باند نامحدود":"Unlimited bandwidth"}</label>
 <label className="text-sm">{fa?"ارز":"Currency"}<input maxLength={3} required value={draft.currency} onChange={e=>update("currency",e.target.value.toUpperCase())} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 <label className="text-sm">{fa?"تاریخ انتشار (اختیاری)":"Publish date (optional)"}<input type="datetime-local" value={dateInput} onChange={e=>setDateInput(e.target.value)} className="mt-1 w-full rounded border bg-slate-900 p-2" /></label>
 <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isPopular} onChange={e=>update("isPopular",e.target.checked)} />{fa?"محبوب‌ترین / پیشنهاد ویژه":"Most popular / Featured"}</label>
 <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={e=>update("active",e.target.checked)} />{fa?"فعال":"Enabled"}</label>
 <div className="flex gap-3 sm:col-span-2"><button disabled={saving} className="rounded bg-cyan-500 px-5 py-2 font-semibold text-black disabled:opacity-50">{saving?"…":fa?"ذخیره پلن":"Save plan"}</button><button type="button" onClick={reset} className="rounded border px-5 py-2">{fa?"پلن جدید":"New plan"}</button></div>
 </form>
 <div className="mt-8 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{fa?"پلن‌های موجود":"Existing plans"}</h2><input ref={searchInput} type="search" aria-label={fa?"جستجوی پلن":"Search plans"} placeholder={fa?"جستجو":"Search"} value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="rounded border bg-transparent p-2" /></div>
 {loading?<p className="mt-5">{fa?"در حال دریافت…":"Loading…"}</p>:<div className="mt-4 space-y-3">{visible.map(p=><article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 p-4"><div><strong>{p.name}</strong> <span className="text-sm text-gray-400">({p.code})</span><p className="text-sm text-gray-400">{status(p)}{p.isPopular?(fa?" · محبوب‌ترین":" · Most popular"):""} · {p.priceMinor.toLocaleString()} {p.currency}{p.publishAt?" · "+new Date(p.publishAt).toLocaleString(locale==="fa"?"fa-IR":"en-US"):""}</p></div><div className="flex gap-2"><button disabled={!!p.archivedAt} onClick={()=>edit(p)} className="rounded border px-4 py-2 disabled:opacity-40">{fa?"ویرایش":"Edit"}</button><button disabled={retiringCode!==null||!!p.archivedAt} onClick={()=>setPendingRetirement(p)} className="rounded border border-red-400/50 px-4 py-2 text-red-300 disabled:opacity-40">{retiringCode===p.code?"…":fa?"حذف / بایگانی":"Delete / Archive"}</button></div></article>)}{visible.length===0&&<p>{fa?"پلنی یافت نشد.":"No plans found."}</p>}</div>}
 <div className="mt-4 flex items-center justify-between"><span className="text-sm">{filtered.length} {fa?"پلن":"plans"}</span><div className="flex gap-3"><button disabled={page===1} onClick={()=>setPage(v=>v-1)} className="rounded border px-3 py-1 disabled:opacity-40">{fa?"قبلی":"Previous"}</button><span>{page}</span><button disabled={page*10>=filtered.length} onClick={()=>setPage(v=>v+1)} className="rounded border px-3 py-1 disabled:opacity-40">{fa?"بعدی":"Next"}</button></div></div>
 <Dialog open={pendingRetirement!==null} onOpenChange={open=>{if(!open)setPendingRetirement(null)}}>
  <DialogContent dir={fa?"rtl":"ltr"} finalFocus={searchInput} showCloseButton={false} className="border border-white/15 bg-slate-950 text-white">
   {pendingRetirement&&<>
    <DialogHeader>
     <DialogTitle>{fa?"پلن حذف یا بایگانی شود؟":"Delete or archive plan?"}</DialogTitle>
     <DialogDescription className="text-gray-300">
      <bdi className="block break-all font-medium text-white">{pendingRetirement.name}</bdi>
      <span className="mt-2 block">{fa?"پلن دارای سابقه خرید بایگانی می‌شود و سوابق کاربران حفظ می‌شود. پلن بدون سابقه خرید برای همیشه حذف می‌شود.":"Plans with purchase history are archived and customer records are preserved. Plans without purchase history are permanently deleted."}</span>
     </DialogDescription>
    </DialogHeader>
    <DialogFooter className="border-white/15 bg-white/5">
     <DialogClose className="rounded-lg border border-white/20 px-4 py-2">{fa?"انصراف":"Cancel"}</DialogClose>
     <button type="button" onClick={()=>void confirmRetirement()} className="rounded-lg bg-red-700 px-4 py-2">{fa?"حذف / بایگانی":"Delete / Archive"}</button>
    </DialogFooter>
   </>}
  </DialogContent>
 </Dialog>
 </main>
}
