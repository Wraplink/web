"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {clearBasket, getBasket, type BasketItem} from "@/lib/basket";
import {getMarketPlans, createPendingSubscription, paySubscriptionWithWallet, type MarketPlan} from "@/lib/api/plans";
import {listSubscriptions} from "@/lib/api/subscriptions";
import {quoteDiscount, submitCardReceipt, type DiscountQuote} from "@/lib/api/checkout";

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
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [method, setMethod] = useState<"card" | "isp" | "crypto">("card");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [receiptError, setReceiptError] = useState("");
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [quote, setQuote] = useState<DiscountQuote | null>(null);
    const pendingId = useRef<string | null>(null);
    const submitting = useRef(false);
    const paymentKey = useRef<string | null>(null);

    const load = async () => {
        setChecking(true);
        setError("");
        try {
            const catalog = await getMarketPlans();
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

    const singlePlan = lines.length === 1 && lines[0]?.item.quantity === 1;
    const canSubmit = !loading && method === "card" && valid && singlePlan && receipt !== null && !receiptError;
    const onReceiptChange = (file: File | null) => {
        setReceipt(null);
        setReceiptError("");
        if (!file) return;
        const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowed.includes(file.type)) {setReceiptError(locale === "fa" ? "فرمت فایل باید JPG، PNG، WebP یا PDF باشد." : "Use a JPG, PNG, WebP, or PDF receipt.");return;}
        if (file.size === 0 || file.size > 5 * 1024 * 1024) {setReceiptError(locale === "fa" ? "حجم فایل باید بیشتر از صفر و حداکثر ۵ مگابایت باشد." : "Receipt must be nonempty and at most 5 MB.");return;}
        setReceipt(file);
    };

    const prepareSubscription = async () => {
        if (lines.length !== 1 || lines[0].item.quantity !== 1 || !valid) throw new Error("Checkout supports one valid plan at a time.");
        const plan = lines[0].plan!;
        if (!pendingId.current) {
            const existing = (await listSubscriptions()).find(s => s.planCode === plan.code && s.status === "pending_payment" && s.priceMinor === plan.priceMinor && s.currency === plan.currency);
            pendingId.current = existing?.id ?? (await createPendingSubscription(plan.code)).id;
        }
        return pendingId.current;
    };

    const applyDiscount = async () => {
        setError("");
        setLoading(true);
        try {
            const id = await prepareSubscription();
            setQuote(await quoteDiscount(id, discountCode));
        } catch (e) { setQuote(null); setError(e instanceof Error ? e.message : "Invalid discount"); }
        finally { setLoading(false); }
    };

    const pay = async () => {
        if (submitting.current || loading) return;
        if (!valid || method !== "card" || !receipt || !!receiptError || !singlePlan) {
            setError("Select a valid plan and attach a transfer receipt.");
            return;
        }
        const selectedReceipt = receipt;
        submitting.current = true;
        setLoading(true);
        setError("");
        try {
            const id = await prepareSubscription();
            const saved = await submitCardReceipt(id, selectedReceipt, discountCode);
            if (saved.status !== "pending_review") throw new Error("Receipt was not accepted.");
            clearBasket();
            router.push("/orders");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Payment failed. Please check Orders before retrying.");
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
                                <div className="mt-5 rounded-2xl border-2 border-dashed border-cyan-400/70 bg-cyan-400/10 p-5 text-center">
                                    <div className="text-3xl" aria-hidden="true">📎</div>
                                    <h3 className="mt-2 text-base font-bold">{locale === "fa" ? "پیوست رسید پرداخت" : "Attach your payment receipt"}</h3>
                                    <p className="mt-2 text-sm text-gray-300">{locale === "fa" ? "تصویر رسید کارت‌به‌کارت یا فایل PDF را بارگذاری کنید." : "Upload a screenshot or photo of your card transfer receipt."}</p>
                                    <input ref={receiptInputRef} id="transfer-receipt" aria-label={locale === "fa" ? "انتخاب تصویر رسید پرداخت" : "Choose payment receipt image"} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={event => onReceiptChange(event.target.files?.[0] ?? null)} />
                                    <button type="button" onClick={() => receiptInputRef.current?.click()} className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                                        {locale === "fa" ? "📁 انتخاب تصویر یا فایل رسید" : "📁 Choose receipt image or PDF"}
                                    </button>
                                    <p className="mt-3 text-xs text-gray-400">{locale === "fa" ? "JPG، PNG، WebP یا PDF — حداکثر ۵ مگابایت" : "JPG, PNG, WebP or PDF — maximum 5 MB"}</p>
                                    {receipt && <p className="mt-3 break-all rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-300">✓ {locale === "fa" ? "فایل انتخاب‌شده:" : "Selected file:"} {receipt.name}</p>}
                                    {receiptError && <p role="alert" className="mt-3 text-sm text-red-300">{receiptError}</p>}
                                    {!receipt && !receiptError && <p className="mt-3 text-xs text-amber-300">{locale === "fa" ? "پیوست رسید برای ثبت پرداخت الزامی است." : "A receipt is required before submitting payment."}</p>}
                                </div>
                                <label className="mt-4 block text-sm">{locale === "fa" ? "کد تخفیف (اختیاری)" : "Discount code (optional)"}</label>
                                <input className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 p-2" value={discountCode} onChange={event => {setDiscountCode(event.target.value);setQuote(null);}} placeholder={locale === "fa" ? "کد تخفیف" : "Discount code"} />
                                <button type="button" disabled={loading || !valid} onClick={() => void applyDiscount()} className="mt-2 text-sm text-cyan-400">{locale === "fa" ? "اعمال تخفیف" : "Apply discount"}</button>
                                {quote && <p className="mt-2 text-sm text-green-300">{locale === "fa" ? "تخفیف:" : "Discount:"} {formatMoney(quote.discountMinor, quote.currency, locale)} — {locale === "fa" ? "مبلغ قابل پرداخت:" : "Payable:"} {formatMoney(quote.payableMinor, quote.currency, locale)}</p>}
                                <p className="mt-4 text-sm text-gray-400">{locale === "fa" ? "مبلغ انتقال:" : "Amount to transfer:"} {valid ? formatMoney(quote?.payableMinor ?? total, currency, locale) : "—"}. {locale === "fa" ? "اطلاعات حساب مقصد باید توسط مدیر پرداخت اعلام شود." : "Bank transfer details must be provided by an authorized payment administrator."}</p>
                            </>}
                            {!singlePlan && items.length > 0 && <p role="status" className="mt-4 text-sm text-amber-300">{locale === "fa" ? "در هر پرداخت فقط یک پلن با تعداد ۱ قابل خرید است. لطفاً سبد خرید را اصلاح کنید." : "Checkout supports one plan with quantity 1 per payment. Please update your basket."} <Link href="/basket" className="underline">{locale === "fa" ? "ویرایش سبد" : "Edit basket"}</Link></p>}
                            {!valid && !checking && <p role="status" className="mt-3 text-sm text-amber-300">{locale === "fa" ? "قیمت یا پلن معتبر نیست؛ سبد خرید را بررسی کنید." : "Plan or price is invalid. Check your basket."}</p>}
                            <button type="button" disabled={!canSubmit}
                                onClick={() => void pay()} className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">
                                {loading ? t("processing") : locale === "fa" ? "ثبت رسید برای بررسی" : "Submit receipt for review"}
                            </button>
                            <button type="button" onClick={() => void load()} disabled={loading} className="mt-4 w-full text-sm text-cyan-400">{locale === "fa" ? "به‌روزرسانی قیمت‌ها" : "Refresh prices"}</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
