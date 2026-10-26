"use client";
import {useEffect,useState,type ReactNode} from "react";
import {Link} from "@/i18n/navigation";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

export default function AdminLayoutGate({children}:{children:ReactNode}){
 const locale=useLocale();
 const [status,setStatus]=useState<"loading"|"allowed"|"denied">("loading");
 useEffect(()=>{
  let active=true;
  Promise.allSettled([
   apiClient.get("/api/v1/admin/access/permissions"),
   apiClient.get("/api/v1/admin/payment-reviews/receipts"),
   apiClient.get("/api/v1/admin/payment-reviews/discounts")
  ]).then(results=>{if(active)setStatus(results.some(x=>x.status==="fulfilled")?"allowed":"denied")});
  return()=>{active=false};
 },[]);
 if(status==="loading")return <div className="p-10" role="status">Checking administrator access…</div>;
 if(status==="denied")return <main className="p-10"><h1 className="text-2xl font-bold">Administrator access unavailable</h1><p className="mt-3 text-gray-400">Your account does not have an administrator role, or the administration API cannot be reached.</p></main>;
 const tabs=[["","Overview"],["users","Users"],["orders","Orders"],["payment-reviews","Payments"],["discounts","Discounts"],["access","Permissions"],["network","Network"]];
 return <div>
  <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
   <img src="/wraplink-symbol.webp" alt="" width={68} height={44} className="h-11 w-auto" />
   <div><div className="font-bold text-white">WrapLink</div><div className="text-xs text-cyan-300">{locale==="fa"?"مدیریت":"Administration"}</div></div>
  </div>
  <nav aria-label="Administrator navigation" className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-4">
   {tabs.map(([href,label])=><Link key={href} href={"/admin"+(href?"/"+href:"")} locale={locale} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-200 hover:border-cyan-400 hover:text-cyan-300">{label}</Link>)}
  </nav>
  {children}
 </div>;
}
