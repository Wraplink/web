"use client";
import {Link} from "@/i18n/navigation";
import {useEffect,useState} from "react";
import {adminPermissions,adminUsers} from "@/lib/api/admin";
import {listPendingReceipts} from "@/lib/api/paymentReviews";

export default function AdminHome({locale}:{locale:string}){
 const [counts,setCounts]=useState<{users?:number;reviews?:number;staff?:number}>({});
 const [error,setError]=useState("");
 useEffect(()=>{let mounted=true;Promise.allSettled([adminUsers(),listPendingReceipts(),adminPermissions()]).then(results=>{
  if(!mounted)return;
  const next:{users?:number;reviews?:number;staff?:number}={};
  if(results[0].status==="fulfilled")next.users=results[0].value.length;
  if(results[1].status==="fulfilled")next.reviews=results[1].value.length;
  if(results[2].status==="fulfilled")next.staff=results[2].value.length;
  if(Object.keys(next).length===0)setError("You do not have administrator access, or the admin API is unavailable.");
  setCounts(next);
 });return()=>{mounted=false}},[]);
 const sections=[
  {href:"/admin/users",title:"Users",description:"Search customer accounts and review status",count:counts.users},
  {href:"/admin/support",title:"Support tickets",description:"Review customer requests, reply and update ticket status"},
  {href:"/admin/orders",title:"Orders",description:"Inspect subscriptions and payment status"},
  {href:"/admin/payment-methods",title:locale==="fa"?"روش‌های پرداخت":"Payment methods",description:locale==="fa"?"مدیریت کارت‌های مقصد کارت‌به‌کارت":"Manage card-to-card destination accounts"},
  {href:"/admin/payment-reviews",title:"Payment reviews",description:"Verify bank transfer receipts",count:counts.reviews},
  {href:"/admin/discounts",title:"Discounts",description:"Create and disable promotional codes"},
  {href:"/admin/access",title:"Staff permissions",description:"Grant and revoke administrative permissions",count:counts.staff},
  {href:"/admin/network",title:"Network operations",description:"DNS control, edge agents and network health"},
 ];
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <h1 className="text-3xl font-bold">{locale==="fa"?"مدیریت WrapLink":"WrapLink Administration"}</h1>
  <p className="mt-2 text-gray-400">Administrative tools are permission-restricted and backed by authenticated APIs.</p>
  {error&&<p role="alert" className="mt-5 text-amber-300">{error}</p>}
  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{sections.map(s=>
   <Link key={s.href} href={s.href} locale={locale} className="rounded-2xl border border-white/15 bg-white/5 p-6 transition hover:border-cyan-400/50">
    <h2 className="text-xl font-semibold">{s.title}</h2>
    <p className="mt-2 text-sm text-gray-400">{s.description}</p>
    {s.count!==undefined&&<p className="mt-4 text-sm text-cyan-300">{s.count} in current result set</p>}
   </Link>)}</div>
 </main>;
}
