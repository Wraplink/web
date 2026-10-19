"use client";

import {useEffect, useMemo, useState} from "react";
import {Search, ShoppingBag, RefreshCw} from "lucide-react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {addBasketItem, getBasket} from "@/lib/basket";
import {getMarketPlans, type MarketPlan} from "@/lib/api/plans";

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
    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [basketCount, setBasketCount] = useState(0);

    useEffect(() => {
        setBasketCount(getBasket().reduce((sum, item) => sum + item.quantity, 0));
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

    const filteredPlans = useMemo(() => {
        const q = search.trim().toLowerCase();
        return plans.filter(plan =>
            !q || [plan.code, plan.name, plan.description].some(value =>
                value.toLowerCase().includes(q)
            )
        );
    }, [plans, search]);

    const addToBasket = (plan: MarketPlan) => {
        addBasketItem({
            id: plan.code,
            name: plan.name,
            category: t("categories.plans"),
            price: plan.priceMinor,
        });
        setBasketCount(getBasket().reduce((sum, item) => sum + item.quantity, 0));
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
                    <Link href="/basket" className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400">
                        <ShoppingBag size={19}/>{t("basket")}
                        {basketCount > 0 && <span className="rounded-full bg-cyan-400 px-2 text-xs text-black">{basketCount}</span>}
                    </Link>
                </div>
                <div className="mt-10 flex max-w-md items-center rounded-xl border border-white/10 bg-white/5 px-4">
                    <Search size={19} className="text-gray-500"/>
                    <input value={search} onChange={event => setSearch(event.target.value)}
                        type="search" placeholder={t("search")}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none"/>
                </div>
                {loading ? (
                    <p role="status" className="mt-10 text-gray-400">Loading plans…</p>
                ) : error ? (
                    <div role="alert" className="mt-10 rounded-xl border border-red-500/30 p-6">
                        <p>Could not load plans: {error}</p>
                        <button type="button" className="mt-4 flex items-center gap-2 text-cyan-400"
                            onClick={() => {setLoading(true); setRetry(value => value + 1);}}>
                            <RefreshCw size={16}/> Retry
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
                            <article key={plan.id} className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
                                <h2 className="text-2xl font-bold">{plan.name}</h2>
                                <p className="mt-3 min-h-14 text-sm leading-6 text-gray-400">{plan.description}</p>
                                <div className="mt-6 text-3xl font-black text-cyan-400">{formatPrice(plan, locale)}</div>
                                <p className="mt-2 text-sm text-gray-400">{plan.durationDays} days</p>
                                <p className="mt-2 text-xs uppercase text-gray-500">{t("categories.plans")}</p>
                                <button type="button" onClick={() => addToBasket(plan)}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-black">
                                    <ShoppingBag size={18}/>{t("addToBasket")}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
