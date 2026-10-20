"use client";
import Link from "next/link";
import {useLocale} from "next-intl";
export default function AdminNetworkContent(){
 const locale=useLocale();
 const prefix=locale==="fa"?"/fa":"";
 return <main className="mx-auto max-w-5xl px-6 py-12">
  <h1 className="text-3xl font-bold">Network operations</h1>
  <p className="mt-3 text-gray-400">WrapLink network control is split between dns-control, edge-agent and the backend. Administrative mutations must be authorized and audited by the corresponding services.</p>
  <div className="mt-8 grid gap-4 sm:grid-cols-2">
   {[
    {title:"DNS control",description:"Routing policy, DNS hijack or direct resolution, and controller status."},
    {title:"Edge agents",description:"Registration, health, SNI/IP routing, capacity and draining."},
    {title:"Network entitlements",description:"Customer network access and provisioning status."},
    {title:"Usage and events",description:"Traffic, diagnostics, agent errors and connection events."}
   ].map(s=><section key={s.title} className="rounded-xl border border-white/15 bg-white/5 p-5"><h2 className="font-semibold">{s.title}</h2><p className="mt-2 text-sm text-gray-400">{s.description}</p><p className="mt-3 text-xs text-amber-300">Admin API integration pending</p></section>)}
  </div>
  <Link href={prefix+"/admin"} className="mt-8 inline-block text-cyan-300">Back to admin overview</Link>
 </main>;
}
