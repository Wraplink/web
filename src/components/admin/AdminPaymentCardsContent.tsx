"use client";
import {useEffect,useState} from "react";
import {adminCreatePaymentCard,adminListPaymentCards,adminSetPaymentCardActive,listPaymentMethods,adminSetPaymentMethod,type PaymentMethod,type PaymentCard} from "@/lib/api/paymentCards";

export default function AdminPaymentCardsContent({locale}:{locale:string}){
 const fa=locale==="fa";
 const [cards,setCards]=useState<PaymentCard[]>([]);
 const [methods,setMethods]=useState<Record<PaymentMethod,boolean>>({card:true,isp:false,crypto:false});
 const [number,setNumber]=useState("");
 const [owner,setOwner]=useState("");
 const [bank,setBank]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const load=async()=>{try{const [available,settings]=await Promise.all([adminListPaymentCards(),listPaymentMethods()]);setCards(available);setMethods(settings);}catch(e){setError(e instanceof Error?e.message:"Unable to load cards");}};
 useEffect(()=>{void load();},[]);
 const add=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError("");try{await adminCreatePaymentCard({cardNumber:number.replace(/\D/g,""),cardholderName:owner,bankName:bank});setNumber("");setOwner("");setBank("");await load();}catch(e){setError(e instanceof Error?e.message:"Unable to save card");}finally{setLoading(false);}};
 const toggle=async(card:PaymentCard)=>{setLoading(true);setError("");try{await adminSetPaymentCardActive(card.id,!card.active);await load();}catch(e){setError(e instanceof Error?e.message:"Unable to update card");}finally{setLoading(false);}};
 return <main className="mx-auto max-w-5xl px-6 py-12">
 <h1 className="text-3xl font-bold">{fa?"مدیریت کارت‌های پرداخت":"Card-to-Card Payment Methods"}</h1>
 <p className="mt-2 text-gray-400">{fa?"کارت‌های مقصد را برای نمایش در صفحه پرداخت مدیریت کنید.":"Manage the destination bank cards displayed at checkout."}</p>
 {error&&<p role="alert" className="mt-4 text-red-300">{error}</p>}
 <section className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6">
 <h2 className="text-xl font-semibold">{fa?"فعال‌سازی روش‌های پرداخت":"Payment method availability"}</h2>
 <p className="mt-2 text-sm text-gray-400">{fa?"روش‌های غیرفعال برای مشتری نمایش داده نمی‌شوند. درگاه‌های ISP و رمزارز تا زمان پیاده‌سازی قابل فعال‌سازی نیستند.":"Disabled methods are hidden from customers. ISP and crypto cannot be enabled until their processors are implemented."}</p>
 <div className="mt-4 space-y-3">{(["card","isp","crypto"] as const).map(method=><label key={method} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-4">
 <span>{method==="card"?(fa?"کارت به کارت":"Card to card"):method==="isp"?"ISP":fa?"رمزارز":"Cryptocurrency"}</span>
 <input type="checkbox" checked={methods[method]} disabled={loading||method!=="card"} onChange={async e=>{setLoading(true);setError("");try{await adminSetPaymentMethod(method,e.target.checked);await load()}catch(err){setError(err instanceof Error?err.message:"Unable to update method")}finally{setLoading(false)}}} aria-label={method} className="h-5 w-5 accent-cyan-400"/>
 </label>)}</div>
 </section>
 <form onSubmit={add} className="mt-8 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-6">
 <h2 className="text-xl font-semibold">{fa?"افزودن کارت جدید":"Add destination card"}</h2>
 <label className="text-sm">{fa?"نام بانک":"Bank name"}<input required maxLength={120} value={bank} onChange={e=>setBank(e.target.value)} className="mt-2 w-full rounded-lg border border-white/20 bg-slate-900 p-3"/></label>
 <label className="text-sm">{fa?"نام صاحب کارت":"Cardholder name"}<input required maxLength={150} value={owner} onChange={e=>setOwner(e.target.value)} className="mt-2 w-full rounded-lg border border-white/20 bg-slate-900 p-3"/></label>
 <label className="text-sm">{fa?"شماره کارت ۱۶ رقمی":"16-digit card number"}<input required inputMode="numeric" pattern="[0-9 ]{16,19}" value={number} onChange={e=>setNumber(e.target.value)} placeholder="6037 0000 0000 0000" className="mt-2 w-full rounded-lg border border-white/20 bg-slate-900 p-3 font-mono"/></label>
 <button disabled={loading} className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black disabled:opacity-50">{fa?"افزودن کارت":"Add card"}</button>
 </form>
 <h2 className="mt-10 text-xl font-semibold">{fa?"کارت‌های ثبت‌شده":"Configured cards"}</h2>
 <div className="mt-4 grid gap-4 sm:grid-cols-2">{cards.map(card=><article key={card.id} className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-800 to-indigo-950 p-6 shadow-lg">
 <div className="flex justify-between"><span className="text-sm text-cyan-200">{card.bankName}</span><span>💳</span></div>
 <div dir="ltr" className="mt-6 text-center font-mono text-lg font-bold tracking-wider">{card.cardNumber.replace(/(\d{4})(?=\d)/g,"$1 ")}</div>
 <div className="mt-5 flex items-center justify-between text-sm"><span>{card.cardholderName}</span><span className={card.active?"text-green-300":"text-amber-300"}>{card.active?(fa?"فعال":"Active"):(fa?"غیرفعال":"Disabled")}</span></div>
 <button type="button" disabled={loading} onClick={()=>void toggle(card)} className="mt-5 w-full rounded-lg border border-white/30 p-2 text-sm hover:bg-white/10">{card.active?(fa?"غیرفعال کردن":"Disable card"):(fa?"فعال کردن":"Enable card")}</button>
 </article>)}</div>
 </main>;
}
