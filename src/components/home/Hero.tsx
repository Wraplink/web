import {ArrowRight, Globe2, ShieldCheck, Zap} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";

type HeroProps = {locale: string};

export default async function Hero({locale}: HeroProps) {
    const t = await getTranslations({locale, namespace: "HomePage"});
    return (
        <section className="wraplink-hero relative isolate overflow-hidden border-b border-cyan-300/10">
            <div aria-hidden="true" className="wraplink-hero-grid absolute inset-0 -z-10"/>
            <div aria-hidden="true" className="wraplink-hero-aura absolute inset-0 -z-10"/>
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-14 pt-20 lg:min-h-[680px] lg:grid-cols-[1.03fr_.97fr] lg:gap-8 lg:pb-20 lg:pt-24">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#00E5FF]"/>
                        {t("badge")}
                    </span>
                    <h1 className="mt-7 text-4xl font-black leading-[1.13] tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {t("heroTitle")}
                        <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">{t("heroTitleAccent")}</span>
                    </h1>
                    <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">{t("heroDescription")}</p>
                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 shadow-[0_0_30px_rgba(0,229,255,.27)] transition hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                            {t("getStarted")} <ArrowRight size={19} aria-hidden="true"/>
                        </Link>
                        <Link href="/pricing" className="rounded-xl border border-white/25 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur transition hover:border-cyan-300/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">{t("viewPlans")}</Link>
                    </div>
                </div>
                <div className="relative mx-auto flex w-full max-w-[650px] items-center justify-center" aria-hidden="true">
                    <img src="/wraplink-roaring-hero.svg" alt="" className="w-full drop-shadow-[0_0_65px_rgba(0,180,255,.25)]" />
                </div>
            </div>
            <div className="mx-auto grid max-w-7xl gap-3 px-6 pb-10 md:grid-cols-3">
                <Feature icon={<Zap size={23}/>} title={t("features.latencyTitle")} description={t("features.latencyDescription")}/>
                <Feature icon={<ShieldCheck size={23}/>} title={t("features.securityTitle")} description={t("features.securityDescription")}/>
                <Feature icon={<Globe2 size={23}/>} title={t("features.dnsTitle")} description={t("features.dnsDescription")}/>
            </div>
        </section>
    );
}

function Feature({icon,title,description}: {icon: React.ReactNode;title: string;description: string}) {
    return <div className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-slate-900/70">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">{icon}</span>
        <div><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div>
    </div>;
}