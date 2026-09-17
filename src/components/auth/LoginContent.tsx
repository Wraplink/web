"use client";

import {useState} from "react";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Shield
} from "lucide-react";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

export default function LoginContent({locale}: Props) {
    const t = useTranslations("LoginPage");

    const [showPassword, setShowPassword] = useState(false);

    return (
        <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center px-6 py-20">

            <div className="grid w-full gap-10 lg:grid-cols-2">

                {/* Left */}

                <div className="flex flex-col justify-center">

          <span className="inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            {t("badge")}
          </span>

                    <h1 className="mt-8 text-5xl font-black lg:text-6xl">
                        {t("title")}
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        {t("description")}
                    </p>

                    <div className="mt-12 rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <Shield size={28} className="text-cyan-400"/>
                        </div>

                        <h3 className="mt-6 text-2xl font-bold">
                            {t("securityTitle")}
                        </h3>

                        <p className="mt-3 text-gray-400">
                            {t("securityText")}
                        </p>

                    </div>

                </div>

                {/* Right */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <form className="space-y-6">

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                {t("email")}
                            </label>

                            <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4">
                                <Mail size={20} className="text-gray-400"/>

                                <input
                                    type="email"
                                    className="w-full bg-transparent px-3 py-3 outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                {t("password")}
                            </label>

                            <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4">
                                <Lock size={20} className="text-gray-400"/>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-transparent px-3 py-3 outline-none"
                                    placeholder="••••••••"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-cyan-400"
                                >
                                    {showPassword
                                        ? <EyeOff size={20}/>
                                        : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">

                            <label className="flex items-center gap-2 text-sm text-gray-300">
                                <input type="checkbox"/>
                                {t("remember")}
                            </label>

                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-cyan-400 hover:underline"
                            >
                                {t("forgot")}
                            </Link>

                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02]"
                        >
                            {t("login")}
                        </button>

                    </form>

                    <div className="mt-8 text-center text-gray-400">

                        {t("noAccount")}{" "}

                        <Link
                            href="/auth/register"
                            className="font-semibold text-cyan-400 hover:underline"
                        >
                            {t("register")}
                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
}