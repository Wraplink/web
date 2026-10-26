"use client";
import {useEffect,useState} from "react";
import {apiClient} from "@/lib/api/client";
type Message={id:string;name:string;email:string;subject:string;message:string;createdAt:string};
export default function AdminContactMessagesContent({locale}:{locale:string}){
 const fa=locale==="fa";
 const [items,setItems]=useState<Message[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;apiClient.get<{messages:Message[]}>("/api/v1/admin/contact-messages").then(({data})=>{if(active)setItems(data.messages)}).catch(()=>{if(active)setError(fa?"دریافت پیام‌ها ناموفق بود":"Unable to load contact messages")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[fa]);
 return <main className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">{fa?"پیام‌های تماس":"Contact messages"}</h1>
 {loading&&<p role="status" className="mt-6">Loading…</p>}{error&&<p role="alert" className="mt-6 text-red-300">{error}</p>}
 {!loading&&!error&&items.length===0&&<p className="mt-6 text-gray-400">{fa?"پیامی ثبت نشده است.":"No messages yet."}</p>}
 <div className="mt-6 space-y-4">{items.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
 <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-cyan-300">{item.subject}</h2><time className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleString(fa?"fa-IR":"en-US")}</time></div>
 <p className="mt-2 text-sm">{item.name} · <a href={`mailto:${item.email}`} className="text-cyan-300 underline">{item.email}</a></p>
 <p className="mt-4 whitespace-pre-wrap break-words text-gray-200">{item.message}</p></article>)}</div></main>;
}
