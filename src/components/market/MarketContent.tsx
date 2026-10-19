"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {Search, ShoppingBag, Server, RefreshCw} from "lucide-react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {addBasketItem, getBasket} from "@/lib/basket";
import {formatPlanPrice, listMarketPlans, type MarketPlan} from "@/lib/api/market";

type Props = {locale: string};

export default function MarketContent({locale}: Props) {
    const t = useTranslations("MarketPage");
    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [search, setSearch] = useState("");
    const [basketCount, setBasketCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setPlans(await listMarketPlans());
        } catch (err) {
            setPlans([]);
            setError(err instanceof Error ? err.message : "Unable to load plans");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
        const sync = () => {
            setBasketCount(getBasket().reduce((sum, item) => sum + item.quantity, 0));
        };
        sync();
        window.addEventListener("storage", sync);
        window.addEventListener("focus", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("focus", sync);
        };
    }, [load]);

    const filteredPlans = useMemo(() => {
        const query = search.trim().toLowerCase();
        return plans.filter(plan => !query ||
            plan.name.toLowerCase().includes(query) ||
            plan.code.toLowerCase().includes(query) ||
            plan.description.toLowerCase().includes(query));
    }, [plans, search]);

    const addToBasket = (plan: MarketPlan) => {
        // The backend has no cart endpoints yet. The existing basket is local;
        // checkout must revalidate the plan and price with the backend.
        addBasketItem({
            id: plan.code,
            name: plan.name,
            category: t("categories.plans"),
            price: plan.priceMinor,
            currency: plan.currency,
            durationDays: plan.durationDays,
        });
        setBasketCount(getBasket().reduce((sum, item) => sum + item.quantity, 0));
    };

    return (
        <section className="min-h-screen px-6 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                            <ShoppingBag size={16}/>{t("badge")}
                        </div>
                        <h1 className="mt-6 text-4xl font-black lg:text-5xl">{t("title")}</h1>
                        <p className="mt-4 max-w-2xl text-gray-400">{t("subtitle")}</p>
                    </div>
                    <Link href="/basket" className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/20">
                        <ShoppingBag size={19}/>{t("basket")}
                        {basketCount > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-400 px-2 text-xs font-black text-black">{basketCount}</span>}
                    </Link>
                </div>
                <div className="mt-10 flex w-full items-center rounded-xl border border-white/10 bg-white/5 px-4 lg:max-w-md">
                    <Search size={19} className="shrink-0 text-gray-500"/>
                    <input value={search} onChange={event => setSearch(event.target.value)}
                        type="search" placeholder={t("search")}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600"/>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-xl border border-cyan-400 bg-cyan-400 px-4 py-2 text-sm font-medium text-black">{t("categories.plans")}</span>
                </div>
                {loading ? (
                    <p role="status" className="mt-10 text-gray-400">Loading available plans...</p>
                ) : error ? (
                    <div role="alert" className="mt-10 rounded-2xl border border-red-400/30 p-6">
                        <p className="text-red-300">{error}</p>
                        <button type="button" onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2">
                            <RefreshCw size={16}/>Retry
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
                            <div key={plan.id} className="relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                                    <Server size={28}/>
                                </div>
                                <h2 className="mt-6 text-2xl font-bold">{plan.name}</h2>
                                <p className="mt-3 min-h-14 text-sm leading-6 text-gray-400">{plan.description}</p>
                                <div className="mt-6 text-3xl font-black text-cyan-400">{formatPlanPrice(plan, locale)}</div>
                                <p className="mt-2 text-sm text-gray-500">
                                    {new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(plan.durationDays)} days
                                </p>
                                <p className="mt-3 text-xs uppercase tracking-wider text-gray-500">{t("categories.plans")}</p>
                                <button type="button" onClick={() => addToBasket(plan)}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02] active:scale-[0.98]">
                                    <ShoppingBag size={18}/>{t("addToBasket")}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
