"use client";

import {useCallback, useEffect, useState} from "react";
import {downloadReceipt, listPendingReceipts, reviewReceipt, type PendingReceipt} from "@/lib/api/paymentReviews";

export default function PaymentReviewContent({locale}: {locale: string}) {
    const [orderNumber,setOrderNumber]=useState("");
    const [account,setAccount]=useState("");
    const [dateFrom,setDateFrom]=useState("");
    const [dateTo,setDateTo]=useState("");
    const [filters,setFilters]=useState({orderNumber:"",account:"",dateFrom:"",dateTo:""});
    const [receipts, setReceipts] = useState<PendingReceipt[]>([]);
    const [busy, setBusy] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [forbidden, setForbidden] = useState(false);
    const [preview, setPreview] = useState<{url: string; id: string; type: string} | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setReceipts(await listPendingReceipts(filters));
            setForbidden(false);
        } catch (e) {
            const status = (e as {response?: {status?: number}})?.response?.status;
            if (status === 403) setForbidden(true);
            else setError("Unable to load payment receipts. Try again.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { void refresh(); }, [refresh]);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

    async function showAttachment(item: PendingReceipt) {
        setBusy(item.id);
        setError("");
        try {
            const blob = await downloadReceipt(item.id);
            const url = URL.createObjectURL(blob);
            setPreview({url, id: item.id, type: item.contentType});
        } catch { setError("Unable to load receipt attachment."); }
        finally { setBusy(null); }
    }

    async function decide(item: PendingReceipt, decision: "approved" | "rejected") {
        if (!window.confirm(decision === "approved" ?
            "Confirm that the bank transfer has been independently verified?" :
            "Reject this receipt? The customer's subscription will not activate.")) return;
        setBusy(item.id);
        setError("");
        try {
            await reviewReceipt(item.id, decision);
            setPreview(null);
            await refresh();
        } catch (e) {
            const status = (e as {response?: {status?: number}})?.response?.status;
            setError(status === 409 ? "Receipt or group changed. Refresh and retry." :
                "Review could not be completed.");
        } finally { setBusy(null); }
    }

    const money = (value: number, currency: string) =>
        new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {style: "currency", currency})
            .format(value / (currency === "IRR" ? 1 : 100));

    return <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold">Payment receipt review</h1>
                <p className="mt-2 text-sm text-gray-400">Approve only after verifying funds in the receiving bank account.</p></div>
            <button type="button" onClick={() => void refresh()} disabled={loading}
                className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-50">Refresh</button>
        </div>
        <form onSubmit={event=>{event.preventDefault();setFilters({orderNumber,account,dateFrom,dateTo});}} className="mb-6 grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-5">
            <input aria-label="Order number" placeholder="WL-100001" value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} className="rounded-lg border border-white/20 bg-transparent p-2"/>
            <input aria-label="Customer account" placeholder="Email, name or user ID" value={account} onChange={e=>setAccount(e.target.value)} className="rounded-lg border border-white/20 bg-transparent p-2"/>
            <input aria-label="From date" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="rounded-lg border border-white/20 bg-transparent p-2"/>
            <input aria-label="To date" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="rounded-lg border border-white/20 bg-transparent p-2"/>
            <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black">Search orders</button>
        </form>
        {forbidden ? <p role="alert" className="text-amber-300">You are not authorized to review payments.</p> :
        <>
            {error && <p role="alert" className="mb-4 text-red-400">{error}</p>}
            {loading ? <p>Loading receipts…</p> :
                receipts.length === 0 ? <p>No receipts awaiting review.</p> :
                <div className="space-y-4">{receipts.map(item =>
                    <article key={item.id} className="rounded-xl border border-white/15 bg-white/5 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                                <h2 className="break-all font-semibold">{item.orderCount && item.orderCount > 1 ? (locale === "fa" ? `پرداخت گروهی — ${item.orderCount} سفارش` : `Grouped payment — ${item.orderCount} orders`) : (locale === "fa" ? "پرداخت تک‌سفارش" : "Single order payment")}</h2>
                                <p className="mt-1 text-sm text-gray-300">{item.filename}</p>
                                <p className="mt-1 text-sm text-gray-400">{item.paymentGroupId ? (locale === "fa" ? "شناسه پرداخت گروهی:" : "Payment group:") : "Subscription:"} {item.paymentGroupId ?? item.subscriptionId}</p>
                                <p className="text-sm text-gray-200">Customer: {item.customer?.fullName || item.userId}</p>
                                <p className="text-sm text-gray-300">{item.customer?.email}</p>
                                <p className="text-xs text-gray-400">Account: {item.customer?.accountStatus} · Email verified: {item.customer?.emailVerified ? "Yes" : "No"} · ID: {item.userId}</p>
                                <p className="text-sm text-gray-400">Submitted: {new Date(item.createdAt).toLocaleString()}</p>
                                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4"><h3 className="mb-3 font-semibold">{locale === "fa" ? "جزئیات سفارش و پلن‌ها" : "Order and plan preview"}</h3><div className="space-y-3">{item.plans?.map(plan => <div key={plan.subscriptionId} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm"><div><p className="font-semibold text-white">#WL-{plan.orderNumber} — {plan.planName}</p><p className="text-gray-400">{plan.planCode} · {plan.durationDays} {locale === "fa" ? "روز" : "days"} · {(plan.dataLimitBytes / (1024 ** 3)).toFixed(1)} GB</p></div><span className="font-semibold">{money(plan.amountMinor,plan.currency)}</span></div>)}</div></div>
                                <p className="mt-2 font-semibold text-cyan-200">{locale === "fa" ? "مبلغ کل قابل بررسی:" : "Total payment to verify:"} {money(item.payableMinor, item.currency)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" disabled={busy !== null} onClick={() => void showAttachment(item)}
                                    className="rounded-lg border border-cyan-400 px-3 py-2 text-cyan-300">View receipt</button>
                                <button type="button" disabled={busy !== null} onClick={() => void decide(item, "approved")}
                                    className="rounded-lg bg-green-600 px-3 py-2 text-white disabled:opacity-40">Approve</button>
                                <button type="button" disabled={busy !== null} onClick={() => void decide(item, "rejected")}
                                    className="rounded-lg bg-red-600 px-3 py-2 text-white disabled:opacity-40">Reject</button>
                            </div>
                        </div>
                    </article>)}</div>}
        </>}
        {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Receipt preview">
            <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-gray-950 p-4">
                <div className="mb-3 flex justify-end gap-3">
                    <a href={preview.url} download="receipt" className="rounded-lg border px-3 py-2">Download</a>
                    <button type="button" onClick={() => setPreview(null)} className="rounded-lg border px-3 py-2">Close</button>
                </div>
                {preview.type === "application/pdf" ?
                    <iframe title="Receipt PDF" src={preview.url} className="min-h-0 flex-1 bg-white"/> :
                    <img alt="Submitted payment receipt" src={preview.url} className="min-h-0 flex-1 object-contain"/>}
            </div>
        </div>}
    </main>;
}
