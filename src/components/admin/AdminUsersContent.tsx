"use client";
import {useEffect,useState} from "react";
import {useLocale} from "next-intl";
import {adminUsers,updateAdminUserStatus,type AdminUser} from "@/lib/api/admin";

export default function AdminUsersContent(){
 const fa=useLocale()==="fa";
 const [users,setUsers]=useState<AdminUser[]>([]);
 const [search,setSearch]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const [acting,setActing]=useState<string|null>(null);
 async function changeStatus(u:AdminUser,action:"suspend"|"restore"|"delete"){
  const message=action==="delete"?(fa?`حساب ${u.email} حذف شود؟ این کار دائمی است و تمام داده‌های مرتبط حذف می‌شوند.`:`Delete ${u.email}? This permanently deletes the account and all related data. This cannot be undone.`):`${fa?(action==="suspend"?"تعلیق":"فعال‌سازی مجدد"):(action==="suspend"?"Suspend":"Restore")} ${u.email}؟`;
  if(!window.confirm(message))return;
  setActing(u.id);setError("");
  try{await updateAdminUserStatus(u.id,action);await load(search)}catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"به‌روزرسانی حساب ناموفق بود.":"Unable to update account"))}finally{setActing(null)}
 }
 async function load(term:string){
  setLoading(true);setError("");
  try{setUsers(await adminUsers(term))}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?(fa?"مجوز مدیریت لازم است.":"Access administrator permission required"):(fa?"دریافت کاربران ناموفق بود.":"Could not load users"))}
  finally{setLoading(false)}
 }
 useEffect(()=>{void load("")},[]);
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <h1 className="mb-6 text-3xl font-bold">{fa?"مدیریت کاربران":"User management"}</h1>
  <form onSubmit={e=>{e.preventDefault();void load(search)}} className="mb-6 flex gap-3">
   <input aria-label={fa?"جست‌وجوی کاربران":"Search users"} placeholder={fa?"ایمیل یا نام":"Email or name"} value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-transparent p-3"/>
   <button className="rounded-lg bg-cyan-600 px-5 py-2">{fa?"جست‌وجو":"Search"}</button>
  </form>
  {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}
  {loading?<p>{fa?"در حال بارگذاری…":"Loading…"}</p>:<div className="overflow-x-auto rounded-xl border border-white/15">
   <table className="w-full text-left text-sm"><thead className="bg-white/10"><tr><th className="p-3">{fa?"نام":"Name"}</th><th className="p-3">{fa?"ایمیل":"Email"}</th><th className="p-3">{fa?"وضعیت":"Status"}</th><th className="p-3">{fa?"تأیید شده":"Verified"}</th><th className="p-3">{fa?"تاریخ ثبت‌نام":"Registered"}</th><th className="p-3">{fa?"عملیات":"Actions"}</th></tr></thead>
   <tbody>{users.map(u=><tr key={u.id} className="border-t border-white/10"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{fa?({active:"فعال",suspended:"معلق",deleted:"حذف‌شده"} as Record<string,string>)[u.status]??u.status:u.status}</td><td className="p-3">{u.emailVerified?(fa?"بله":"Yes"):(fa?"خیر":"No")}</td><td className="p-3">{new Date(u.createdAt).toLocaleDateString(fa?"fa-IR":"en-US")}</td><td className="p-3"><div className="flex gap-2">{u.status==="active"&&<button type="button" disabled={acting!==null} onClick={()=>void changeStatus(u,"suspend")} className="rounded border border-amber-500 px-2 py-1 text-amber-300">{fa?"تعلیق":"Suspend"}</button>}{u.status==="suspended"&&<button type="button" disabled={acting!==null} onClick={()=>void changeStatus(u,"restore")} className="rounded border border-green-500 px-2 py-1 text-green-300">{fa?"فعال‌سازی مجدد":"Restore"}</button>}{u.status!=="deleted"&&<button type="button" disabled={acting!==null} onClick={()=>void changeStatus(u,"delete")} className="rounded border border-red-500 px-2 py-1 text-red-300">{fa?"حذف":"Delete"}</button>}</div></td></tr>)}</tbody></table>
  </div>}
  <p className="mt-3 text-xs text-gray-500">Showing up to 100 users. Deletion permanently removes account records and related data.</p>
 </main>;
}
