"use client";

import {useEffect, useMemo, useState} from "react";
import {Search, ShoppingBag, RefreshCw, Heart, Database, CalendarDays, Star, CheckCircle2, X} from "lucide-react";
import {useTranslations} from "next-intl";
import {Link, usePathname} from "@/i18n/navigation";
import {addBasketItem, getBasket} from "@/lib/basket";
import {getMarketPlans, type MarketPlan} from "@/lib/api/plans";
import {apiClient} from "@/lib/api/client";

type Props = {locale: string};

function formatPrice(plan: MarketPlan, locale: string) {
    const currency = plan.currency.toUpperCase();
    const amount = plan.priceMinor / (currency === "IRR" ? 1 : 100);
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "IRR" ? 0 : 2,
    }).format(amount);
}

export default function MarketContent({locale}: Props) {
    const t = useTranslations("MarketPage");
    const inUserZone = usePathname().startsWith("/user/");
    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [basketCount, setBasketCount] = useState(0);
    const [basketIds, setBasketIds] = useState<string[]>([]);
    const [basketNotice, setBasketNotice] = useState<{name: string; alreadyAdded: boolean} | null>(null);
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const saved: unknown = JSON.parse(window.localStorage.getItem("wraplink:favorite-plans:v1") || "[]");
            return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : [];
        } catch { return []; }
    });
    const [freeBusy,setFreeBusy]=useState<string|null>(null);
    const [freeClaimed,setFreeClaimed]=useState<string[]>([]);
    const [claimsLoading,setClaimsLoading]=useState(true);
    const [claimsError,setClaimsError]=useState(false);
    const [freeError,setFreeError]=useState<string|null>(null);
    const [freeNotice,setFreeNotice]=useState<string|null>(null);
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const fa = locale === "fa";



    const toggleFavorite = (code: string) => {
        setFavorites(previous => {
            const next = previous.includes(code) ? previous.filter(item => item !== code) : [...previous, code];
            try { localStorage.setItem("wraplink:favorite-plans:v1", JSON.stringify(next)); } catch { /* storage may be unavailable */ }
            return next;
        });
    };

    const formatData = (bytes: number) => {
        if (bytes === 0) return fa ? "نامحدود" : "Unlimited";
        if (!Number.isFinite(bytes) || bytes < 0) return fa ? "نامشخص" : "Unknown";
        const localeTag = fa ? "fa-IR" : "en-US";
        const units = ["B", "KB", "MB", "GB", "TB"];
        let amount = bytes;
        let unit = 0;
        while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit++; }
        return `${new Intl.NumberFormat(localeTag, {maximumFractionDigits: amount < 10 ? 2 : 1}).format(amount)} ${units[unit]}`;
    };


    useEffect(() => {
        const basket = getBasket();
        setBasketCount(basket.reduce((sum, item) => sum + item.quantity, 0));
        setBasketIds(basket.map(item => item.id));
    }, []);

    useEffect(() => {
        let active = true;
        getMarketPlans()
            .then(items => {
                if (active) {
                    setPlans(items);
                    setError(null);
                }
            })
            .catch(err => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load plans");
                    setPlans([]);
                }
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [retry]);

    useEffect(() => {
        let active=true;
        setClaimsLoading(true);
        apiClient.get<{claims:{planId:string;planCode:string;source:string;state:string}[]}>("/api/v1/me/free-plans/claims")
            .then(({data})=>{if(active){setFreeClaimed((data.claims??[]).map(c=>c.planCode).filter(Boolean));setClaimsError(false)}})
            .catch(()=>{if(active)setClaimsError(true)})
            .finally(()=>{if(active)setClaimsLoading(false)});
        return ()=>{active=false};
    },[]);

    const filteredPlans = useMemo(() => {
        const q = search.trim().toLowerCase();
        return plans.filter(plan =>
            (!favoritesOnly || favorites.includes(plan.code)) && (!q || [plan.code, plan.name, plan.description].some(value =>
                value.toLowerCase().includes(q)
            ))
        );
    }, [plans, search, favorites, favoritesOnly]);

    const claimFree = async (plan:MarketPlan) => {
        if(freeBusy||freeClaimed.includes(plan.code))return;
        setFreeBusy(plan.code);setFreeError(null);setFreeNotice(null);
        try{
            await apiClient.post("/api/v1/me/free-plans/claim",{planCode:plan.code});
            setFreeClaimed(previous=>[...previous,plan.code]);
            setFreeNotice(fa?`پلن رایگان «${plan.name}» فعال شد.`:`Free plan "${plan.name}" activated.`);
        }catch(e){
            const status=(e as {response?:{status?:number}}).response?.status;
            setFreeError(status===409?(fa?"این پلن قبلاً استفاده شده یا اشتراک فعال دیگری دارید.":"Already claimed or another subscription is active."):status===401?(fa?"ابتدا وارد حساب شوید.":"Sign in to activate a free plan."):(fa?"فعال‌سازی پلن رایگان ناموفق بود.":"Unable to activate free plan."));
        }finally{setFreeBusy(null)}
    };

    const addToBasket = (plan: MarketPlan) => {
        // A plan is a subscription choice: repeated clicks must not add extra quantities.
        if (getBasket().some(item => item.id === plan.code)) {
            setBasketIds(getBasket().map(item => item.id));
            setBasketNotice({name: plan.name, alreadyAdded: true});
            return;
        }
        addBasketItem({
            id: plan.code,
            name: plan.name,
            category: t("categories.plans"),
            price: plan.priceMinor,
        });
        const basket = getBasket();
        setBasketCount(basket.reduce((sum, item) => sum + item.quantity, 0));
        setBasketIds(basket.map(item => item.id));
        setBasketNotice({name: plan.name, alreadyAdded: false});
    };

    return (
        <section className="min-h-screen px-6 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                            <ShoppingBag size={16}/>{t("badge")}
                        </div>
                        <h1 className="mt-6 text-4xl font-black lg:text-5xl">{t("title")}</h1>
                        <p className="mt-4 max-w-2xl text-gray-400">{t("subtitle")}</p>
                    </div>
                    <Link href={inUserZone ? "/user/basket" : "/basket"} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400">
                        <ShoppingBag size={19}/>{t("basket")}
                        {basketCount > 0 && <span className="rounded-full bg-cyan-400 px-2 text-xs text-black">{basketCount}</span>}
                    </Link>
                </div>
                {claimsError&&<p role="alert" className="mt-5 text-amber-300">{fa?"وضعیت استفاده قبلی از پلن‌های رایگان در دسترس نیست؛ لطفاً وارد حساب شوید یا صفحه را تازه کنید.":"Unable to check previous free-plan claims. Sign in or refresh to try again."}</p>}
                {freeError&&<p role="alert" className="mt-5 text-red-300">{freeError}</p>}
                {freeNotice&&<p role="status" className="mt-5 text-green-300">{freeNotice}</p>}
                {basketNotice && <div role="status" aria-live="polite" className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    <CheckCircle2 size={22} className="shrink-0 text-emerald-300"/>
                    <span className="min-w-0 flex-1 font-medium">{basketNotice.alreadyAdded
                        ? (fa ? `«${basketNotice.name}» از قبل در سبد خرید شماست.` : `${basketNotice.name} is already in your basket.`)
                        : (fa ? `«${basketNotice.name}» به سبد خرید اضافه شد.` : `${basketNotice.name} added to your basket.`)}</span>
                    <Link href={inUserZone ? "/user/basket" : "/basket"} className="rounded-lg bg-emerald-400 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-300">{fa ? "مشاهده سبد خرید" : "View basket"}</Link>
                    <button type="button" onClick={() => setBasketNotice(null)} aria-label={fa ? "بستن پیام" : "Dismiss notification"} className="rounded-lg p-2 hover:bg-white/10"><X size={18}/></button>
                </div>}
                <div className="mt-10 flex max-w-md items-center rounded-xl border border-white/10 bg-white/5 px-4">
                    <Search size={19} className="text-gray-500"/>
                    <input value={search} onChange={event => setSearch(event.target.value)}
                        type="search" placeholder={t("search")}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none"/>
                </div>
                <button type="button" onClick={() => setFavoritesOnly(value => !value)} aria-pressed={favoritesOnly}
                    className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${favoritesOnly ? "border-rose-400/60 bg-rose-400/15 text-rose-200" : "border-white/15 bg-white/5 text-gray-300 hover:border-rose-400/50"}`}>
                    <Heart size={17} fill={favoritesOnly ? "currentColor" : "none"}/>
                    {fa ? "علاقه‌مندی‌ها" : "Favorites"} ({favorites.length})
                </button>
                {loading ? (
                    <p role="status" className="mt-10 text-gray-400">{fa ? "در حال بارگذاری پلن‌ها…" : "Loading plans…"}</p>
                ) : error ? (
                    <div role="alert" className="mt-10 rounded-xl border border-red-500/30 p-6">
                        <p>{fa ? "بارگذاری پلن‌ها ناموفق بود:" : "Could not load plans:"} {error}</p>
                        <button type="button" className="mt-4 flex items-center gap-2 text-cyan-400"
                            onClick={() => {setLoading(true); setRetry(value => value + 1);}}>
                            <RefreshCw size={16}/>{fa ? "تلاش دوباره" : "Retry"}
                        </button>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 py-20 text-center">
                        <ShoppingBag size={40} className="mx-auto text-gray-600"/>
                        <h2 className="mt-5 text-xl font-bold">{t("noProducts")}</h2>
                        <p className="mt-2 text-gray-500">{t("tryDifferentSearch")}</p>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredPlans.map(plan => (
                            <article key={plan.id} dir={fa ? "rtl" : "ltr"}
                                className={`group relative flex h-full flex-col rounded-3xl border ${plan.isPopular ? "border-amber-400/70 ring-1 ring-amber-400/30" : "border-white/15"} bg-gradient-to-b from-slate-800/95 to-slate-950/95 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/50 focus-within:border-cyan-400/60`}>
                                {plan.isPopular && <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950"><Star size={14} fill="currentColor"/>{fa ? "محبوب‌ترین" : "Most popular"}</div>}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{fa ? "پلن اینترنت" : "Internet plan"}</span>
                                        <h2 className="mt-4 break-words text-2xl font-bold text-white">{plan.name}</h2>
                                    </div>
                                    <button type="button" onClick={() => toggleFavorite(plan.code)}
                                        aria-label={favorites.includes(plan.code) ? (fa ? "حذف از علاقه‌مندی‌ها" : "Remove from favorites") : (fa ? "افزودن به علاقه‌مندی‌ها" : "Add to favorites")}
                                        aria-pressed={favorites.includes(plan.code)}
                                        className={`shrink-0 rounded-xl border p-3 transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${favorites.includes(plan.code) ? "border-rose-400/50 bg-rose-400/15 text-rose-300" : "border-white/15 bg-white/5 text-slate-300 hover:text-rose-300"}`}>
                                        <Heart size={20} fill={favorites.includes(plan.code) ? "currentColor" : "none"}/>
                                    </button>
                                </div>
                                <p className="mt-4 min-h-12 text-sm leading-7 text-slate-300">{plan.description || (fa ? "مشخصات پلن را در ادامه ببینید." : "See the plan specifications below.")}</p>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <Database size={18} className="mb-2 text-cyan-300"/>
                                        <p className="text-xs text-slate-400">{fa ? "حجم ترافیک" : "Data allowance"}</p>
                                        <p className="mt-1 text-base font-bold text-white" dir="auto">{formatData(plan.dataLimitBytes)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <CalendarDays size={18} className="mb-2 text-cyan-300"/>
                                        <p className="text-xs text-slate-400">{fa ? "مدت اعتبار" : "Validity"}</p>
                                        <p className="mt-1 text-base font-bold text-white">{new Intl.NumberFormat(fa ? "fa-IR" : "en-US").format(plan.durationDays)} {fa ? "روز" : "days"}</p>
                                    </div>
                                </div>
                                <div className="mt-auto pt-6">
                                    <div className="border-t border-white/10 pt-5">
                                        <p className="text-xs text-slate-400">{fa ? "قیمت پلن" : "Plan price"}</p>
                                        <p className="mt-2 break-words text-2xl font-black text-cyan-300">{plan.priceMinor===0?(fa?"رایگان":"Free"):formatPrice(plan, locale)}</p>
                                    </div>
                                    {plan.priceMinor===0 ? (
                                        <button type="button" disabled={freeBusy!==null||claimsLoading||claimsError||freeClaimed.includes(plan.code)} onClick={()=>void claimFree(plan)} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-50">{freeBusy===plan.code||claimsLoading?"…":freeClaimed.includes(plan.code)?(fa?"قبلاً استفاده شده":"Already claimed"):(fa?"فعال‌سازی رایگان":"Activate Free")}</button>
                                    ) : basketIds.includes(plan.code) ? (
                                        <Link href={inUserZone ? "/user/basket" : "/basket"}
                                            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-400/15 px-4 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
                                            <CheckCircle2 size={19}/>{fa ? "در سبد خرید · مشاهده سبد" : "In basket · View basket"}
                                        </Link>
                                    ) : (
                                        <button type="button" onClick={() => addToBasket(plan)}
                                            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                                            <ShoppingBag size={19}/>{t("addToBasket")}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
