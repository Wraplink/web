"use client";

import {useEffect, useState} from "react";
import {useLocale} from "next-intl";
import {Link} from "@/i18n/navigation";
import {apiClient} from "@/lib/api/client";

type Query = {eventId:string;controllerId:string;observedAt:string;domain:string;qtype:string;rcode:string;resolutionMode:string;durationMs:number;managed?:boolean;managedMode?:string;managedDomain?:string};
type Response = {queries:Query[];total:number;page:number;pageSize:number};
const PAGE_SIZE = 25;

export default function AdminDNSQueriesContent() {
    const locale = useLocale();
    const fa = locale === "fa";
    const [search, setSearch] = useState("");
    const [submitted, setSubmitted] = useState("");
    const [controller, setController] = useState("");
    const [rcode, setRcode] = useState("");
    const [qtype, setQtype] = useState("");
    const [mode, setMode] = useState("");
    const [managed, setManaged] = useState("");
    const [page, setPage] = useState(1);
    const [refresh, setRefresh] = useState(0);
    const [data, setData] = useState<Response>({queries:[],total:0,page:1,pageSize:PAGE_SIZE});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const abort = new AbortController();
        async function load() {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({page:String(page),pageSize:String(PAGE_SIZE)});
                if (submitted) params.set("search",submitted);
                if (controller) params.set("controller",controller);
                if (rcode) params.set("rcode",rcode);
                if (qtype) params.set("qtype",qtype);
                if (mode) params.set("mode",mode);
                if (managed) params.set("managed",managed);
                const response = await apiClient.get<Response>(`/api/v1/admin/network/dns-queries?${params.toString()}`,{signal:abort.signal});
                if (!abort.signal.aborted) setData(response.data);
            } catch {
                if (!abort.signal.aborted) setError(fa?"بارگذاری درخواست‌های DNS ناموفق بود.":"Unable to load DNS queries.");
            } finally {
                if (!abort.signal.aborted) setLoading(false);
            }
        }
        void load();
        return () => abort.abort();
    },[page,submitted,controller,rcode,qtype,mode,managed,refresh,fa]);

    return <main className="mx-auto max-w-7xl px-6 py-10" dir={fa?"rtl":"ltr"}>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold">{fa?"پایش درخواست‌های DNS":"DNS Query Monitoring"}</h1>
                <p className="mt-2 text-sm text-gray-400">{fa?"درخواست‌های ثبت‌شده توسط کنترلرهای DNS":"Queries reported by registered DNS controllers"}</p></div>
            <div className="flex gap-3"><Link href="/admin/network" className="rounded-lg border border-white/20 px-4 py-2">{fa?"شبکه":"Network"}</Link>
                <button type="button" onClick={()=>setRefresh(n=>n+1)} className="rounded-lg bg-cyan-600 px-4 py-2 text-white">{fa?"به‌روزرسانی":"Refresh"}</button></div>
        </div>
        <form className="mt-8 flex flex-wrap items-end gap-3" onSubmit={e=>{e.preventDefault();setPage(1);setSubmitted(search.trim())}}>
            <label className="min-w-48 flex-1 text-sm">{fa?"جست‌وجوی دامنه":"Domain search"}<input className="mt-2 w-full rounded-lg border border-white/20 bg-transparent p-3" value={search} onChange={e=>setSearch(e.target.value)} maxLength={253} /></label>
            <label className="min-w-40 text-sm">{fa?"کنترلر":"Controller"}<input className="mt-2 w-full rounded-lg border border-white/20 bg-transparent p-3" value={controller} onChange={e=>{setController(e.target.value);setPage(1)}} maxLength={128}/></label>
            <label className="text-sm">{fa?"نتیجه":"Response"}<select className="mt-2 block rounded-lg border border-white/20 bg-slate-950 p-3" value={rcode} onChange={e=>{setRcode(e.target.value);setPage(1)}}><option value="">{fa?"همه":"All"}</option><option>NOERROR</option><option>NXDOMAIN</option><option>REFUSED</option><option>SERVFAIL</option></select></label>
            <label className="text-sm">{fa?"نوع درخواست":"Query type"}<select className="mt-2 block rounded-lg border border-white/20 bg-slate-950 p-3" value={qtype} onChange={e=>{setQtype(e.target.value);setPage(1)}}><option value="">{fa?"همه":"All"}</option><option>A</option><option>AAAA</option><option>CNAME</option><option>MX</option><option>TXT</option><option>NS</option><option>SOA</option><option>PTR</option><option>SRV</option><option>CAA</option></select></label>
            <label className="text-sm">{fa?"حالت پاسخ":"Resolution mode"}<select className="mt-2 block rounded-lg border border-white/20 bg-slate-950 p-3" value={mode} onChange={e=>{setMode(e.target.value);setPage(1)}}><option value="">{fa?"همه":"All"}</option><option value="normal">normal</option><option value="hijack">hijack</option><option value="route">route</option><option value="specific_ip">specific_ip</option><option value="block">block</option><option value="refused">refused</option><option value="servfail">servfail</option></select></label>
            <label className="text-sm">{fa?"مدیریت‌شده":"Managed"}<select className="mt-2 block rounded-lg border border-white/20 bg-slate-950 p-3" value={managed} onChange={e=>{setManaged(e.target.value);setPage(1)}}><option value="">{fa?"همه":"All"}</option><option value="true">{fa?"بله":"Yes"}</option><option value="false">{fa?"خیر":"No"}</option></select></label>
            <button type="submit" className="rounded-lg bg-cyan-600 px-5 py-3 text-white">{fa?"جست‌وجو":"Search"}</button>
        </form>
        {error&&<p role="alert" className="mt-5 text-red-400">{error}</p>}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/15">
            <table className="w-full text-sm"><thead className="bg-white/5"><tr>
                {[fa?"زمان":"Time",fa?"دامنه":"Domain",fa?"کنترلر":"Controller","Type","RCODE",fa?"حالت گزارش‌شده":"Reported mode",fa?"مدیریت‌شده":"Managed",fa?"سیاست":"Policy",fa?"دامنه سیاست":"Policy domain",fa?"مدت":"Latency",fa?"عملیات":"Action"].map(label=><th key={label} className="p-3 text-start">{label}</th>)}
            </tr></thead><tbody>
                {data.queries.map(q=><tr key={q.controllerId+q.eventId} className="border-t border-white/10">
                    <td className="whitespace-nowrap p-3">{new Date(q.observedAt).toLocaleString(fa?"fa-IR":"en-US")}</td>
                    <td className="p-3 font-medium" dir="ltr">{q.domain}</td><td className="p-3">{q.controllerId}</td>
                    <td className="p-3">{q.qtype}</td><td className="p-3">{q.rcode}</td><td className="p-3">{q.resolutionMode}</td>
                    <td className="p-3">{q.managed===undefined?"—":q.managed?(fa?"بله":"Yes"):(fa?"خیر":"No")}</td>
                    <td className="p-3">{q.managedMode||"—"}</td>
                    <td className="p-3" dir="ltr">{q.managedDomain||"—"}</td>
                    <td className="p-3">{q.durationMs} ms</td>
                    <td className="p-3"><Link href={`/admin/domain-policies?domain=${encodeURIComponent(q.managed&&q.managedDomain?q.managedDomain:q.domain)}`} className="whitespace-nowrap text-cyan-300 underline">{q.managed?(fa?"مشاهده / ویرایش":"View / Edit"):(fa?"ثبت دامنه":"Register domain")}</Link></td>
                </tr>)}
            </tbody></table>
            {!loading&&data.queries.length===0&&<p className="p-6 text-center text-gray-400">{fa?"درخواستی یافت نشد.":"No queries found."}</p>}
            {loading&&<p role="status" className="p-6 text-center text-gray-400">{fa?"در حال بارگذاری…":"Loading…"}</p>}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 text-sm"><span>{fa?"مجموع":"Total"}: {data.total}</span>
            <div className="flex items-center gap-3"><button disabled={page===1||loading} onClick={()=>setPage(p=>p-1)} className="rounded border px-3 py-2 disabled:opacity-40">{fa?"قبلی":"Previous"}</button>
                <span>{page} / {Math.max(1,Math.ceil(data.total/PAGE_SIZE))}</span>
                <button disabled={loading||page*PAGE_SIZE>=data.total} onClick={()=>setPage(p=>p+1)} className="rounded border px-3 py-2 disabled:opacity-40">{fa?"بعدی":"Next"}</button></div>
        </div>
    </main>;
}
