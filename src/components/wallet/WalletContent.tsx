"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {ArrowDownCircle, ArrowUpCircle, RefreshCw, Wallet, UploadCloud, FileCheck2, AlertCircle, X, CreditCard, CheckCircle2, Copy} from "lucide-react";
import {useTranslations} from "next-intl";
import {listPaymentCards,type PaymentCard} from "@/lib/api/paymentCards";

import {
    submitWalletCardReceipt,
    getWalletBalance,
    getWalletDeposits,
    getWalletTransactions,
    type WalletBalance,
    type WalletDeposit,
    type WalletTransaction,
} from "@/lib/api/wallet";

type Props = {locale: string};
type Filter = "all" | "credit" | "debit";

function formatMoney(amount: number, locale: string): string {
    return `${new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        maximumFractionDigits: 0,
    }).format(amount)} IRR`;
}

export default function WalletContent({locale}: Props) {
    const t = useTranslations("WalletPage");
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [deposits, setDeposits] = useState<WalletDeposit[]>([]);
    const [filter, setFilter] = useState<Filter>("all");
    const [amount, setAmount] = useState("");
    const [cards,setCards]=useState<PaymentCard[]>([]);
    const [selectedCardId,setSelectedCardId]=useState("");
    const [receipt,setReceipt]=useState<File|null>(null);
    const [receiptError,setReceiptError]=useState("");
    const receiptInputRef=useRef<HTMLInputElement>(null);
    const [draggingReceipt,setDraggingReceipt]=useState(false);
    const selectReceipt=(file:File|null)=>{
        pendingKey.current=null;
        setReceipt(null);
        setReceiptError("");
        if(!file)return;
        const validTypes=["image/png","image/jpeg","image/webp","application/pdf"];
        if(!validTypes.includes(file.type)){setReceiptError(locale==="fa"?"فرمت رسید باید JPG، PNG، WebP یا PDF باشد.":"Upload a JPG, PNG, WebP or PDF receipt.");return;}
        if(file.size===0||file.size>5*1024*1024){setReceiptError(locale==="fa"?"حجم رسید باید بین ۱ بایت تا ۵ مگابایت باشد.":"Receipt must be nonempty and no larger than 5 MB.");return;}
        setReceipt(file);
    };
    const [method,setMethod]=useState<"card"|"isp"|"crypto">("card");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const pendingKey = useRef<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const [nextBalance, nextTransactions, nextDeposits,availableCards] = await Promise.all([
                getWalletBalance(),
                getWalletTransactions(),
                getWalletDeposits(),
                listPaymentCards(),
            ]);
            setBalance(nextBalance);
            setTransactions(nextTransactions);
            setDeposits(nextDeposits);
            setCards(availableCards);
            setSelectedCardId(current=>availableCards.some(card=>card.id===current)?current:availableCards[0]?.id??"");
            setError("");
        } catch (err) {
            console.error("Could not load wallet:", err);
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const submitDeposit = async () => {
        if (submitting) return;
        const value = Number(amount.trim());
        if (!/^[0-9]+$/.test(amount.trim()) || !Number.isSafeInteger(value) || value <= 0) {
            setError(t("invalidAmount"));
            return;
        }

        if(!receipt||!selectedCardId||method!=="card"){setError(locale==="fa"?"کارت مقصد و تصویر رسید الزامی است":"Select a destination card and upload a receipt");return}
        setSubmitting(true);
        setError("");
        setMessage("");
        // Keep the same key across retries; never create duplicate deposits on a timeout.
        if (!pendingKey.current) pendingKey.current = crypto.randomUUID();
        try {
            const request = await submitWalletCardReceipt(value,selectedCardId,receipt,pendingKey.current);
            setMessage(locale==="fa"?`رسید ثبت شد و در انتظار تایید مدیر است (${request.id.slice(0,8)})`:`Receipt submitted for admin review (${request.id.slice(0,8)}). Your balance will update after approval.`);
            setAmount("");
            setReceipt(null);
            pendingKey.current = null;
            await refresh();
        } catch (err) {
            console.error("Could not create deposit request:", err);
            setError(t("requestError"));
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = filter === "all"
        ? transactions
        : transactions.filter((transaction) => transaction.direction === filter);

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">
                <h1 className="text-4xl font-black">{t("title")}</h1>
                <p className="mt-3 text-gray-300">{t("subtitle")}</p>
            </div>

            {error && (
                <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
                    {error}
                </div>
            )}
            {message && (
                <div role="status" className="mt-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200">
                    {message}
                </div>
            )}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-gray-400">{t("balance")}</div>
                        <div className="mt-3 text-3xl font-black text-cyan-400 sm:text-5xl">
                            {loading ? t("loading") : balance
                                ? formatMoney(balance.balanceMinor, locale)
                                : "—"}
                        </div>
                    </div>
                    <Wallet size={60} className="shrink-0 text-cyan-400"/>
                </div>
                <button type="button" onClick={() => void refresh()} disabled={loading || submitting}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-400 disabled:opacity-50">
                    <RefreshCw size={16}/>{t("refresh")}
                </button>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                        <ArrowDownCircle className="text-green-400"/>{t("deposit")}
                    </h2>
                    <label htmlFor="wallet-deposit-amount" className="mb-2 block text-sm">{t("amountIrr")}</label>
                    <input id="wallet-deposit-amount" type="text" inputMode="numeric" value={amount}
                        onChange={(event) => {
                            setAmount(event.target.value);
                            pendingKey.current = null;
                            setMessage("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400"
                        placeholder="500000"/>
                    <fieldset className="mt-5 space-y-2"><legend className="mb-2 font-semibold">{locale==="fa"?"روش پرداخت":"Payment method"}</legend>{(["card","isp","crypto"] as const).map(value=><label key={value} className="flex items-center gap-2 text-sm"><input type="radio" checked={method===value} onChange={()=>setMethod(value)}/>{value==="card"?(locale==="fa"?"کارت به کارت":"Card to card"):value==="isp"?"ISP":"Cryptocurrency"}{value!=="card"&&<span className="text-amber-300">(Coming soon)</span>}</label>)}</fieldset>
                    {method==="card"&&<div className="mt-5 space-y-3"><p className="text-sm font-semibold">{locale==="fa"?"کارت مقصد":"Destination bank card"}</p>{cards.map(card=><button key={card.id} type="button" aria-pressed={selectedCardId===card.id} aria-label={`${card.bankName} — ${card.cardholderName} — ${card.cardNumber}`} onClick={()=>{setSelectedCardId(card.id);pendingKey.current=null}}
                            className={`group relative w-full max-w-md overflow-hidden rounded-2xl border-2 p-5 text-left text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 ${selectedCardId===card.id?"border-cyan-300 ring-2 ring-cyan-400/30":"border-white/20 hover:border-cyan-300/60"}`}
                            style={{background:"linear-gradient(125deg,#0e3650 0%,#17263e 45%,#312653 100%)",aspectRatio:"1.586"}}>
                            <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[28px] border-white/5"/>
                            <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full border-[24px] border-cyan-200/5"/>
                            <span className="relative flex items-start justify-between gap-2">
                                <span className="min-w-0 truncate text-sm font-bold tracking-wide text-cyan-100">{card.bankName}</span>
                                {selectedCardId===card.id?<span className="flex items-center gap-1 rounded-full bg-cyan-300/20 px-2 py-1 text-xs font-semibold text-cyan-100"><CheckCircle2 size={14}/>{locale==="fa"?"انتخاب شده":"Selected"}</span>:<CreditCard className="shrink-0 text-white/60" size={23}/>}
                            </span>
                            <span aria-hidden="true" className="relative mt-5 block h-8 w-11 rounded-md border border-yellow-100/60 bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-600 shadow-inner"><span className="absolute inset-x-0 top-1/2 border-t border-amber-800/50"/></span>
                            <span dir="ltr" className="relative mt-4 block whitespace-nowrap text-center font-mono text-[clamp(0.85rem,3.4vw,1.3rem)] font-semibold tracking-[0.12em] text-white drop-shadow-md">{card.cardNumber.replace(/(\d{4})(?=\d)/g,"$1 ")}</span>
                            <span className="relative mt-4 flex items-end justify-between gap-2"><span className="min-w-0"><span className="block text-[10px] uppercase tracking-widest text-white/55">{locale==="fa"?"صاحب کارت":"Cardholder"}</span><span className="block truncate text-sm font-semibold tracking-wide">{card.cardholderName}</span></span><span className="shrink-0 text-xs text-cyan-200">{selectedCardId===card.id?"✓":locale==="fa"?"انتخاب کارت":"Select card"}</span></span>
                        </button>)}
                        {selectedCardId&&cards.some(card=>card.id===selectedCardId)&&<button type="button" onClick={()=>{const card=cards.find(item=>item.id===selectedCardId);if(card)void navigator.clipboard.writeText(card.cardNumber)}} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs text-cyan-200 hover:bg-white/10"><Copy size={14}/>{locale==="fa"?"کپی شماره کارت":"Copy card number"}</button>}
                        {cards.length===0&&<p className="text-amber-300">No destination card configured.</p>}</div>}
                    <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4" role="note">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 shrink-0 text-amber-300" size={21}/>
                            <div>
                                <p className="font-bold text-amber-100">{locale==="fa"?"بارگذاری رسید پرداخت الزامی است":"Payment receipt is required"}</p>
                                <p className="mt-1 text-sm leading-6 text-amber-100/85">{locale==="fa"?"پس از انتقال وجه به کارت انتخاب‌شده، حتماً عکس یا فایل رسید بانکی را در بخش زیر بارگذاری کنید. بدون رسید، درخواست شارژ ثبت نمی‌شود.":"After transferring money to the selected bank card, you must upload a screenshot, photo or PDF of your bank transfer confirmation. Your top-up cannot be submitted without a receipt."}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <label htmlFor="wallet-receipt-file" className="font-bold">{locale==="fa"?"رسید واریز بانکی":"Bank transfer receipt"} <span className="text-red-300" aria-label="required">*</span></label>
                            <span className="rounded-full bg-red-400/10 px-2 py-1 text-xs font-semibold text-red-200">{locale==="fa"?"اجباری":"Required"}</span>
                        </div>
                        <input ref={receiptInputRef} id="wallet-receipt-file" type="file" required accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" className="sr-only" aria-describedby="wallet-receipt-help wallet-receipt-error" onChange={event=>selectReceipt(event.target.files?.[0]??null)}/>
                        <div onDragOver={event=>{event.preventDefault();setDraggingReceipt(true)}} onDragLeave={event=>{event.preventDefault();setDraggingReceipt(false)}} onDrop={event=>{event.preventDefault();setDraggingReceipt(false);selectReceipt(event.dataTransfer.files[0]??null)}}
                            className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${draggingReceipt?"border-cyan-300 bg-cyan-400/15":receipt?"border-green-400/60 bg-green-400/5":"border-cyan-400/50 bg-cyan-400/5"}`}>
                            {receipt?<div className="flex items-center justify-center gap-3 text-left"><FileCheck2 className="shrink-0 text-green-400" size={28}/><div className="min-w-0"><p className="truncate font-semibold text-green-200">{receipt.name}</p><p className="text-xs text-gray-400">{(receipt.size/1024).toFixed(0)} KB · {locale==="fa"?"آماده ارسال":"Ready to submit"}</p></div><button type="button" aria-label={locale==="fa"?"حذف رسید":"Remove receipt"} onClick={()=>{selectReceipt(null);if(receiptInputRef.current)receiptInputRef.current.value=""}} className="rounded-lg border border-white/20 p-2 hover:bg-white/10"><X size={18}/></button></div>:
                                <><UploadCloud className="mx-auto text-cyan-300" size={36}/><p className="mt-3 font-semibold">{locale==="fa"?"رسید انتقال وجه خود را اینجا بارگذاری کنید":"Upload your transfer receipt here"}</p><p className="mt-1 text-sm text-gray-400">{locale==="fa"?"تصویر صفحه، عکس رسید یا فایل PDF":"Bank app screenshot, receipt photo or PDF"}</p><button type="button" onClick={()=>receiptInputRef.current?.click()} className="mt-4 rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-black hover:bg-cyan-300">{locale==="fa"?"انتخاب فایل رسید":"Choose receipt file"}</button><p className="mt-3 text-xs text-gray-500">{locale==="fa"?"یا فایل را اینجا رها کنید":"Or drag and drop a file here"}</p></>}
                        </div>
                        <p id="wallet-receipt-help" className="mt-2 text-xs text-gray-400">{locale==="fa"?"فرمت‌های مجاز: JPG، PNG، WebP، PDF · حداکثر ۵ مگابایت":"Accepted: JPG, PNG, WebP, PDF · Maximum 5 MB"}</p>
                        {receiptError&&<p id="wallet-receipt-error" role="alert" className="mt-2 text-sm text-red-300">{receiptError}</p>}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-yellow-200/80">{t("depositNotice")}</p>
                    <button type="button" onClick={() => void submitDeposit()} disabled={submitting || loading || method!=="card" || !receipt || !selectedCardId || !/^[0-9]+$/.test(amount.trim()) || Number(amount)<=0}
                        className="mt-8 w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
                        {submitting ? t("submitting") : locale==="fa"?"ارسال رسید و درخواست شارژ":"Submit receipt for review"}
                    </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                        <ArrowUpCircle className="text-red-400"/>{t("withdraw")}
                    </h2>
                    <p className="text-sm leading-7 text-gray-400">{t("withdrawUnavailable")}</p>
                    <button type="button" disabled
                        className="mt-8 w-full cursor-not-allowed rounded-xl border border-white/10 py-3 font-bold text-gray-500">
                        {t("submitWithdraw")}
                    </button>
                </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold">{t("pendingDeposits")}</h2>
                <p className="mt-2 text-sm text-gray-400">{t("depositHistoryNotice")}</p>
                <div className="mt-6 space-y-3">
                    {deposits.length === 0 ? <p className="text-gray-400">{t("noDeposits")}</p>
                        : deposits.map((deposit) => (
                            <div key={deposit.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                                <div>
                                    <p className="font-semibold">{formatMoney(deposit.amountMinor, locale)}</p>
                                    <p className="text-xs text-gray-400">{new Date(deposit.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}</p>
                                </div>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-sm">{deposit.provider==="card_transfer"&&deposit.status==="pending"?(locale==="fa"?"در انتظار بررسی رسید":"Pending receipt review"):deposit.status}</span>
                            </div>
                        ))}
                </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{t("transactions")}</h2>
                        <p className="mt-1 text-xs text-gray-500">{t("recentTransactions")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(["all", "credit", "debit"] as const).map((item) => (
                            <button type="button" key={item} onClick={() => setFilter(item)}
                                className={`rounded-full px-4 py-2 text-sm transition ${filter === item
                                    ? "bg-cyan-400 text-black" : "border border-white/10 text-gray-300 hover:border-cyan-400"}`}>
                                {t(`filters.${item}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-8 space-y-3">
                    {filtered.length === 0 ? <p className="text-gray-400">{t("noTransactions")}</p>
                        : filtered.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                                <div className="flex min-w-0 items-center gap-4">
                                    {transaction.direction === "credit"
                                        ? <ArrowDownCircle className="shrink-0 text-green-400"/>
                                        : <ArrowUpCircle className="shrink-0 text-red-400"/>}
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold">{transaction.reason.replaceAll("_", " ")}</div>
                                        <div className="text-sm text-gray-400">
                                            {new Date(transaction.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
                                        </div>
                                    </div>
                                </div>
                                <div className={`shrink-0 font-bold ${transaction.direction === "credit" ? "text-green-400" : "text-red-400"}`}>
                                    {transaction.direction === "credit" ? "+" : "−"}{formatMoney(transaction.amountMinor, locale)}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
}
