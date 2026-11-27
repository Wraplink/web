"use client";

import {useEffect, useState} from "react";
import {
    Wallet,
    Bitcoin,
    CreditCard,
    Wifi,
    Check,
    Zap,
    Crown
} from "lucide-react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";
import {getMarketPlans, type MarketPlan} from "@/lib/api/plans";
import {formatPlanData, formatPlanPrice} from "@/lib/plan-format";

type Props = {
    locale: string;
};

const payments = [
    {
        key: "wallet",
        icon: Wallet,
    },
    {
        key: "crypto",
        icon: Bitcoin,
    },
    {
        key: "cart",
        icon: CreditCard,
    },
    {
        key: "isp",
        icon: Wifi,
    },
] as const;

export default function PricingContent({locale}: Props) {
    const t = useTranslations("PricingPage");

    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [attempt, setAttempt] = useState(0);
    const numberFormat = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US");

    useEffect(() => {
        let active = true;

        getMarketPlans()
            .then(items => {
                if (!active) return;
                setPlans(items);
                setStatus("ready");
            })
            .catch(() => {
                if (active) setStatus("error");
            });

        return () => { active = false; };
    }, [attempt]);

    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-3xl text-center">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                    {t("badge")}
                </span>

                <h1 className="mt-8 text-5xl font-black lg:text-6xl">
                    {t("title")}
                </h1>

                <p className="mt-8 text-lg leading-8 text-gray-300">
                    {t("description")}
                </p>
            </div>

            {status === "loading" && (
                <p role="status" className="mt-16 text-center text-gray-300">{t("loading")}</p>
            )}

            {status === "error" && (
                <div className="mt-16 text-center">
                    <p role="alert" className="text-red-300">{t("loadError")}</p>
                    <button
                        type="button"
                        className="mt-4 rounded-xl border border-white/20 px-5 py-2 font-semibold"
                        onClick={() => {
                            setStatus("loading");
                            setAttempt(previous => previous + 1);
                        }}
                    >
                        {t("retry")}
                    </button>
                </div>
            )}

            {status === "ready" && plans.length === 0 && (
                <p role="status" className="mt-16 text-center text-gray-300">{t("empty")}</p>
            )}

            {plans.length > 0 && (
                <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map(plan => {
                        const Icon = plan.isPopular ? Crown : Zap;

                        return (
                            <article
                                key={plan.id}
                                className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-400/40"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                    <Icon size={30} className="text-cyan-400" aria-hidden="true"/>
                                </div>

                                {plan.isPopular && (
                                    <p className="mt-4 font-semibold text-cyan-300">{t("popular")}</p>
                                )}
                                <h2 className="mt-6 break-words text-2xl font-black">{plan.name}</h2>
                                {plan.description && <p className="mt-3 break-words text-gray-400">{plan.description}</p>}

                                <p className="mt-8 break-words text-4xl font-black text-cyan-400">
                                    {plan.priceMinor === 0 ? t("free") : formatPlanPrice(plan, locale)}
                                </p>

                                <div className="mb-10 mt-8 space-y-4">
                                    <Feature value={plan.unlimitedBandwidth ? t("unlimited") : formatPlanData(plan.dataLimitBytes, locale)}/>
                                    <Feature value={t("duration", {days: numberFormat.format(plan.durationDays)})}/>
                                    <Feature value="Smart DNS"/>
                                    <Feature value="Gaming Edge"/>
                                </div>

                                <Link
                                    href="/market"
                                    className="mt-auto block rounded-xl bg-cyan-400 py-3 text-center font-bold text-black transition hover:scale-105"
                                >
                                    {plan.priceMinor === 0 ? t("activate") : t("buy")}
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Payment Methods */}

            <div className="mt-24 rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-center text-3xl font-black">
                    {t("paymentTitle")}
                </h2>

                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {payments.map((payment) => {
                        const Icon = payment.icon;

                        return (
                            <div
                                key={payment.key}
                                className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center transition hover:border-cyan-400/30"
                            >
                                <Icon
                                    size={32}
                                    className="mx-auto text-cyan-400"
                                />

                                <p className="mt-4 font-semibold">
                                    {t(`payments.${payment.key}`)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function Feature({value}: {value: string}) {
    return (
        <div className="flex items-center gap-3">
            <Check
                size={18}
                className="text-cyan-400"
            />

            <span>{value}</span>
        </div>
    );
}
