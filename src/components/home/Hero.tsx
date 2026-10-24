import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";

type HeroProps = {locale: string};

export default async function Hero({locale}: HeroProps) {
  const t = await getTranslations({locale, namespace: "HomePage"});
  return (
    <section className="relative overflow-hidden bg-[#030816]" aria-label={t("heroTitle")}>
      <div className="relative mx-auto max-w-[1920px]">
        <Image
          src="/wraplink-home-hero-approved.webp"
          alt="Roaring blue lion above a connected world and gaming workstation"
          width={1672}
          height={941}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        {/* The approved image has no baked-in buttons. */}
        <div className="absolute left-[8.8%] top-[38.1%] hidden items-center gap-[1.1vw] sm:flex">
          <Link href="/auth/register" className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-[2.2vw] py-[.75vw] text-[clamp(11px,1vw,18px)] font-bold text-white shadow-[0_0_22px_rgba(0,165,255,.4)] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-cyan-300">{t("getStarted")} <span aria-hidden="true">→</span></Link>
          <Link href="/pricing" className="rounded-full border border-cyan-400 bg-[#020b1c]/90 px-[2.2vw] py-[.75vw] text-[clamp(11px,1vw,18px)] font-semibold text-white hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-cyan-300">{t("viewPlans")}</Link>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 px-6 py-5 sm:hidden">
        <Link href="/auth/register" className="rounded-xl bg-cyan-400 px-7 py-3 font-bold text-slate-950">{t("getStarted")}</Link>
        <Link href="/pricing" className="rounded-xl border border-cyan-300/50 bg-white/5 px-7 py-3 font-semibold text-white">{t("viewPlans")}</Link>
      </div>
    </section>
  );
}
