import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

export default function Footer() {
    const t = useTranslations("Footer");
    const nav = useTranslations("Navigation");

    return (
        <footer className="mt-24 border-t border-white/10 bg-black/20 backdrop-blur-lg">

            <div className="mx-auto max-w-7xl px-6 py-10">

                <div className="flex flex-col justify-between gap-10 md:flex-row">

                    <div>
                        <h3 className="text-2xl font-bold text-white">
                            WrapLink
                        </h3>

                        <p className="mt-3 max-w-sm text-gray-400">
                            {t("description")}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 text-gray-300">

                        <div>
                            <h4 className="mb-3 font-semibold text-white">
                                {t("platform")}
                            </h4>

                            <div className="flex flex-col gap-2">

                                <Link href="/">
                                    {nav("home")}
                                </Link>

                                <Link href="/market">
                                    {nav("market")}
                                </Link>

                                <Link href="/pricing">
                                    {nav("pricing")}
                                </Link>

                            </div>
                        </div>

                        <div>
                            <h4 className="mb-3 font-semibold text-white">
                                {t("support")}
                            </h4>

                            <div className="flex flex-col gap-2">

                                <Link href="/legal">
                                    {t("legal")}
                                </Link>

                                <Link href="/privacy">
                                    {t("privacy")}
                                </Link>

                                <Link href="/contact">
                                    {nav("contact")}
                                </Link>

                                <Link href="/about">
                                    {nav("about")}
                                </Link>

                            </div>
                        </div>

                    </div>

                </div>

                <div className="mt-10 border-t border-white/10 pt-6 text-center text-gray-500">
                    {t("copyright")}
                </div>

            </div>

        </footer>
    );
}