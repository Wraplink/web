"use client";
import {useEffect,useMemo,useState} from "react";
import {Link} from "@/i18n/navigation";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type Plan={id:string;code:string;name:string;description:string;priceMinor:number;currency:string;durationDays:number;dataLimitBytes:number;active:boolean;isPopular:boolean;publishAt:string|null;sortOrder:number;createdAt:string;archivedAt:string|null};
type Draft=Omit<Plan,"id"|"createdAt"|"archivedAt">;
const blank:Draft={code:"",name:"",description:"",priceMinor:0,currency:"IRR",durationDays:30,dataLimitBytes:0,active:false,isPopular:false,publishAt:null,sortOrder:0};
const toLocal=(v:string|null)=>{if(!v)return "";const d=new Date(v);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
export default function AdminPlansContent(){
 const locale=useLocale(),fa=locale==="fa";
 const [items,setItems]=useState<Plan[]>([]),[draft,setDraft]=useState<Draft>(blank),[search,setSearch]=useState(""),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [dateInput,setDateInput]=useState("");
 const [retiringCode,setRetiringCode]=useState<string|null>(null);
 const [editingCode,setEditingCode]=useState<string|null>(null);
 async function load(){setLoading(true);setError("");try{const {data}=await apiClient.get<{plans:Plan[]}>("/api/v1/admin/plans/");setItems(data.plans??[])}catch(e){setError((e as {response?:{status?:number}}).response?.status===403?(fa?"دسترسی مدیر لازم است.":"Administrator permission required."):(fa?"دریافت پلن‌ها ناموفق بود.":"Unable to load plans."))}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 const filtered=useMemo(()=>items.filter(p=>(p.code+" "+p.name).toLowerCase().includes(search.toLowerCase())),[items,search]);
 const visible=filtered.slice((page-1)*10,page*10);
 const update=<K extends keyof Draft>(key:K,value:Draft[K])=>setDraft(p=>({...p,[key]:value}));
 function edit(p:Plan){setEditingCode(p.code);setDraft({code:p.code,name:p.name,description:p.description,priceMinor:p.priceMinor,currency:p.currency,durationDays:p.durationDays,dataLimitBytes:p.dataLimitBytes,active:p.active,isPopular:p.isPopular??false,publishAt:p.publishAt,sortOrder:p.sortOrder});setDateInput(toLocal(p.publishAt));setMessage("");window.scrollTo({top:0,behavior:"smooth"})}
 function reset(){setEditingCode(null);setDraft(blank);setDateInput("");setMessage("")}
 async function retire(p:Plan){
  const confirmation=fa?`پلن «${p.name}» حذف شود؟ اگر سابقه خرید داشته باشد بایگانی می‌شود و تاریخچه کاربران حفظ خواهد شد.`:`Remove "${p.name}"? Plans with purchase history will be archived; customer records are preserved.`;
  if(!window.confirm(confirmation))return;
  setRetiringCode(p.code);setError("");setMessage("");
  try{const {data}=await apiClient.delete<{outcome:"deleted"|"archived"}>(`/api/v1/admin/plans/${encodeURIComponent(p.code)}`);
   if(editingCode===p.code)reset();await load();
   setMessage(data.outcome==="archived"?(fa?"پلن بایگانی شد؛ سوابق کاربران حفظ شدند.":"Plan archived; customer history preserved."):(fa?"پلن بدون سابقه حذف شد.":"Unused plan permanently deleted."));
  }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"حذف پلن ناموفق بود.":"Unable to retire plan."))}finally{setRetiringCode(null)}
 }
 async function save(){setSaving(true);setError("");setMessage("");try{
 if(!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(draft.code)||!draft.name.trim()||!Number.isSafeInteger(draft.priceMinor)||draft.priceMinor<0||!Number.isSafeInteger(draft.dataLimitBytes)||draft.dataLimitBytes<0||!Number.isInteger(draft.durationDays)||draft.durationDays<1){throw new Error(fa?"مقادیر پلن معتبر نیست.":"Invalid plan fields.")}
 const publishAt=dateInput?new Date(dateInput).toISOString():null;
 await apiClient.put("/api/v1/admin/plans/",{...draft,publishAt});await load();reset();setMessage(fa?"پلن ذخیره شد.":"Plan saved.")
 }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(e instanceof Error?e.message:"Unable to save plan"))}finally{setSaving(false)}}
 const status=(p:Plan)=>p.archivedAt?(fa?"بایگانی‌شده":"Archived"):!p.active?(fa?"غیرفعال":"Disabled"):p.publishAt&&new Date(p.publishAt)>new Date()?(fa?"زمان‌بندی‌شده":"Scheduled"):(fa?"منتشرشده":"Published");
 return <main className="mx-auto max-w-5xl px-6 py-10">
 <div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-bold">{fa?"مدیریت پلن‌ها":"Manage plans"}</h1><Link href="/admin" className="text-cyan-300">{fa?"بازگشت به مدیریت":"Admin overview"}</Link></div>
 <p className="mt-3 text-sm text-gray-400">{fa?"پلن فقط در صورت فعال بودن و رسیدن زمان انتشار برای کاربران نمایش داده می‌شود.":"Plans become purchasable only when enabled and their publication date has arrived."}</p>
 {error&&<p role="alert" className="mt-4 text-red-300">{error}</p>}{message&&<p role="status" className="mt-4 text-green-300">{message}</p>}
 <form onSubmit={e=>{e.preventDefault();void save()}} className="mt-6 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 sm:grid-cols-2">
 <label className="text-sm">{fa?"کد پلن":"Code"}<input required disabled={editingCode!==null} value={draft.code} onChange={e=>update("code",e.target.value.toLowerCase())} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 <label className="text-sm">{fa?"نام":"Name"}<input required value={draft.name} onChange={e=>update("name",e.target.value)} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 <label className="text-sm sm:col-span-2">{fa?"توضیحات":"Description"}<textarea value={draft.description} onChange={e=>update("description",e.target.value)} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 {([["priceMinor",fa?"قیمت (واحد خرد)":"Price (minor units)"],["durationDays",fa?"مدت (روز)":"Duration (days)"],["dataLimitBytes",fa?"حجم ترافیک (بایت)":"Data limit (bytes)"],["sortOrder",fa?"ترتیب نمایش":"Sort order"]] as const).map(([key,label])=><label key={key} className="text-sm">{label}<input type="number" min="0" required value={draft[key]} onChange={e=>update(key,Number(e.target.value))} className="mt-1 w-full rounded border bg-transparent p-2" /></label>)}
 <label className="text-sm">{fa?"ارز":"Currency"}<input maxLength={3} required value={draft.currency} onChange={e=>update("currency",e.target.value.toUpperCase())} className="mt-1 w-full rounded border bg-transparent p-2" /></label>
 <label className="text-sm">{fa?"تاریخ انتشار (اختیاری)":"Publish date (optional)"}<input type="datetime-local" value={dateInput} onChange={e=>setDateInput(e.target.value)} className="mt-1 w-full rounded border bg-slate-900 p-2" /></label>
 <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isPopular} onChange={e=>update("isPopular",e.target.checked)} />{fa?"محبوب‌ترین / پیشنهاد ویژه":"Most popular / Featured"}</label>
 <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={e=>update("active",e.target.checked)} />{fa?"فعال":"Enabled"}</label>
 <div className="flex gap-3 sm:col-span-2"><button disabled={saving} className="rounded bg-cyan-500 px-5 py-2 font-semibold text-black disabled:opacity-50">{saving?"…":fa?"ذخیره پلن":"Save plan"}</button><button type="button" onClick={reset} className="rounded border px-5 py-2">{fa?"پلن جدید":"New plan"}</button></div>
 </form>
 <div className="mt-8 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{fa?"پلن‌های موجود":"Existing plans"}</h2><input type="search" aria-label={fa?"جستجوی پلن":"Search plans"} placeholder={fa?"جستجو":"Search"} value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="rounded border bg-transparent p-2" /></div>
 {loading?<p className="mt-5">{fa?"در حال دریافت…":"Loading…"}</p>:<div className="mt-4 space-y-3">{visible.map(p=><article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 p-4"><div><strong>{p.name}</strong> <span className="text-sm text-gray-400">({p.code})</span><p className="text-sm text-gray-400">{status(p)}{p.isPopular?(fa?" · محبوب‌ترین":" · Most popular"):""} · {p.priceMinor.toLocaleString()} {p.currency}{p.publishAt?" · "+new Date(p.publishAt).toLocaleString(locale==="fa"?"fa-IR":"en-US"):""}</p></div><div className="flex gap-2"><button disabled={!!p.archivedAt} onClick={()=>edit(p)} className="rounded border px-4 py-2 disabled:opacity-40">{fa?"ویرایش":"Edit"}</button><button disabled={retiringCode!==null||!!p.archivedAt} onClick={()=>void retire(p)} className="rounded border border-red-400/50 px-4 py-2 text-red-300 disabled:opacity-40">{retiringCode===p.code?"…":fa?"حذف / بایگانی":"Delete / Archive"}</button></div></article>)}{visible.length===0&&<p>{fa?"پلنی یافت نشد.":"No plans found."}</p>}</div>}
 <div className="mt-4 flex items-center justify-between"><span className="text-sm">{filtered.length} {fa?"پلن":"plans"}</span><div className="flex gap-3"><button disabled={page===1} onClick={()=>setPage(v=>v-1)} className="rounded border px-3 py-1 disabled:opacity-40">{fa?"قبلی":"Previous"}</button><span>{page}</span><button disabled={page*10>=filtered.length} onClick={()=>setPage(v=>v+1)} className="rounded border px-3 py-1 disabled:opacity-40">{fa?"بعدی":"Next"}</button></div></div>
 </main>
}
