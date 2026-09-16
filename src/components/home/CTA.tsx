import {ArrowRight, Zap} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

type CTAProps = {
    locale: string;
};

export default async function CTA({
                                      locale,
                                  }: CTAProps) {
    const t = await getTranslations({
        locale,
        namespace: "HomePage",
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-24">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-white/5 px-8 py-16 text-center backdrop-blur-xl lg:px-16">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                        <Zap
                            size={32}
                            className="text-cyan-400"
                        />
                    </div>

                    <h2 className="mt-8 text-4xl font-black lg:text-5xl">
                        {t("ctaTitle")}
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                        {t("ctaDescription")}
                    </p>

                    <Link
                        href="/auth/register"
                        className="mt-10 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 font-bold text-black transition hover:scale-105 glow-cyan"
                    >
                        {t("createAccount")}

                        <ArrowRight
                            size={20}
                            className="rtl:rotate-180"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}