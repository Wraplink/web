import {Globe, Shield, Zap} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

type HeroProps = {
    locale: string;
};

export default async function Hero({locale}: HeroProps) {
    const t = await getTranslations({
        locale,
        namespace: "HomePage",
    });

    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:py-36">
                <div className="max-w-3xl">

                    <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                        {t("badge")}
                    </span>

                    <h1 className="mt-8 text-5xl font-black leading-tight lg:text-7xl">
                        {t("heroTitle")}

                        <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {t("heroTitleAccent")}
                        </span>
                    </h1>

                    <p className="mt-8 text-lg leading-8 text-gray-300">
                        {t("heroDescription")}
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">

                        <Link
                            href="/auth/register"
                            className="rounded-xl bg-cyan-400 px-8 py-4 font-bold text-black transition hover:scale-105 glow-cyan"
                        >
                            {t("getStarted")}
                        </Link>

                        <Link
                            href="/pricing"
                            className="rounded-xl border border-white/20 px-8 py-4 font-semibold transition hover:border-cyan-400"
                        >
                            {t("viewPlans")}
                        </Link>

                    </div>
                </div>

                <div className="mt-24 grid gap-6 md:grid-cols-3">

                    <Feature
                        icon={<Zap className="text-cyan-400" size={32}/>}
                        title={t("features.latencyTitle")}
                        description={t("features.latencyDescription")}
                    />

                    <Feature
                        icon={<Shield className="text-purple-400" size={32}/>}
                        title={t("features.securityTitle")}
                        description={t("features.securityDescription")}
                    />

                    <Feature
                        icon={<Globe className="text-green-400" size={32}/>}
                        title={t("features.dnsTitle")}
                        description={t("features.dnsDescription")}
                    />

                </div>
            </div>
        </section>
    );
}

function Feature({
                     icon,
                     title,
                     description,
                 }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            {icon}

            <h3 className="mt-4 text-xl font-bold">
                {title}
            </h3>

            <p className="mt-3 text-gray-400">
                {description}
            </p>
        </div>
    );
}