"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {clearBasket, getBasket, type BasketItem} from "@/lib/basket";
import {getMarketPlans, createPendingSubscription, paySubscriptionWithWallet, type MarketPlan} from "@/lib/api/plans";
import {quoteDiscount, submitGroupedCardReceipt, type DiscountQuote} from "@/lib/api/checkout";
import {listPaymentCards, type PaymentCard} from "@/lib/api/paymentCards";

type Props = {locale: string};

function formatMoney(amount: number, currency: string, locale: string) {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency", currency,
    }).format(amount / (currency === "IRR" ? 1 : 100));
}

export default function CheckoutContent({locale}: Props) {
    const t = useTranslations("CheckoutPage");
    const router = useRouter();
    const [items, setItems] = useState<BasketItem[]>([]);
    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [cards, setCards] = useState<PaymentCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [method, setMethod] = useState<"card" | "isp" | "crypto">("card");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [receiptError, setReceiptError] = useState("");
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [quote, setQuote] = useState<DiscountQuote | null>(null);
    const pendingIds = useRef<string[]>([]);

    const submitting = useRef(false);
    const paymentKey = useRef<string | null>(null);

    const load = async () => {
        setChecking(true);
        setError("");
        try {
            const [catalog, availableCards] = await Promise.all([getMarketPlans(),listPaymentCards()]);
            setCards(availableCards);
            setSelectedCardId(current => availableCards.some(card => card.id === current) ? current : (availableCards[0]?.id ?? ""));
            setItems(getBasket());
            setPlans(catalog);
        } catch {
            setError("Could not verify plan prices or wallet balance. Please retry.");
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const lines = useMemo(() => items.map(item => ({
        item, plan: plans.find(plan => plan.code === item.id),
    })), [items, plans]);
    const currency = lines[0]?.plan?.currency ?? "";
    const valid = lines.length > 0 && lines.every(({item, plan}) =>
        plan && Number.isInteger(item.quantity) && item.quantity > 0 &&
        plan.currency === currency && Number.isSafeInteger(plan.priceMinor) && plan.priceMinor >= 0
    );
    const total = valid ? lines.reduce((sum, {item, plan}) => sum + item.quantity * plan!.priceMinor, 0) : 0;

    const units = useMemo(() => lines.flatMap(({item, plan}) => Array.from({length: Math.min(item.quantity, 100)}, () => plan)), [lines]);
    const canSubmit = !loading && method === "card" && valid && units.length > 0 && units.length <= 100 && receipt !== null && !!selectedCardId && !receiptError;
    const onReceiptChange = (files: FileList | null) => {
        setReceipt(null);
        setReceiptError("");
        if (!files) return;
        const selected = Array.from(files);
        const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (selected.some(file => !allowed.includes(file.type))) {setReceiptError(locale === "fa" ? "فرمت فایل باید JPG، PNG، WebP یا PDF باشد." : "Each receipt must be JPG, PNG, WebP or PDF.");return;}
        if (selected.some(file => file.size === 0 || file.size > 5 * 1024 * 1024)) {setReceiptError(locale === "fa" ? "حجم هر فایل باید حداکثر ۵ مگابایت باشد." : "Each receipt must be nonempty and at most 5 MB.");return;}
        if (selected.length !== 1) {setReceiptError(locale === "fa" ? "فقط یک رسید برای کل سبد انتخاب کنید." : "Select one receipt for the entire basket.");return;}
        setReceipt(selected[0]);
    };

    const prepareSubscription = async (index: number) => {
        if (!valid || !units[index]) throw new Error("Invalid plan");
        if (!pendingIds.current[index]) {
            pendingIds.current[index] = (await createPendingSubscription(units[index]!.code)).id;
        }
        return pendingIds.current[index];
    };

    const applyDiscount = async () => {
        setError("");
        if (units.length !== 1) {
            setError(locale === "fa" ? "کد تخفیف در حال حاضر فقط برای خرید تک‌پلن پشتیبانی می‌شود." : "Discount codes currently support single-plan checkout only.");
            return;
        }
        setLoading(true);
        try {
            const id = await prepareSubscription(0);
            setQuote(await quoteDiscount(id, discountCode));
        } catch (e) { setQuote(null); setError(e instanceof Error ? e.message : "Invalid discount"); }
        finally { setLoading(false); }
    };

    const pay = async () => {
        if (submitting.current || loading) return;
        if (!canSubmit) {
            setError(locale === "fa" ? "برای هر سفارش یک رسید پرداخت معتبر انتخاب کنید." : "Attach a separate valid transfer receipt for each order.");
            return;
        }
        submitting.current = true;
        setLoading(true);
        setError("");
        try {
            const ids: string[] = [];
            for (let i = 0; i < units.length; i++) ids.push(await prepareSubscription(i));
            const saved = await submitGroupedCardReceipt(ids, receipt!, selectedCardId);
            if (saved.status !== "pending_review") throw new Error("Receipt was not accepted.");
            clearBasket();
            router.push("/orders");
        } catch (e) {
            setError((e instanceof Error ? e.message : "Payment failed.") + (locale === "fa" ? " سفارش‌های ثبت‌شده حفظ شده‌اند. پس از بررسی مجدداً تلاش کنید." : " Already submitted orders are preserved. Check Orders before retrying."));
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/basket" className="text-cyan-400">← {t("backToBasket")}</Link>
                <h1 className="mt-6 text-4xl font-black">{t("title")}</h1>
                <p className="mt-2 text-gray-400">{t("subtitle")}</p>
                {error && <div role="alert" className="mt-6 rounded-xl border border-red-400/30 p-4 text-red-300">{error}</div>}
                {checking ? <p className="mt-8 text-gray-400">{t("loading")}</p> : (
                    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-xl font-bold">{t("summary.title")}</h2>
                            {lines.map(({item, plan}) => (
                                <div key={item.id} className="mt-4 flex justify-between gap-3 border-b border-white/10 pb-4">
                                    <span>{plan?.name ?? item.name} × {item.quantity}</span>
                                    <span>{plan ? formatMoney(plan.priceMinor * item.quantity, plan.currency, locale) : "Unavailable"}</span>
                                </div>
                            ))}
                            {items.length === 0 && <p className="mt-5 text-gray-400">{t("empty.description")}</p>}
                            <div className="mt-5 flex justify-between font-bold">
                                <span>{t("summary.total")}</span>
                                <span>{valid ? formatMoney(total, currency, locale) : "—"}</span>
                            </div>
                        </div>
                        <div className="h-fit rounded-2xl border border-cyan-400/20 bg-white/5 p-6">
                            <h2 className="text-xl font-bold">{t("paymentMethod")}</h2>
                            <div className="mt-4 space-y-2">
                                {(["card", "isp", "crypto"] as const).map(value => (
                                    <label key={value} className="flex items-center gap-2 text-sm">
                                        <input type="radio" name="paymentMethod" checked={method === value} onChange={() => setMethod(value)} />
                                        {value === "card" ? t("methods.card") : value === "isp" ? t("methods.isp") : t("methods.crypto")}
                                        {value !== "card" && <span className="text-amber-300">(Coming soon)</span>}
                                    </label>
                                ))}
                            </div>
                            {method === "card" && <>
                                <div className="mt-5">
                                    <h3 className="text-base font-bold">{locale === "fa" ? "انتخاب کارت مقصد" : "Choose destination card"}</h3>
                                    <p className="mt-1 text-xs text-gray-400">{locale === "fa" ? "وجه را به کارت انتخاب‌شده انتقال دهید و سپس رسید را بارگذاری کنید." : "Transfer the amount to the selected card, then attach your receipt."}</p>
                                    <div className="mt-3 grid gap-3">
                                        {cards.map(card => <button key={card.id} type="button" aria-pressed={selectedCardId===card.id} onClick={()=>setSelectedCardId(card.id)}
                                            className={`w-full rounded-2xl border-2 p-5 text-left shadow-lg transition ${selectedCardId===card.id ? "border-cyan-300 bg-gradient-to-br from-cyan-950 via-slate-800 to-indigo-950 ring-2 ring-cyan-400/30" : "border-white/20 bg-gradient-to-br from-slate-800 to-slate-950 hover:border-cyan-400/50"}`}>
                                            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-widest text-cyan-200">{card.bankName}</span><span className="text-xl" aria-hidden="true">💳</span></div>
                                            <div dir="ltr" className="mt-5 text-center font-mono text-lg font-bold tracking-wider text-white">{card.cardNumber.replace(/(\\d{4})(?=\\d)/g,"$1 ")}</div>
                                            <div className="mt-4 flex items-center justify-between text-xs text-gray-300"><span>{card.cardholderName}</span><span>{selectedCardId===card.id ? (locale==="fa"?"✓ انتخاب شده":"✓ Selected") : (locale==="fa"?"انتخاب کارت":"Select card")}</span></div>
                                        </button>)}
                                    </div>
                                    {cards.length===0 && <p role="alert" className="mt-3 text-sm text-amber-300">{locale==="fa"?"کارت مقصد فعالی ثبت نشده است.":"No active payment card is configured. Please contact support."}</p>}
                                </div>

                                <div className="mt-5 rounded-2xl border-2 border-dashed border-cyan-400/70 bg-cyan-400/10 p-5 text-center">
                                    <div className="text-3xl" aria-hidden="true">📎</div>
                                    <h3 className="mt-2 text-base font-bold">{locale === "fa" ? "پیوست رسید پرداخت" : "Attach your payment receipt"}</h3>
                                    <p className="mt-2 text-sm text-gray-300">{locale === "fa" ? "یک رسید انتقال برای مبلغ کل سبد بارگذاری کنید. همه پلن‌ها با هم بررسی می‌شوند." : "Upload one transfer receipt covering the full basket total. All plans will be reviewed together."}</p>
                                    <input ref={receiptInputRef} id="transfer-receipt" aria-label={locale === "fa" ? "انتخاب تصویر رسید پرداخت" : "Choose payment receipt image"} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={event => onReceiptChange(event.target.files)} />
                                    <button type="button" onClick={() => receiptInputRef.current?.click()} className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                                        {locale === "fa" ? "📁 انتخاب تصویر یا فایل رسید" : "📁 Choose receipt image or PDF"}
                                    </button>
                                    <p className="mt-3 text-xs text-gray-400">{locale === "fa" ? "JPG، PNG، WebP یا PDF — حداکثر ۵ مگابایت" : "JPG, PNG, WebP or PDF — maximum 5 MB"}</p>
                                    {receipt && <p className="mt-3 break-all rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-300">✓ {locale === "fa" ? "رسیدهای انتخاب‌شده:" : "Selected receipts:"} {receipt.name}</p>}
                                    {receiptError && <p role="alert" className="mt-3 text-sm text-red-300">{receiptError}</p>}
                                    {!receipt && !receiptError && <p className="mt-3 text-xs text-amber-300">{locale === "fa" ? "پیوست رسید برای ثبت پرداخت الزامی است." : "A receipt is required before submitting payment."}</p>}
                                </div>
                                <label className="mt-4 block text-sm">{locale === "fa" ? "کد تخفیف (اختیاری)" : "Discount code (optional)"}</label>
                                <input className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 p-2" value={discountCode} onChange={event => {setDiscountCode(event.target.value);setQuote(null);}} placeholder={locale === "fa" ? "کد تخفیف" : "Discount code"} />
                                <button type="button" disabled={loading || !valid || units.length !== 1} onClick={() => void applyDiscount()} className="mt-2 text-sm text-cyan-400">{locale === "fa" ? "اعمال تخفیف" : "Apply discount"}</button>
                                {quote && <p className="mt-2 text-sm text-green-300">{locale === "fa" ? "تخفیف:" : "Discount:"} {formatMoney(quote.discountMinor, quote.currency, locale)} — {locale === "fa" ? "مبلغ قابل پرداخت:" : "Payable:"} {formatMoney(quote.payableMinor, quote.currency, locale)}</p>}
                                <p className="mt-4 text-sm text-gray-400">{locale === "fa" ? "مبلغ انتقال:" : "Amount to transfer:"} {valid ? formatMoney(quote?.payableMinor ?? total, currency, locale) : "—"}. {locale === "fa" ? "اطلاعات حساب مقصد باید توسط مدیر پرداخت اعلام شود." : "Bank transfer details must be provided by an authorized payment administrator."}</p>
                            </>}
                            {valid && units.length > 1 && <p role="status" className="mt-4 text-sm text-amber-300">{locale === "fa" ? `یک رسید برای هر ${units.length} پلن کافی است. مدیر مبلغ کل پرداخت را بررسی می‌کند.` : `One receipt covers all ${units.length} plans. The administrator will review the combined payment.`}</p>}
                            {!valid && !checking && <p role="status" className="mt-3 text-sm text-amber-300">{locale === "fa" ? "قیمت یا پلن معتبر نیست؛ سبد خرید را بررسی کنید." : "Plan or price is invalid. Check your basket."}</p>}
                            <button type="button" disabled={!canSubmit}
                                onClick={() => void pay()} className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">
                                {loading ? t("processing") : locale === "fa" ? "ثبت رسیدها برای بررسی" : "Submit receipts for review"}
                            </button>
                            <button type="button" onClick={() => void load()} disabled={loading} className="mt-4 w-full text-sm text-cyan-400">{locale === "fa" ? "به‌روزرسانی قیمت‌ها" : "Refresh prices"}</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
