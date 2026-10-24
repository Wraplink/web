import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";

type HeroProps = {locale: string};

export default async function Hero({locale}: HeroProps) {
    const t = await getTranslations({locale, namespace: "HomePage"});
    return (
        <section className="relative overflow-hidden bg-[#030816]" aria-label={t("heroTitle")}>
            <div className="relative mx-auto w-full max-w-[1920px]">
                <Image
                    src="/wraplink-home-hero.webp"
                    alt="Wraplink roaring blue lion above a global network and a gamer at a multi-monitor gaming station"
                    width={1672}
                    height={940}
                    priority
                    sizes="100vw"
                    className="h-auto w-full"
                />
            </div>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-6 pb-8 pt-4">
                <Link href="/auth/register" className="rounded-xl bg-cyan-400 px-7 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">{t("getStarted")}</Link>
                <Link href="/pricing" className="rounded-xl border border-cyan-300/50 bg-white/5 px-7 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">{t("viewPlans")}</Link>
            </div>
        </section>
    );
}
