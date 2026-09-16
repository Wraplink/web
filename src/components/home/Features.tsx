import {
    WalletCards,
    Headphones,
    Store,
    Network,
    BarChart3,
    Languages,
} from "lucide-react";
import {getTranslations} from "next-intl/server";

type FeaturesProps = {
    locale: string;
};

const features = [
    {
        key: "wallet",
        icon: WalletCards,
    },
    {
        key: "support",
        icon: Headphones,
    },
    {
        key: "market",
        icon: Store,
    },
    {
        key: "connection",
        icon: Network,
    },
    {
        key: "bandwidth",
        icon: BarChart3,
    },
    {
        key: "language",
        icon: Languages,
    },
] as const;

export default async function Features({
                                           locale,
                                       }: FeaturesProps) {
    const t = await getTranslations({
        locale,
        namespace: "HomePage",
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-black lg:text-5xl">
                    {t("featuresTitle")}
                </h2>

                <p className="mt-6 text-lg leading-8 text-gray-400">
                    {t("featuresDescription")}
                </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={feature.key}
                            className="group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                <Icon
                                    size={28}
                                    className="text-cyan-400"
                                />
                            </div>

                            <h3 className="mt-6 text-xl font-bold">
                                {t(`platform.${feature.key}Title`)}
                            </h3>

                            <p className="mt-3 leading-7 text-gray-400">
                                {t(
                                    `platform.${feature.key}Description`,
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}