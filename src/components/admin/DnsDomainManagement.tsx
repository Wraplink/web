"use client";

import {useCallback,useEffect,useState} from "react";
import {dnsDomainsApi,type DnsDomain,type DnsDomainInput,type DnsMode} from "@/lib/api/dns-domains";

const blank: DnsDomainInput = {domain:"",enabled:true,mode:"DIRECT",agentId:null,overrideIp:null,fallbackMode:"DIRECT",priority:100};
export default function DnsDomainManagement(){
 const [items,setItems]=useState<DnsDomain[]>([]);
 const [draft,setDraft]=useState<DnsDomainInput>(blank);
 const [editing,setEditing]=useState<string|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const load=useCallback(async()=>{try{setItems(await dnsDomainsApi.list())}catch(e){setError(e instanceof Error?e.message:"Unable to load domains")}},[]);
 useEffect(()=>{void load()},[load]);
 async function save(e:React.FormEvent){e.preventDefault();setLoading(true);setError("");setNotice("");
  try{if(editing){await dnsDomainsApi.update(editing,draft)}else{await dnsDomainsApi.create(draft)}
   setNotice("Domain rule saved");setDraft(blank);setEditing(null);await load();
  }catch(e){setError(e instanceof Error?e.message:"Save failed")}finally{setLoading(false)}
 }
 async function remove(id:string){if(!window.confirm("Delete this domain rule?"))return;
  setError("");try{await dnsDomainsApi.remove(id);await load()}catch(e){setError(e instanceof Error?e.message:"Delete failed")}
 }
 return <section className="mx-auto max-w-5xl space-y-6 p-6 text-white">
  <header><h1 className="text-2xl font-bold">DNS Domain Management</h1><p className="text-sm text-slate-400">Configure DNS resolution policies for WrapLink.</p><p role="note" className="mt-3 rounded border border-amber-700 bg-amber-950 p-3 text-amber-100">Rules saved here are not yet synchronized with the active DNS control policy snapshot. Do not rely on these changes for live DNS resolution until synchronization is enabled.</p></header>
  {error&&<p role="alert" className="rounded bg-red-950 p-3 text-red-200">{error}</p>}
  {notice&&<p role="status" className="rounded bg-emerald-950 p-3">{notice}</p>}
  <form onSubmit={save} className="grid gap-3 rounded-xl border border-slate-700 p-4 sm:grid-cols-2">
   <label className="space-y-1">Domain<input required value={draft.domain} onChange={e=>setDraft({...draft,domain:e.target.value})} placeholder="example.com" className="w-full rounded bg-slate-800 p-2"/></label>
   <label className="space-y-1">Resolution mode<select value={draft.mode} onChange={e=>setDraft({...draft,mode:e.target.value as DnsMode})} className="w-full rounded bg-slate-800 p-2"><option value="DIRECT">Direct DNS</option><option value="SNI_HIJACK">SNI Hijack</option><option value="FULL_ROUTE">Full Routing</option><option value="BLOCK">Block</option></select></label>
   <label className="space-y-1">Agent ID (optional)<input value={draft.agentId??""} onChange={e=>setDraft({...draft,agentId:e.target.value||null})} className="w-full rounded bg-slate-800 p-2"/></label>
   <label className="space-y-1">Override IP (optional)<input value={draft.overrideIp??""} onChange={e=>setDraft({...draft,overrideIp:e.target.value||null})} className="w-full rounded bg-slate-800 p-2"/></label>
   <label className="space-y-1">Fallback<select value={draft.fallbackMode} onChange={e=>setDraft({...draft,fallbackMode:e.target.value as "DIRECT"|"REFUSE"})} className="w-full rounded bg-slate-800 p-2"><option value="DIRECT">Direct DNS</option><option value="REFUSE">Refuse</option></select></label>
   <label className="space-y-1">Priority<input type="number" min={0} value={draft.priority} onChange={e=>setDraft({...draft,priority:Number(e.target.value)})} className="w-full rounded bg-slate-800 p-2"/></label>
   <label><input type="checkbox" checked={draft.enabled} onChange={e=>setDraft({...draft,enabled:e.target.checked})}/> Enabled</label>
   <div className="flex gap-3"><button disabled={loading} className="rounded bg-blue-600 px-4 py-2 disabled:opacity-50">{editing?"Update":"Add domain"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setDraft(blank)}}>Cancel</button>}</div>
  </form>
  <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-left text-sm"><thead><tr className="bg-slate-800"><th className="p-3">Domain</th><th>Mode</th><th>IP</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-t border-slate-700"><td className="p-3">{item.domain}</td><td>{item.mode}</td><td>{item.overrideIp||"Automatic"}</td><td>{item.enabled?"Enabled":"Disabled"}</td><td className="space-x-3"><button onClick={()=>{setEditing(item.id);setDraft({domain:item.domain,enabled:item.enabled,mode:item.mode,agentId:item.agentId,overrideIp:item.overrideIp,fallbackMode:item.fallbackMode,priority:item.priority})}}>Edit</button><button onClick={()=>void remove(item.id)}>Delete</button></td></tr>)}</tbody></table></div>
 </section>;
}
