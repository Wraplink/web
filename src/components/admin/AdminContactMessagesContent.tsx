"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import {apiClient} from "@/lib/api/client";

type Message={id:string;name:string;email:string;subject:string;message:string;createdAt:string};
type Response={messages:Message[];total:number;page:number;limit:number};
const PAGE_SIZE=20;

export default function AdminContactMessagesContent({locale}:{locale:string}){
 const fa=locale==="fa";
 const [items,setItems]=useState<Message[]>([]);
 const [query,setQuery]=useState("");
 const [search,setSearch]=useState("");
 const [page,setPage]=useState(1);
 const [total,setTotal]=useState(0);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const load=useCallback(async(signal?:AbortSignal)=>{
  setLoading(true);setError("");
  try{
   const {data}=await apiClient.get<Response>("/api/v1/admin/contact-messages",{params:{search,page,limit:PAGE_SIZE},signal});
   if(signal?.aborted)return;
   setItems(data.messages);setTotal(data.total);
  }catch(err){
   if(signal?.aborted)return;
   setError(fa?"دریافت پیام‌ها ناموفق بود":"Unable to load contact messages");
  }finally{if(!signal?.aborted)setLoading(false)}
 },[fa,page,search]);
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort()},[load]);
 const submit=(e:FormEvent)=>{e.preventDefault();setPage(1);setSearch(query.trim())};
 const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
 return <main className="mx-auto max-w-5xl px-6 py-12">
 <h1 className="text-3xl font-bold">{fa?"پیام‌های تماس با ما":"Contact us messages"}</h1>
 <p className="mt-2 text-gray-400">{fa?"جستجو و بررسی پیام‌های ارسال‌شده از فرم تماس":"Search and review messages submitted through the contact form."}</p>
 <form onSubmit={submit} role="search" className="mt-6 flex flex-wrap gap-3">
 <input aria-label={fa?"جستجوی پیام‌ها":"Search messages"} value={query} maxLength={200} onChange={e=>setQuery(e.target.value)} placeholder={fa?"نام، ایمیل، موضوع یا متن پیام":"Name, email, subject or message"} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white" />
 <button type="submit" className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black">{fa?"جستجو":"Search"}</button>
 {search&&<button type="button" onClick={()=>{setQuery("");setSearch("");setPage(1)}} className="rounded-xl border border-white/20 px-4 py-3">{fa?"پاک کردن":"Clear"}</button>}
 </form>
 <div className="mt-5 flex items-center justify-between gap-3 text-sm text-gray-400"><span>{fa?`تعداد پیام‌ها: ${total}`:`${total} messages`}</span><button type="button" onClick={()=>void load()} disabled={loading} className="rounded-lg border border-white/20 px-3 py-2 disabled:opacity-50">{fa?"بازخوانی":"Refresh"}</button></div>
 {loading&&<p role="status" className="mt-6">{fa?"در حال بارگذاری…":"Loading…"}</p>}
 {error&&<p role="alert" className="mt-6 text-red-300">{error}</p>}
 {!loading&&!error&&items.length===0&&<p className="mt-6 text-gray-400">{fa?"پیامی یافت نشد.":"No messages found."}</p>}
 {!loading&&!error&&<div className="mt-6 space-y-4">{items.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
 <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-cyan-300">{item.subject}</h2><time className="text-sm text-gray-400" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(fa?"fa-IR":"en-US")}</time></div>
 <p className="mt-2 text-sm">{item.name} · <a href={`mailto:${item.email}`} className="break-all text-cyan-300 underline">{item.email}</a></p>
 <p className="mt-4 whitespace-pre-wrap break-words text-gray-200">{item.message}</p></article>)}</div>}
 {!loading&&!error&&total>PAGE_SIZE&&<nav aria-label={fa?"صفحه‌بندی پیام‌ها":"Message pagination"} className="mt-8 flex items-center justify-center gap-4">
 <button type="button" disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">{fa?"قبلی":"Previous"}</button>
 <span className="text-sm">{fa?`صفحه ${page} از ${pages}`:`Page ${page} of ${pages}`}</span>
 <button type="button" disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">{fa?"بعدی":"Next"}</button>
 </nav>}
 </main>;
}
