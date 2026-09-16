import {
    UserPlus,
    CreditCard,
    Globe,
    Activity,
} from "lucide-react";
import {getTranslations} from "next-intl/server";

type HowItWorksProps = {
    locale: string;
};

const steps = [
    {
        key: "register",
        icon: UserPlus,
    },
    {
        key: "plan",
        icon: CreditCard,
    },
    {
        key: "connection",
        icon: Globe,
    },
    {
        key: "monitor",
        icon: Activity,
    },
] as const;

export default async function HowItWorks({
                                             locale,
                                         }: HowItWorksProps) {
    const t = await getTranslations({
        locale,
        namespace: "HomePage",
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-black lg:text-5xl">
                    {t("howItWorksTitle")}
                </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.key}
                            className="relative rounded-3xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-xl"
                        >
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                <Icon
                                    size={30}
                                    className="text-cyan-400"
                                />
                            </div>

                            <div className="mt-6 text-sm font-bold tracking-widest text-cyan-400">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <p className="mt-3 text-lg font-semibold leading-7">
                                {t(`steps.${step.key}`)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}