"use client";

import {useState,type FormEvent} from "react";
import {apiClient} from "@/lib/api/client";
import {
    Mail,
    MessageCircle,
    Send,
    Clock,
    Shield
} from "lucide-react";

import {useTranslations} from "next-intl";

type Props = {
    locale: string;
};

export default function ContactContent({
                                                 locale
                                             }: Props) {

    const t = useTranslations("ContactPage");
    const fa=locale==="fa";
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [subject,setSubject]=useState("");
    const [message,setMessage]=useState("");
    const [website,setWebsite]=useState("");
    const [busy,setBusy]=useState(false);
    const [status,setStatus]=useState<"success"|"error"|null>(null);
    const submit=async(event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(busy)return;
        setBusy(true);setStatus(null);
        try{
            await apiClient.post("/api/v1/contact",{name,email,subject,message,website});
            setStatus("success");setName("");setEmail("");setSubject("");setMessage("");
        }catch{setStatus("error")}
        finally{setBusy(false)}
    };

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

                    <form onSubmit={submit} className="mt-8 space-y-5">

                        <input
                            required minLength={2} maxLength={120} autoComplete="name" aria-label={t("form.name")} value={name} onChange={e=>setName(e.target.value)} placeholder={t("form.name")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <input
                            type="email"
                            required maxLength={254} autoComplete="email" aria-label={t("form.email")} value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("form.email")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <input
                            required minLength={3} maxLength={200} aria-label={t("form.subject")} value={subject} onChange={e=>setSubject(e.target.value)} placeholder={t("form.subject")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <textarea
                            rows={6} required minLength={10} maxLength={10000} aria-label={t("form.message")} value={message} onChange={e=>setMessage(e.target.value)}
                            placeholder={t("form.message")}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-400"
                        />

                        <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label>
                        {status==="success"&&<p role="status" className="rounded-xl bg-green-500/10 p-3 text-green-300">{fa?"پیام شما با موفقیت ثبت شد.":"Your message has been received."}</p>}
                        {status==="error"&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-red-300">{fa?"ارسال پیام ناموفق بود. دوباره تلاش کنید.":"Unable to send your message. Please try again."}</p>}
                        <button
                            type="submit" disabled={busy}
                            className="inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-105 disabled:opacity-50"
                        >
                            <Send size={20}/>
                            {busy?(fa?"در حال ارسال…":"Sending…"):t("form.send")}
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