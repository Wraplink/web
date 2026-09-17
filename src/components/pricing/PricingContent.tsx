"use client";

import {useState} from "react";
import {
    Wallet,
    Bitcoin,
    CreditCard,
    Wifi,
    Check,
    Zap,
    Shield,
    Crown
} from "lucide-react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

const plans = [
    {
        key: "starter",
        icon: Zap,
        monthly: 5,
    },
    {
        key: "pro",
        icon: Shield,
        monthly: 12,
    },
    {
        key: "ultimate",
        icon: Crown,
        monthly: 25,
    },
] as const;

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

    const [billing, setBilling] = useState<"monthly" | "yearly">(
        "monthly",
    );

    const formatPrice = (monthly: number) => {
        if (billing === "monthly") {
            return locale === "fa"
                ? `${monthly} دلار`
                : `$${monthly}`;
        }

        const yearly = Math.round(monthly * 12 * 0.8);

        return locale === "fa"
            ? `${yearly} دلار`
            : `$${yearly}`;
    };

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

            {/* Billing Switch */}

            <div className="mt-16 flex justify-center">
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
                    <button
                        onClick={() => setBilling("monthly")}
                        className={`rounded-full px-6 py-2 font-semibold transition ${
                            billing === "monthly"
                                ? "bg-cyan-400 text-black"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        {t("monthly")}
                    </button>

                    <button
                        onClick={() => setBilling("yearly")}
                        className={`rounded-full px-6 py-2 font-semibold transition ${
                            billing === "yearly"
                                ? "bg-cyan-400 text-black"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        {t("yearly")}
                    </button>
                </div>
            </div>

            {billing === "yearly" && (
                <div className="mt-6 text-center">
        <span className="rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm text-green-300">
            20% OFF
        </span>
                </div>
            )}

            {/* Pricing Cards */}

                <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
                const Icon = plan.icon;

                return (
                <div
                key={plan.key}
                 className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-400/40"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Icon
                    size={30}
                    className="text-cyan-400"
                />
            </div>

            <h3 className="mt-6 text-2xl font-black">
                {t(`plans.${plan.key}.name`)}
            </h3>

            <p className="mt-3 text-gray-400">
                {t(`plans.${plan.key}.description`)}
            </p>

            <div className="mt-8 text-5xl font-black text-cyan-400">
                {formatPrice(plan.monthly)}
            </div>

            <div className="mt-2 text-sm text-gray-400">
                {billing === "monthly"
                    ? t("monthly")
                    : t("yearly")}
            </div>

            <div className="mt-8 space-y-4">
                <Feature
                    value={t(
                        `plans.${plan.key}.bandwidth`,
                    )}
                />

                <Feature
                    value={
                        billing === "monthly"
                            ? t(
                                `plans.${plan.key}.duration`,
                            )
                            : locale === "fa"
                                ? "۳۶۵ روز"
                                : "365 Days"
                    }
                />

                <Feature value="Smart DNS"/>

                <Feature value="Gaming Edge"/>
            </div>

            <Link
                href="/market"
                className="mt-10 block rounded-xl bg-cyan-400 py-3 text-center font-bold text-black transition hover:scale-105"
            >
                {t("buy")}
            </Link>
        </div>
    );
})}
</div>

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