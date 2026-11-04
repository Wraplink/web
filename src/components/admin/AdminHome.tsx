"use client";
import {Link} from "@/i18n/navigation";
import {useEffect,useState} from "react";
import {adminPermissions,adminUsers} from "@/lib/api/admin";
import {listPendingReceipts} from "@/lib/api/paymentReviews";
import {apiClient} from "@/lib/api/client";

export default function AdminHome({locale}:{locale:string}){
 const [counts,setCounts]=useState<{users?:number;reviews?:number;orderReviews?:number;walletReviews?:number;staff?:number}>({});
 const [error,setError]=useState("");
 useEffect(()=>{let mounted=true;Promise.allSettled([adminUsers(),listPendingReceipts(),adminPermissions(),apiClient.get<{receipts:unknown[]}>("/api/v1/admin/payment-reviews/wallet-receipts")]).then(results=>{
  if(!mounted)return;
  const next:{users?:number;reviews?:number;orderReviews?:number;walletReviews?:number;staff?:number}={};
  if(results[0].status==="fulfilled")next.users=results[0].value.length;
  if(results[1].status==="fulfilled")next.orderReviews=results[1].value.length;
  if(results[3].status==="fulfilled")next.walletReviews=results[3].value.data.receipts.length;
  if(next.orderReviews!==undefined&&next.walletReviews!==undefined)next.reviews=next.orderReviews+next.walletReviews;
  if(results[2].status==="fulfilled")next.staff=results[2].value.length;
  if(Object.keys(next).length===0)setError(locale==="fa"?"دسترسی مدیریت ندارید یا سرویس مدیریت در دسترس نیست.":"You do not have administrator access, or the admin API is unavailable.");
  setCounts(next);
 });return()=>{mounted=false}},[]);
 const sections=[
  {href:"/admin/users",title:locale==="fa"?"کاربران":"Users",description:locale==="fa"?"جست‌وجوی حساب‌های کاربران و بررسی وضعیت":"Search customer accounts and review status",count:counts.users},
  {href:"/admin/support",title:locale==="fa"?"درخواست‌های پشتیبانی":"Support tickets",description:locale==="fa"?"بررسی درخواست‌ها، پاسخ‌گویی و تغییر وضعیت":"Review customer requests, reply and update ticket status"},
  {href:"/admin/orders",title:locale==="fa"?"سفارش‌ها":"Orders",description:locale==="fa"?"بررسی اشتراک‌ها و وضعیت پرداخت":"Inspect subscriptions and payment status"},
  {href:"/admin/payment-methods",title:locale==="fa"?"روش‌های پرداخت":"Payment methods",description:locale==="fa"?"مدیریت کارت‌های مقصد کارت‌به‌کارت":"Manage card-to-card destination accounts"},
  {href:"/admin/payment-reviews",title:locale==="fa"?"بررسی پرداخت‌ها":"Payment reviews",description:locale==="fa"?"بررسی رسید سفارش‌ها و شارژ کیف پول":"Review order payments and wallet top-ups",count:counts.reviews},
  {href:"/admin/discounts",title:locale==="fa"?"تخفیف‌ها":"Discounts",description:locale==="fa"?"ایجاد و غیرفعال‌سازی کدهای تخفیف":"Create and disable promotional codes"},
  {href:"/admin/plans",title:locale==="fa"?"مدیریت پلن‌ها":"Plans",description:locale==="fa"?"ساخت و ویرایش پلن‌ها، فعال‌سازی و زمان‌بندی انتشار":"Create, edit, enable and schedule subscription plans"},
  {href:"/admin/access",title:locale==="fa"?"دسترسی کارکنان":"Staff permissions",description:locale==="fa"?"اعطا و لغو مجوزهای مدیریتی":"Grant and revoke administrative permissions",count:counts.staff},
  {href:"/admin/network",title:locale==="fa"?"مدیریت شبکه":"Network operations",description:locale==="fa"?"کنترل DNS، عامل‌های لبه و سلامت شبکه":"DNS control, edge agents and network health"},
 ];
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <h1 className="text-3xl font-bold">{locale==="fa"?"مدیریت WrapLink":"WrapLink Administration"}</h1>
  <p className="mt-2 text-gray-400">{locale==="fa"?"ابزارهای مدیریتی بر اساس سطح دسترسی و از طریق رابط‌های امن ارائه می‌شوند.":"Administrative tools are permission-restricted and backed by authenticated APIs."}</p>
  {error&&<p role="alert" className="mt-5 text-amber-300">{error}</p>}
  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{sections.map(s=>
   <Link key={s.href} href={s.href} locale={locale} className="rounded-2xl border border-white/15 bg-white/5 p-6 transition hover:border-cyan-400/50">
    <h2 className="text-xl font-semibold">{s.title}</h2>
    <p className="mt-2 text-sm text-gray-400">{s.description}</p>
    {s.count!==undefined&&<p className="mt-4 text-sm text-cyan-300">{s.href==="/admin/payment-reviews"?(locale==="fa"?`${s.count} رسید در انتظار بررسی`:`${s.count} pending reviews`):`${s.count} in current result set`}</p>}
    {s.href==="/admin/payment-reviews"&&counts.orderReviews!==undefined&&counts.walletReviews!==undefined&&<p className="mt-1 text-xs text-gray-400">{locale==="fa"?`سفارش‌ها: ${counts.orderReviews} · کیف پول: ${counts.walletReviews}`:`Orders: ${counts.orderReviews} · Wallet: ${counts.walletReviews}`}</p>}
    {s.href==="/admin/payment-reviews"&&counts.reviews===undefined&&<p className="mt-4 text-xs text-amber-300">{locale==="fa"?"آمار بررسی پرداخت‌ها در دسترس نیست":"Review count unavailable"}</p>}
   </Link>)}</div>
 </main>;
}
