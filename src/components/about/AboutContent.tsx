import {
    Shield,
    Zap,
    Globe,
    Sparkles
} from "lucide-react";
import {getTranslations} from "next-intl/server";

type Props = {
    locale: string;
};

const values = [
    {key: "performance", icon: Zap},
    {key: "security", icon: Shield},
    {key: "transparency", icon: Globe},
    {key: "innovation", icon: Sparkles},
] as const;

export default async function AboutContent({locale}: Props) {
    const t = await getTranslations({
        locale,
        namespace: "AboutPage"
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-20">

            <div className="mx-auto max-w-4xl text-center">

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

            <div className="mt-20 grid gap-8 lg:grid-cols-2">

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-cyan-400">
                        {t("missionTitle")}
                    </h2>

                    <p className="mt-4 leading-8 text-gray-300">
                        {t("missionText")}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-cyan-400">
                        {t("visionTitle")}
                    </h2>

                    <p className="mt-4 leading-8 text-gray-300">
                        {t("visionText")}
                    </p>
                </div>

            </div>

            <div className="mt-20">

                <h2 className="text-center text-4xl font-black">
                    {t("valuesTitle")}
                </h2>

                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                    {values.map((value) => {
                        const Icon = value.icon;

                        return (
                            <div
                                key={value.key}
                                className="rounded-3xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30"
                            >
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                    <Icon size={28} className="text-cyan-400"/>
                                </div>

                                <h3 className="mt-6 text-xl font-bold">
                                    {t(`values.${value.key}.title`)}
                                </h3>

                                <p className="mt-3 text-gray-400">
                                    {t(`values.${value.key}.description`)}
                                </p>
                            </div>
                        );
                    })}

                </div>

            </div>

            <div className="mt-24 rounded-3xl border border-cyan-400/20 bg-white/5 p-10 backdrop-blur-xl">

                <h2 className="text-3xl font-black text-cyan-400">
                    {t("architectureTitle")}
                </h2>

                <p className="mt-5 text-lg leading-8 text-gray-300">
                    {t("architectureDescription")}
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                    {[
                        "Smart DNS",
                        "Edge Nodes",
                        "Secure APIs",
                        "Central Control"
                    ].map((item) => (
                        <div
                            key={item}
                            className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center font-semibold"
                        >
                            {item}
                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}