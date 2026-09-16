import {getTranslations} from "next-intl/server";

interface StatsProps {
    locale: string;
}

const stats = [
    {value: "12+", key: "edgeNodes"},
    {value: "50K+", key: "connections"},
    {value: "120+", key: "games"},
    {value: "99.99%", key: "uptime"},
] as const;

export default async function Stats({locale}: StatsProps) {
    const t = await getTranslations({
        locale,
        namespace: "HomePage.stats",
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.key}
                        className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
                    >
                        <div className="text-4xl font-black text-cyan-400">
                            {item.value}
                        </div>

                        <p className="mt-3 text-gray-400">
                            {t(item.key)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}