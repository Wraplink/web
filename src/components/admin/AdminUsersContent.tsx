"use client";
import {useAdminCapabilities} from "./adminCapabilities";
import {useCallback,useEffect,useRef,useState} from "react";
import {useLocale} from "next-intl";
import {adminUsers,updateAdminUserStatus,type AdminUser} from "@/lib/api/admin";

import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";

const accountActions = {
 suspend: {en:"Suspend", fa:"تعلیق", enTitle:"Suspend account?", faTitle:"حساب تعلیق شود؟", style:"bg-amber-800"},
 restore: {en:"Restore", fa:"فعال‌سازی مجدد", enTitle:"Restore account?", faTitle:"حساب دوباره فعال شود؟", style:"bg-green-800"},
 release_email: {en:"Release email for reuse", fa:"آزادسازی ایمیل برای استفاده مجدد", enTitle:"Release email for reuse?", faTitle:"ایمیل برای استفاده مجدد آزاد شود؟", style:"bg-amber-800"},
 delete: {en:"Delete", fa:"حذف", enTitle:"Delete account?", faTitle:"حساب حذف شود؟", style:"bg-red-700"},
};

type AccountAction = keyof typeof accountActions;

export default function AdminUsersContent(){
 const canManage=useAdminCapabilities().includes("access");
 const fa=useLocale()==="fa";
 const [users,setUsers]=useState<AdminUser[]>([]);
 const [search,setSearch]=useState("");
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [loading,setLoading]=useState(false);
 const [acting,setActing]=useState<string|null>(null);
 const [pendingChange,setPendingChange]=useState<{user:AdminUser;action:AccountAction}|null>(null);
 const searchInput=useRef<HTMLInputElement>(null);
 const pendingAction=pendingChange ? accountActions[pendingChange.action] : null;

 async function confirmChange(){
  if(!pendingChange||acting!==null||!canManage)return;
  const {user:u,action}=pendingChange;
  setPendingChange(null);
  setActing(u.id);setError("");setSuccess("");
  try{
   await updateAdminUserStatus(u.id,action);
   await load(search);
   if(action==="release_email"){
    setSuccess(fa?"ایمیل آزاد شد و اکنون می‌توان با آن ثبت‌نام کرد.":"Email released. It can now be used to register again.");
   }
  }catch(e){setError((e as {response?:{data?:{error?:string}}}).response?.data?.error||(fa?"به‌روزرسانی حساب ناموفق بود.":"Unable to update account"))}finally{setActing(null)}
 }
 const load=useCallback(async (term:string)=>{
  setLoading(true);setError("");
  try{setUsers(await adminUsers(term))}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?(fa?"مجوز مدیریت لازم است.":"Access administrator permission required"):(fa?"دریافت کاربران ناموفق بود.":"Could not load users"))}
  finally{setLoading(false)}
 },[fa]);
 useEffect(()=>{void load("")},[load]);
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <h1 className="mb-6 text-3xl font-bold">{fa?"مدیریت کاربران":"User management"}</h1>
  <form onSubmit={e=>{e.preventDefault();setSuccess("");void load(search)}} className="mb-6 flex gap-3">
   <input ref={searchInput} aria-label={fa?"جست‌وجوی کاربران":"Search users"} placeholder={fa?"ایمیل یا نام":"Email or name"} value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-transparent p-3"/>
   <button className="rounded-lg bg-cyan-600 px-5 py-2">{fa?"جست‌وجو":"Search"}</button>
  </form>
  {success&&<p role="status" className="mb-4 text-green-400">{success}</p>}
  {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}
  {loading?<p>{fa?"در حال بارگذاری…":"Loading…"}</p>:<div className="overflow-x-auto rounded-xl border border-white/15">
   <table className="w-full text-left text-sm"><thead className="bg-white/10"><tr><th className="p-3">{fa?"نام":"Name"}</th><th className="p-3">{fa?"ایمیل":"Email"}</th><th className="p-3">{fa?"وضعیت":"Status"}</th><th className="p-3">{fa?"تأیید شده":"Verified"}</th><th className="p-3">{fa?"تاریخ ثبت‌نام":"Registered"}</th>{canManage&&<th className="p-3">{fa?"عملیات":"Actions"}</th>}</tr></thead>
   <tbody>{users.map(u=><tr key={u.id} className="border-t border-white/10"><td className="p-3">{u.name}</td><td className="p-3">{u.emailReleased?(fa?"آزاد شده":"Released"):u.email}{canManage&&<div className="select-all text-xs text-gray-400">{u.id}</div>}</td><td className="p-3">{fa?({active:"فعال",suspended:"معلق",deleted:"حذف‌شده"} as Record<string,string>)[u.status]??u.status:u.status}</td><td className="p-3">{u.emailReleased?"—":u.emailVerified?(fa?"بله":"Yes"):(fa?"خیر":"No")}</td><td className="p-3">{new Date(u.createdAt).toLocaleDateString(fa?"fa-IR":"en-US")}</td>{canManage&&<td className="p-3"><div className="flex gap-2">{u.status==="active"&&<button type="button" disabled={acting!==null} onClick={()=>setPendingChange({user:u,action:"suspend"})} className="rounded border border-amber-500 px-2 py-1 text-amber-300">{fa?"تعلیق":"Suspend"}</button>}{u.status==="suspended"&&<button type="button" disabled={acting!==null} onClick={()=>setPendingChange({user:u,action:"restore"})} className="rounded border border-green-500 px-2 py-1 text-green-300">{fa?"فعال‌سازی مجدد":"Restore"}</button>}{u.status!=="deleted"&&<button type="button" disabled={acting!==null} onClick={()=>setPendingChange({user:u,action:"delete"})} className="rounded border border-red-500 px-2 py-1 text-red-300">{fa?"حذف":"Delete"}</button>}{u.status==="deleted"&&!u.emailReleased&&
    <button type="button" disabled={acting!==null} onClick={()=>setPendingChange({user:u,action:"release_email"})} className="rounded border border-amber-500 px-2 py-1 text-amber-300">
     {fa?accountActions.release_email.fa:accountActions.release_email.en}
    </button>
   }</div></td>}</tr>)}</tbody></table>
  </div>}
  <p className="mt-3 text-xs text-gray-500">{canManage?"Showing up to 100 users. Deletion permanently removes account records and related data.":"Showing up to 100 users."}</p>
  <Dialog open={pendingChange!==null} onOpenChange={open=>{if(!open)setPendingChange(null)}}>
   <DialogContent dir={fa?"rtl":"ltr"} finalFocus={searchInput} showCloseButton={false} className="border border-white/15 bg-slate-950 text-white">
    {pendingChange&&pendingAction&&<>
     <DialogHeader>
      <DialogTitle>{fa?pendingAction.faTitle:pendingAction.enTitle}</DialogTitle>
      <DialogDescription className="text-gray-300">
       <bdi dir="ltr" className="block break-all">{pendingChange.user.email}</bdi>
       {pendingChange.action==="delete"&&<span className="mt-2 block text-red-300">
        {fa?"این کار دائمی است و حساب و تمام داده‌های مرتبط حذف می‌شوند.":"This permanently deletes the account and all related data. This cannot be undone."}
       </span>}
       {pendingChange.action==="release_email"&&<span className="mt-2 block">
        {fa?"این ایمیل برای ثبت‌نام یک حساب جدید آزاد می‌شود. حساب قبلی حذف‌شده باقی می‌ماند و سوابق مالی و حسابرسی آن حفظ می‌شوند.":"This email will be available for a new registration. The old account stays deleted and keeps its billing and audit records."}
       </span>}
      </DialogDescription>
     </DialogHeader>
     <DialogFooter className="border-white/15 bg-white/5">
      <DialogClose className="rounded-lg border border-white/20 px-4 py-2">{fa?"انصراف":"Cancel"}</DialogClose>
      <button type="button" onClick={()=>void confirmChange()} className={`rounded-lg px-4 py-2 ${pendingAction.style}`}>
       {fa?pendingAction.fa:pendingAction.en}
      </button>
     </DialogFooter>
    </>}
   </DialogContent>
  </Dialog>
 </main>;
}
