import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";

type HeroProps = {locale: string};

export default async function Hero({locale}: HeroProps) {
    const t = await getTranslations({locale, namespace: "HomePage"});
    return (
        <section className="relative overflow-hidden bg-[#030816]" aria-label={t("heroTitle")}>
            <div className="relative mx-auto w-full max-w-[1920px]">
                {/* Crop the bottom benefit strip embedded in the approved artwork. */}
                <div className="relative aspect-[1672/800] w-full overflow-hidden">
                    <Image
                        src="/wraplink-home-hero.webp"
                        alt="Wraplink roaring blue lion above a global network and a gamer at a multi-monitor gaming station"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-top"
                    />
                    {/* Hide the rasterized CTAs; functional localized links replace them. */}
                    <div aria-hidden="true" className="absolute left-[8.3%] top-[37.1%] h-[7.2%] w-[24%] rounded-xl bg-[#07162c]/90 backdrop-blur-2xl max-sm:hidden" />
                    <div className="absolute left-[8.7%] top-[37.1%] hidden items-center gap-[1.2vw] sm:flex">
                        <Link href="/auth/register" className="inline-flex min-h-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-[2.3vw] py-[.85vw] text-[clamp(10px,1vw,17px)] font-bold text-white shadow-[0_0_24px_rgba(0,165,255,.45)] transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                            {t("getStarted")} <span aria-hidden="true" className="ms-2">→</span>
                        </Link>
                        <Link href="/pricing" className="inline-flex min-h-9 items-center justify-center rounded-full border border-cyan-400 bg-[#020b1c]/90 px-[2.3vw] py-[.85vw] text-[clamp(10px,1vw,17px)] font-semibold text-white transition hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                            {t("viewPlans")}
                        </Link>
                    </div>
                    {/* Small screens use accessible buttons outside the cropped artwork. */}
                    <div aria-hidden="true" className="absolute left-[8%] top-[36%] h-[10%] w-[35%] rounded-lg bg-[#07162c]/90 backdrop-blur-xl sm:hidden"/>
                </div>
            </div>
            <div className="mx-auto flex flex-wrap items-center justify-center gap-4 px-6 py-5 sm:hidden">
                <Link href="/auth/register" className="rounded-xl bg-cyan-400 px-7 py-3 font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-cyan-300">{t("getStarted")}</Link>
                <Link href="/pricing" className="rounded-xl border border-cyan-300/50 bg-white/5 px-7 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-cyan-300">{t("viewPlans")}</Link>
            </div>
        </section>
    );
}
