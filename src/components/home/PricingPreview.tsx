import {
    Check,
    Zap,
    Shield,
    Crown,
} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

type PricingPreviewProps = {
    locale: string;
};

const plans = [
    {
        key: "starter",
        icon: Zap,
    },
    {
        key: "pro",
        icon: Shield,
    },
    {
        key: "ultimate",
        icon: Crown,
    },
] as const;

export default async function PricingPreview({
                                                 locale,
                                             }: PricingPreviewProps) {
    const t = await getTranslations({
        locale,
        namespace: "HomePage",
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-black lg:text-5xl">
                    {t("pricingTitle")}
                </h2>

                <p className="mt-6 text-lg leading-8 text-gray-400">
                    {t("pricingDescription")}
                </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
                {plans.map((plan) => {
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.key}
                            className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                <Icon
                                    size={28}
                                    className="text-cyan-400"
                                />
                            </div>

                            <h3 className="mt-6 text-2xl font-black">
                                {t(`plans.${plan.key}`)}
                            </h3>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Check
                                        size={18}
                                        className="text-cyan-400"
                                    />
                                    <span>
                                        Gamer optimized routing
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-300">
                                    <Check
                                        size={18}
                                        className="text-cyan-400"
                                    />
                                    <span>
                                        Secure DNS connection
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-300">
                                    <Check
                                        size={18}
                                        className="text-cyan-400"
                                    />
                                    <span>
                                        Bandwidth monitoring
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/pricing"
                                className="mt-8 rounded-xl border border-white/10 px-5 py-3 text-center font-semibold transition hover:border-cyan-400 hover:text-cyan-400"
                            >
                                {t("explorePricing")}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}