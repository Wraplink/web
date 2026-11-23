"use client";

import {useEffect, useState} from "react";
import {Wallet, Bitcoin, CreditCard, Wifi, Check, Zap, Shield, Crown, RefreshCw} from "lucide-react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {getMarketPlans, type MarketPlan} from "@/lib/api/plans";

type Props = {locale: string};

const payments = [
    {key: "wallet", icon: Wallet},
    {key: "crypto", icon: Bitcoin},
    {key: "cart", icon: CreditCard},
    {key: "isp", icon: Wifi},
] as const;

function formatPrice(plan: MarketPlan, locale: string) {
    if (plan.priceMinor === 0) return locale === "fa" ? "رایگان" : "Free";
    const currency = plan.currency.toUpperCase();
    const amount = plan.priceMinor / (currency === "IRR" ? 1 : 100);
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency", currency, maximumFractionDigits: currency === "IRR" ? 0 : 2,
    }).format(amount);
}

function formatData(bytes: number, locale: string) {
    if (!Number.isFinite(bytes) || bytes <= 0) return locale === "fa" ? "نامشخص" : "Unknown";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let amount = bytes;
    let index = 0;
    while (amount >= 1024 && index < units.length - 1) {amount /= 1024; index++;}
    return `${new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {maximumFractionDigits: 1}).format(amount)} ${units[index]}`;
}

export default function PricingContent({locale}: Props) {
    const t = useTranslations("PricingPage");
    const fa = locale === "fa";
    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        getMarketPlans()
            .then(items => {if (active) {setPlans(items); setError(false);}})
            .catch(() => {if (active) {setPlans([]); setError(true);}})
            .finally(() => {if (active) setLoading(false);});
        return () => {active = false;};
    }, [retry]);

    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-3xl text-center">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">{t("badge")}</span>
                <h1 className="mt-8 text-5xl font-black lg:text-6xl">{t("title")}</h1>
                <p className="mt-8 text-lg leading-8 text-gray-300">{t("description")}</p>
            </div>
            {loading ? (
                <p role="status" className="mt-16 text-center text-gray-300">{fa ? "در حال بارگذاری پلن‌ها…" : "Loading plans…"}</p>
            ) : error ? (
                <div role="alert" className="mt-16 text-center">
                    <p>{fa ? "دریافت پلن‌ها ناموفق بود." : "Unable to load plans."}</p>
                    <button type="button" onClick={() => {setLoading(true); setRetry(value => value + 1);}} className="mx-auto mt-4 flex items-center gap-2 text-cyan-400"><RefreshCw size={16}/>{fa ? "تلاش دوباره" : "Retry"}</button>
                </div>
            ) : plans.length === 0 ? (
                <p className="mt-16 text-center text-gray-300">{fa ? "در حال حاضر پلنی موجود نیست." : "No plans are currently available."}</p>
            ) : (
                <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan, index) => {
                        const Icon = plan.isPopular ? Crown : index % 2 === 0 ? Zap : Shield;
                        return (
                            <article key={plan.id} className="group flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-400/40">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10"><Icon size={30} className="text-cyan-400"/></div>
                                {plan.isPopular && <span className="mt-4 text-sm font-bold text-amber-300">{fa ? "محبوب‌ترین" : "Most popular"}</span>}
                                <h2 className="mt-6 text-2xl font-black">{plan.name}</h2>
                                <p className="mt-3 text-gray-400">{plan.description}</p>
                                <div className="mt-8 break-words text-3xl font-black text-cyan-400">{formatPrice(plan, locale)}</div>
                                <div className="mt-8 space-y-4">
                                    <Feature value={plan.unlimitedBandwidth ? (fa ? "حجم نامحدود" : "Unlimited bandwidth") : formatData(plan.dataLimitBytes, locale)}/>
                                    <Feature value={`${new Intl.NumberFormat(fa ? "fa-IR" : "en-US").format(plan.durationDays)} ${fa ? "روز" : "days"}`}/>
                                </div>
                                <Link href={`/market?plan=${encodeURIComponent(plan.code)}`} className="mt-10 block rounded-xl bg-cyan-400 py-3 text-center font-bold text-black transition hover:scale-105">{plan.priceMinor === 0 ? (fa ? "دریافت رایگان" : "Get free plan") : t("buy")}</Link>
                            </article>
                        );
                    })}
                </div>
            )}
            <div className="mt-24 rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-center text-3xl font-black">{t("paymentTitle")}</h2>
                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {payments.map(payment => {
                        const Icon = payment.icon;
                        return <div key={payment.key} className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center transition hover:border-cyan-400/30"><Icon size={32} className="mx-auto text-cyan-400"/><p className="mt-4 font-semibold">{t(`payments.${payment.key}`)}</p></div>;
                    })}
                </div>
            </div>
        </section>
    );
}

function Feature({value}: {value: string}) {
    return <div className="flex items-center gap-3"><Check size={18} className="shrink-0 text-cyan-400"/><span>{value}</span></div>;
}
