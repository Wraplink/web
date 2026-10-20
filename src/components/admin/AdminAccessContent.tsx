"use client";
import {useEffect,useState} from "react";
import {adminPermissions,updateAdminPermission,type AdminPermission} from "@/lib/api/admin";

export default function AdminAccessContent(){
 const [users,setUsers]=useState<AdminPermission[]>([]);
 const [target,setTarget]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function refresh(){try{setUsers(await adminPermissions())}catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Unable to load permissions")}}
 useEffect(()=>{void refresh()},[]);
 async function update(id:string,permission:"payment_review"|"discount_admin",enabled:boolean){
  if(!window.confirm(`${enabled?"Grant":"Revoke"} ${permission} for ${id}?`))return;
  setBusy(true);setError("");
  try{await updateAdminPermission(id,permission,enabled);await refresh()}
  catch{setError("Unable to update permission")}finally{setBusy(false)}
 }
 return <main className="mx-auto max-w-5xl px-6 py-12">
  <h1 className="text-3xl font-bold">Administrator permissions</h1>
  <p className="my-4 text-gray-400">Only access administrators can grant or revoke these roles. Changes are audited.</p>
  {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}
  <form onSubmit={e=>{e.preventDefault();void update(target,"payment_review",true)}} className="mb-8 flex flex-wrap gap-3">
   <input required aria-label="User UUID" placeholder="User UUID" value={target} onChange={e=>setTarget(e.target.value)} className="min-w-0 flex-1 rounded-lg border bg-transparent p-3"/>
   <button disabled={busy} className="rounded-lg bg-cyan-600 px-4 py-2">Grant payment reviewer</button>
   <button type="button" disabled={busy||!target} onClick={()=>void update(target,"discount_admin",true)} className="rounded-lg border px-4 py-2">Grant discount admin</button>
  </form>
  <div className="space-y-3">{users.map(u=><article key={u.userId} className="rounded-xl border border-white/15 p-4">
   <div className="mb-3 font-semibold">{u.email}<span className="block break-all text-xs font-normal text-gray-500">{u.userId}</span></div>
   <div className="flex flex-wrap gap-3">{([["payment_review",u.paymentReview,"Payment reviewer"],["discount_admin",u.discountAdmin,"Discount admin"]] as const).map(([permission,enabled,label])=>
    <button key={permission} disabled={busy} onClick={()=>void update(u.userId,permission,!enabled)} className="rounded-lg border border-white/20 px-3 py-2 text-sm">{label}: {enabled?"Enabled — revoke":"Disabled — grant"}</button>)}</div>
  </article>)}</div>
 </main>;
}
