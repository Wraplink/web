"use client";
import {useCallback,useEffect,useState} from "react";
import {changeTicketStatus,createTicket,getTicket,listTickets,replyTicket,type SupportTicket,type SupportMessage,type TicketStatus} from "@/lib/api/support";
export default function SupportContent({admin=false,locale="en"}:{admin?:boolean;locale?:string}){
 const fa=locale==="fa";
 const [tickets,setTickets]=useState<SupportTicket[]>([]);
 const [selected,setSelected]=useState<SupportTicket|null>(null);
 const [messages,setMessages]=useState<SupportMessage[]>([]);
 const [search,setSearch]=useState("");const [status,setStatus]=useState("");
 const [page,setPage]=useState(0);const [loading,setLoading]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const [subject,setSubject]=useState("");const [category,setCategory]=useState("technical");const [priority,setPriority]=useState("medium");const [orderNumber,setOrderNumber]=useState("");const [initialMessage,setInitialMessage]=useState("");const [reply,setReply]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const data=await listTickets(admin,{search,status,limit:25,offset:page*25});setTickets(data.tickets);}catch{setError(fa?"دریافت تیکت‌ها ناموفق بود":"Unable to load tickets"}finally{setLoading(false)}},[admin,search,status,page,fa]);
 useEffect(()=>{void load()},[load]);
 const open=async(t:SupportTicket)=>{setError("");try{const detail=await getTicket(t.id,admin);setSelected(detail.ticket);setMessages(detail.messages)}catch{setError("Unable to load conversation")}};
 const send=async()=>{if(!selected||!reply.trim())return;setBusy(true);try{await replyTicket(selected.id,reply.trim(),admin);setReply("");await open(selected);await load()}catch{setError("Unable to send message")}finally{setBusy(false)}};
 const update=async(next:TicketStatus)=>{if(!selected)return;setBusy(true);try{await changeTicketStatus(selected.id,next,admin);await open(selected);await load()}catch{setError("Unable to update status")}finally{setBusy(false)}};
 const create=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{const created=await createTicket({subject,category,priority,message:initialMessage,...(orderNumber.trim()?{orderNumber:Number(orderNumber.replace(/^WL-/i,""))}:{})});setSubject("");setInitialMessage("");setOrderNumber("");await load();const detail=await getTicket(created.id);setSelected(detail.ticket);setMessages(detail.messages)}catch{setError("Unable to create ticket. Check your order number and message.")}finally{setBusy(false)}};
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <h1 className="text-3xl font-bold">{admin?(fa?"مدیریت تیکت‌های پشتیبانی":"Support ticket management"):(fa?"پشتیبانی":"Support")}</h1>
  <p className="mt-2 text-gray-400">{admin?"Review customer requests, respond and manage ticket status.":"Create a request and track support responses."}</p>
  {error&&<p role="alert" className="my-4 rounded-lg border border-red-400/40 p-3 text-red-300">{error}</p>}
  <div className="mt-6 grid gap-6 lg:grid-cols-3">
   <div className="space-y-3">
    <form onSubmit={e=>{e.preventDefault();setPage(0);void load()}} className="space-y-2">
     <input aria-label="Search tickets" placeholder="Ticket #, order #, email, subject" value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} className="w-full rounded-lg border border-white/20 bg-transparent p-3"/>
     <select aria-label="Ticket status filter" value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}} className="w-full rounded-lg border border-white/20 bg-gray-900 p-3"><option value="">All statuses</option>{["open","pending","resolved","closed"].map(x=><option key={x} value={x}>{x}</option>)}</select>
    </form>
    <button type="button" onClick={()=>void load()} className="rounded-lg border px-3 py-2">Refresh</button>
    {loading&&<p>Loading…</p>}
    {tickets.map(t=><button type="button" key={t.id} onClick={()=>void open(t)} className={"w-full rounded-xl border p-4 text-left "+(selected?.id===t.id?"border-cyan-400":"border-white/15")}>
      <div className="flex justify-between gap-2"><strong>TKT-{t.ticketNumber}</strong><span className="text-xs text-cyan-300">{t.status}</span></div>
      <div className="mt-1 font-medium">{t.subject}</div><div className="mt-1 text-xs text-gray-400">{admin?t.email:t.category} · {new Date(t.updatedAt).toLocaleString()}</div>
      {t.orderNumber&&<div className="text-xs text-gray-400">WL-{t.orderNumber}</div>}
     </button>)}
    {!loading&&tickets.length===0&&<p className="text-gray-400">No tickets found.</p>}
    <div className="flex gap-3"><button disabled={page===0} onClick={()=>setPage(v=>v-1)} className="rounded border px-3 py-2 disabled:opacity-30">Previous</button><span className="p-2">{page+1}</span><button disabled={tickets.length<25} onClick={()=>setPage(v=>v+1)} className="rounded border px-3 py-2 disabled:opacity-30">Next</button></div>
   </div>
   <div className="lg:col-span-2">
    {selected?<section className="rounded-xl border border-white/15 p-5">
     <button type="button" onClick={()=>setSelected(null)} className="mb-4 text-cyan-300">← Back</button>
     <h2 className="text-xl font-bold">TKT-{selected.ticketNumber}: {selected.subject}</h2>
     <p className="mt-2 text-sm text-gray-400">{selected.category} · {selected.priority} priority · {selected.status}</p>
     {admin&&<p className="mt-2 text-sm">Customer: {selected.fullName} · {selected.email} · {selected.userId}</p>}
     {selected.orderNumber&&<p className="text-sm">Related order: WL-{selected.orderNumber}</p>}
     {admin&&<div className="mt-4 flex flex-wrap gap-2">{(["open","pending","resolved","closed"] as TicketStatus[]).map(x=><button key={x} type="button" disabled={busy||selected.status===x} onClick={()=>void update(x)} className="rounded-lg border border-white/20 px-3 py-2 disabled:opacity-40">{x}</button>)}</div>}
     {!admin&&selected.status!=="closed"&&<button type="button" disabled={busy} onClick={()=>void update("closed")} className="mt-3 rounded border border-red-400/40 px-3 py-2 text-red-300">Close ticket</button>}
     <div className="my-6 max-h-[480px] space-y-3 overflow-y-auto">{messages.map(m=><div key={m.id} className={"rounded-xl p-4 "+(m.sender==="support"?"bg-cyan-500/10":"bg-white/5")}><div className="text-xs text-gray-400">{m.sender==="support"?"Support":"Customer"} · {new Date(m.date).toLocaleString()}</div><p className="mt-2 whitespace-pre-wrap break-words">{m.message}</p></div>)}</div>
     {selected.status!=="closed"&&<form onSubmit={e=>{e.preventDefault();void send()}}><textarea aria-label="Reply" value={reply} onChange={e=>setReply(e.target.value)} maxLength={10000} required rows={4} className="w-full rounded-lg border border-white/20 bg-transparent p-3" placeholder="Write your reply…"/><button disabled={busy||!reply.trim()} className="mt-3 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black disabled:opacity-40">Send reply</button></form>}
    </section>:!admin?<form onSubmit={e=>void create(e)} className="space-y-4 rounded-xl border border-white/15 p-5">
     <h2 className="text-xl font-bold">Create support ticket</h2>
     <input aria-label="Subject" required minLength={3} maxLength={200} placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} className="w-full rounded-lg border border-white/20 bg-transparent p-3"/>
     <div className="grid gap-3 sm:grid-cols-2"><select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)} className="rounded-lg border border-white/20 bg-gray-900 p-3">{["technical","billing","connection","account","general"].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Priority" value={priority} onChange={e=>setPriority(e.target.value)} className="rounded-lg border border-white/20 bg-gray-900 p-3">{["low","medium","high"].map(x=><option key={x}>{x}</option>)}</select></div>
     <input aria-label="Related order number" placeholder="Related order number (optional, WL-100001)" value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} className="w-full rounded-lg border border-white/20 bg-transparent p-3"/>
     <textarea aria-label="Message" required maxLength={10000} rows={6} placeholder="Describe the issue…" value={initialMessage} onChange={e=>setInitialMessage(e.target.value)} className="w-full rounded-lg border border-white/20 bg-transparent p-3"/>
     <button disabled={busy} className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black disabled:opacity-40">Submit ticket</button>
    </form>:<p className="rounded-xl border border-white/15 p-8 text-gray-400">Select a ticket to review and reply.</p>}
   </div>
  </div>
 </main>
}
