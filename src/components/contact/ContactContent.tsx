import {
    Mail,
    MessageCircle,
    Send,
    Clock,
    Shield
} from "lucide-react";

import {getTranslations} from "next-intl/server";

type Props = {
    locale: string;
};

export default async function ContactContent({
                                                 locale
                                             }: Props) {

    const t = await getTranslations({
        locale,
        namespace: "ContactPage"
    });

    return (
        <section className="mx-auto max-w-7xl px-6 py-20">

            <div className="mx-auto max-w-3xl text-center">

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

            <div className="mt-20 grid gap-10 lg:grid-cols-2">

                {/* Contact Form */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <h2 className="text-2xl font-bold text-cyan-400">
                        {t("form.title")}
                    </h2>

                    <form className="mt-8 space-y-5">

                        <input
                            placeholder={t("form.name")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <input
                            type="email"
                            placeholder={t("form.email")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <input
                            placeholder={t("form.subject")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <textarea
                            rows={6}
                            placeholder={t("form.message")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <button
                            type="button"
                            className="inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-105"
                        >
                            <Send size={20}/>
                            {t("form.send")}
                        </button>

                    </form>

                </div>

                {/* Contact Info */}

                <div className="space-y-6">

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                        <h2 className="text-2xl font-bold text-cyan-400">
                            {t("info.title")}
                        </h2>

                        <div className="mt-8 space-y-6">

                            <InfoItem
                                icon={<Mail size={22}/>}
                                title="Email"
                                value={t("info.email")}
                            />

                            <InfoItem
                                icon={<MessageCircle size={22}/>}
                                title="Telegram"
                                value={t("info.telegram")}
                            />

                            <InfoItem
                                icon={<Shield size={22}/>}
                                title="Discord"
                                value={t("info.discord")}
                            />

                            <InfoItem
                                icon={<Clock size={22}/>}
                                title="Support"
                                value={t("info.hours")}
                            />

                        </div>

                    </div>

                    <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                        <h3 className="text-2xl font-black text-cyan-400">
                            {t("supportTitle")}
                        </h3>

                        <p className="mt-4 leading-8 text-gray-300">
                            {t("supportDescription")}
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}

function InfoItem({
                      icon,
                      title,
                      value
                  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-4">

            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-400">
                {icon}
            </div>

            <div>
                <h4 className="font-semibold">
                    {title}
                </h4>

                <p className="text-gray-400">
                    {value}
                </p>
            </div>

        </div>
    );
}