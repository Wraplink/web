"use client";
import ThemePicker from "./ThemePicker";

import {useEffect,useState} from "react";
import {getProfile,updateProfile,changeProfilePassword,getProfileSessions,revokeProfileSession,revokeOtherProfileSessions,type Profile,type ManagedSession} from "@/lib/api/profile";
import {
    User,
    Mail,
    Lock,
    ShieldCheck,
    Monitor,
    Smartphone,
    LogOut,
    Save,
    KeyRound,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

import {useTranslations} from "next-intl";




type Props = {
    locale: string;
};

const passwordRules=(value:string)=>[
 {key:"length",ok:new TextEncoder().encode(value).length>=12&&new TextEncoder().encode(value).length<=128},
 {key:"upper",ok:/\p{Lu}/u.test(value)},
 {key:"lower",ok:/\p{Ll}/u.test(value)},
 {key:"number",ok:/\p{Nd}/u.test(value)},
 {key:"symbol",ok:/[\p{P}\p{S}]/u.test(value)}
];
export default function ProfileContent({
                                           locale,
                                       }: Props) {

    const t = useTranslations("ProfilePage");


    const [name, setName] = useState("");
    const [profile,setProfile]=useState<Profile|null>(null);
    const [sessions,setSessions]=useState<ManagedSession[]>([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    useEffect(()=>{let active=true;void Promise.all([getProfile(),getProfileSessions()]).then(([p,s])=>{if(active){setProfile(p);setName(p.full_name);setSessions(s)}}).catch(()=>{if(active)setError("Unable to load profile or sessions")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);

    const email=profile?.email??"";

    const [saving, setSaving] =
        useState(false);

    const [saved, setSaved] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");



    const rules=passwordRules(newPassword);
    const passwordValid=rules.every(rule=>rule.ok);
    const passwordScore=rules.filter(rule=>rule.ok).length;
    const passwordLabel=locale==="fa"?["بسیار ضعیف","ضعیف","ضعیف","متوسط","خوب","قوی"]:["Very weak","Weak","Weak","Fair","Good","Strong"];
    const ruleLabels:Record<string,string>=locale==="fa"?{length:"۱۲ تا ۱۲۸ بایت",upper:"حرف بزرگ",lower:"حرف کوچک",number:"عدد",symbol:"نماد ویژه"}:{length:"12–128 bytes",upper:"Uppercase letter",lower:"Lowercase letter",number:"Number",symbol:"Special character"};
    const [message, setMessage] =
        useState("");

    const saveProfile=async()=>{setSaving(true);setSaved(false);setError("");try{const p=await updateProfile(name.trim());setProfile(p);setName(p.full_name);setSaved(true)}catch{setError("Could not update profile")}finally{setSaving(false)}};
    const changePassword=async()=>{setMessage("");if(!currentPassword||!newPassword||!confirmPassword){setMessage(t("security.passwordRequired"));return}if(!passwordValid){setMessage(locale==="fa"?"رمز عبور جدید شرایط امنیتی را ندارد":"New password does not meet the required complexity rules");return}if(newPassword!==confirmPassword){setMessage(t("security.passwordMismatch"));return}setChangingPassword(true);try{await changeProfilePassword(currentPassword,newPassword);setCurrentPassword("");setNewPassword("");setConfirmPassword("");setMessage(t("security.passwordChanged"))}catch{setMessage("Password change failed. Verify your current password and password requirements.")}finally{setChangingPassword(false)}};
    const logoutSession=async(sessionId:string)=>{setError("");try{await revokeProfileSession(sessionId);setSessions(current=>current.filter(s=>s.id!==sessionId))}catch{setError("Could not revoke session")}};
    const logoutAllSessions=async()=>{setError("");try{await revokeOtherProfileSessions();setSessions(await getProfileSessions())}catch{setError("Could not revoke other sessions")}};
    return (
        <section className="mx-auto max-w-7xl px-6 py-10">

            {loading&&<p role="status">Loading profile…</p>}
            {error&&<p role="alert" className="mb-5 text-red-300">{error}</p>}
            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                        <User size={24}/>
                    </div>

                    <div>

                        <h1 className="text-3xl font-black">
                            {t("title")}
                        </h1>

                        <p className="mt-1 text-gray-400">
                            {t("subtitle")}
                        </p>

                    </div>

                </div>

            </div>

            {/* Profile */}

            <div className="grid gap-8 lg:grid-cols-3">

                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <div className="mb-8">

                        <div className="flex items-center gap-3">

                            <User className="text-cyan-400"/>

                            <div>
                                <h2 className="text-xl font-bold">
                                    {t("profile.title")}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t("profile.description")}
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="grid gap-6 md:grid-cols-2">

                        <Field
                            label={t("profile.name")}
                            icon={<User size={18}/>}
                        >
                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                className="input"
                            />
                        </Field>

                        <Field
                            label={t("profile.email")}
                            icon={<Mail size={18}/>}
                        >
                            <input
                                value={email}
                                disabled
                                className="input cursor-not-allowed opacity-50"
                            />
                        </Field>

                    </div>

                    <div className="mt-8 flex items-center gap-4">

                        <button
                            type="button"
                            onClick={saveProfile}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
                        >
                            <Save size={18}/>

                            {saving
                                ? t("profile.saving")
                                : t("profile.save")
                            }
                        </button>

                        {saved && (
                            <span className="flex items-center gap-2 text-sm text-green-400">
                                <CheckCircle2 size={17}/>
                                {t("profile.saved")}
                            </span>
                        )}

                    </div>

                </div>

                {/* Account status */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <h2 className="text-xl font-bold">
                        {t("account.title")}
                    </h2>

                    <div className="mt-6 space-y-5">

                        <StatusRow
                            label={t("account.emailVerified")}
                            value={profile?.email_verified?t("account.verified"):"Not verified"}
                            success={!!profile?.email_verified}
                        />

                        <StatusRow
                            label={t("account.accountStatus")}
                            value={profile?.account_status??"Unknown"}
                            success={profile?.account_status==="active"}
                        />

                        <StatusRow
                            label={t("account.plan")}
                            value="See Orders"
                            success={false}
                        />

                    </div>

                </div>

            </div>

            <ThemePicker locale={locale}/>

            {/* Password */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center gap-3">

                    <Lock className="text-cyan-400"/>

                    <div>

                        <h2 className="text-xl font-bold">
                            {t("security.passwordTitle")}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {t("security.passwordDescription")}
                        </p>

                    </div>

                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-3">

                    <PasswordField
                        label={t("security.currentPassword")}
                        value={currentPassword}
                        onChange={setCurrentPassword}
                    />

                    <PasswordField
                        label={t("security.newPassword")}
                        value={newPassword}
                        onChange={setNewPassword}
                    />

                    <PasswordField
                        label={t("security.confirmPassword")}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                    />

                </div>

                <div className="mt-5 max-w-xl space-y-3" aria-live="polite">
                    <div className="flex items-center justify-between text-sm"><span>{locale==="fa"?"قدرت رمز عبور":"Password strength"}</span><span className={passwordValid?"text-green-400":"text-amber-300"}>{newPassword?passwordLabel[passwordScore]:"—"}</span></div>
                    <div role="progressbar" aria-label="Password complexity" aria-valuemin={0} aria-valuemax={5} aria-valuenow={passwordScore} className="grid grid-cols-5 gap-1.5">{[1,2,3,4,5].map(step=><div key={step} className={`h-2 rounded-full ${passwordScore>=step?(passwordValid?"bg-green-400":"bg-amber-400"):"bg-white/10"}`}/>)}</div>
                    <div className="grid gap-2 sm:grid-cols-2">{rules.map(rule=><div key={rule.key} className={`flex items-center gap-2 text-xs ${rule.ok?"text-green-400":"text-gray-400"}`}>{rule.ok?<CheckCircle2 size={14}/>:<span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-full border border-current"/>}{ruleLabels[rule.key]}</div>)}</div>
                    {confirmPassword&&<p className={confirmPassword===newPassword?"text-sm text-green-400":"text-sm text-red-300"}>{confirmPassword===newPassword?(locale==="fa"?"تکرار رمز عبور مطابقت دارد":"Passwords match"):(locale==="fa"?"رمزها مطابقت ندارند":"Passwords do not match")}</p>}
                </div>
                {message && (
                    <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-300">
                        {message}
                    </div>
                )}

                <button
                    type="button"
                    onClick={changePassword}
                    disabled={changingPassword||!passwordValid||!currentPassword||newPassword!==confirmPassword}
                    className="mt-6 flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/20 disabled:opacity-50"
                >
                    <KeyRound size={18}/>

                    {changingPassword
                        ? t("security.changing")
                        : t("security.changePassword")
                    }
                </button>

            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8"><div className="flex items-center gap-3"><ShieldCheck className="text-cyan-400"/><h2 className="text-xl font-bold">{t("security.twoFactorTitle")}</h2></div><p className="mt-3 text-sm text-yellow-300">Two-factor authentication is not available yet. It cannot be enabled until secure enrollment and verification APIs are implemented.</p></div>

            {/* Sessions */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <Monitor className="text-cyan-400"/>

                        <div>

                            <h2 className="text-xl font-bold">
                                {t("sessions.title")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("sessions.description")}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={logoutAllSessions}
                        className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-400/10"
                    >
                        <LogOut size={17}/>
                        {t("sessions.logoutAll")}
                    </button>

                </div>

                <div className="mt-6 space-y-3">

                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400">
                                    {session.userAgent.includes("Windows")
                                        ? <Monitor size={19}/>
                                        : <Smartphone size={19}/>
                                    }
                                </div>

                                <div>

                                    <div className="font-semibold">
                                        {session.userAgent||"Unknown device"}
                                    </div>

                                    <div className="mt-1 text-xs text-gray-500">
                                        {session.ipAddress||"Unknown IP"} · Expires {new Date(session.expiresAt).toLocaleString()}
                                    </div>

                                </div>

                            </div>

                            <button type="button" onClick={()=>void logoutSession(session.id)} className="text-sm text-red-400 hover:text-red-300">{t("sessions.revoke")}</button>
                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}

function Field({
                   label,
                   icon,
                   children,
               }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <label className="block">

            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                {icon}
                {label}
            </div>

            {children}

        </label>
    );
}

function PasswordField({
                           label,
                           value,
                           onChange,
                       }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">

            <div className="mb-2 text-sm text-gray-400">
                {label}
            </div>

            <input
                type="password"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="input"
            />

        </label>
    );
}

function StatusRow({
                       label,
                       value,
                       success = false,
                   }: {
    label: string;
    value: string;
    success?: boolean;
}) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-3">

            <span className="text-sm text-gray-400">
                {label}
            </span>

            <span
                className={
                    success
                        ? "text-sm font-semibold text-green-400"
                        : "text-sm font-semibold"
                }
            >
                {value}
            </span>

        </div>
    );
}