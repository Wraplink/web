"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {clearBasket, getBasket, type BasketItem} from "@/lib/basket";
import {getMarketPlans, createPendingSubscription, paySubscriptionWithWallet, type MarketPlan} from "@/lib/api/plans";
import {getWalletBalance, type WalletBalance} from "@/lib/api/wallet";
import {listSubscriptions} from "@/lib/api/subscriptions";

type Props = {locale: string};

function formatMoney(amount: number, currency: string, locale: string) {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency", currency,
    }).format(amount / (currency === "IRR" ? 1 : 100));
}

export default function CheckoutContent({locale}: Props) {
    const t = useTranslations("CheckoutPage");
    const router = useRouter();
    const [items, setItems] = useState<BasketItem[]>([]);
    const [plans, setPlans] = useState<MarketPlan[]>([]);
    const [wallet, setWallet] = useState<WalletBalance | null>(null);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const pendingId = useRef<string | null>(null);
    const submitting = useRef(false);

    const load = async () => {
        setChecking(true);
        setError("");
        try {
            const [catalog, balance] = await Promise.all([getMarketPlans(), getWalletBalance()]);
            setItems(getBasket());
            setPlans(catalog);
            setWallet(balance);
        } catch {
            setError("Could not verify plan prices or wallet balance. Please retry.");
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const lines = useMemo(() => items.map(item => ({
        item, plan: plans.find(plan => plan.code === item.id),
    })), [items, plans]);
    const currency = lines[0]?.plan?.currency ?? "";
    const valid = lines.length > 0 && lines.every(({item, plan}) =>
        plan && Number.isInteger(item.quantity) && item.quantity > 0 &&
        plan.currency === currency && Number.isSafeInteger(plan.priceMinor) && plan.priceMinor >= 0
    );
    const total = valid ? lines.reduce((sum, {item, plan}) => sum + item.quantity * plan!.priceMinor, 0) : 0;
    const canPay = valid && wallet?.currency === currency && wallet.balanceMinor >= total;

    const pay = async () => {
        if (submitting.current || loading) return;
        if (!canPay || !wallet) {
            setError("The wallet balance is insufficient or the basket could not be verified.");
            return;
        }
        submitting.current = true;
        setLoading(true);
        setError("");
        try {
            // A subscription represents exactly one plan; multi-item checkout needs a server-side order API.
            if (lines.length !== 1 || lines[0].item.quantity !== 1) {
                throw new Error("Only one plan per checkout is supported. Update your basket and retry.");
            }
            const plan = lines[0].plan!;
            if (!pendingId.current) {
                // Reuse an existing pending subscription to avoid creating duplicates on retries.
                const existing = (await listSubscriptions()).find(s =>
                    s.planCode === plan.code && s.status === "pending_payment" &&
                    s.currency === plan.currency && s.priceMinor === plan.priceMinor
                );
                pendingId.current = existing?.id ?? (await createPendingSubscription(plan.code)).id;
            }
            const result = await paySubscriptionWithWallet(pendingId.current);
            if (!result || (typeof result === "object" && "status" in result &&
                !["active", "paid", "completed", "succeeded"].includes(String(result.status)))) {
                // Check authoritative subscription state instead of assuming payment succeeded.
                const subscriptions = await listSubscriptions();
                if (!subscriptions.some(s => s.id === pendingId.current && s.status === "active")) {
                    throw new Error("Payment is not confirmed. Check Orders before retrying.");
                }
            }
            clearBasket();
            router.push("/orders");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Payment failed. Please check Orders before retrying.");
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/basket" className="text-cyan-400">← {t("backToBasket")}</Link>
                <h1 className="mt-6 text-4xl font-black">{t("title")}</h1>
                <p className="mt-2 text-gray-400">{t("subtitle")}</p>
                {error && <div role="alert" className="mt-6 rounded-xl border border-red-400/30 p-4 text-red-300">{error}</div>}
                {checking ? <p className="mt-8 text-gray-400">{t("loading")}</p> : (
                    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-xl font-bold">{t("summary.title")}</h2>
                            {lines.map(({item, plan}) => (
                                <div key={item.id} className="mt-4 flex justify-between gap-3 border-b border-white/10 pb-4">
                                    <span>{plan?.name ?? item.name} × {item.quantity}</span>
                                    <span>{plan ? formatMoney(plan.priceMinor * item.quantity, plan.currency, locale) : "Unavailable"}</span>
                                </div>
                            ))}
                            {items.length === 0 && <p className="mt-5 text-gray-400">{t("empty.description")}</p>}
                            <div className="mt-5 flex justify-between font-bold">
                                <span>{t("summary.total")}</span>
                                <span>{valid ? formatMoney(total, currency, locale) : "—"}</span>
                            </div>
                        </div>
                        <div className="h-fit rounded-2xl border border-cyan-400/20 bg-white/5 p-6">
                            <h2 className="text-xl font-bold">{t("methods.wallet")}</h2>
                            <p className="mt-3 text-sm text-gray-400">{t("wallet.balance")}</p>
                            <p className="mt-1 font-bold">{wallet ? formatMoney(wallet.balanceMinor, wallet.currency, locale) : "—"}</p>
                            {!canPay && <p className="mt-4 text-sm text-amber-300">Wallet checkout unavailable: verify your basket, currency and available balance.</p>}
                            {(lines.length !== 1 || lines[0]?.item.quantity !== 1) && <p className="mt-4 text-sm text-amber-300">Checkout currently supports one plan at a time.</p>}
                            <button type="button" disabled={loading || !canPay || lines.length !== 1 || lines[0].item.quantity !== 1}
                                onClick={() => void pay()}
                                className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">
                                {loading ? t("processing") : t("payNow")}
                            </button>
                            <button type="button" onClick={() => void load()} disabled={loading} className="mt-4 w-full text-sm text-cyan-400">Refresh balance and prices</button>
                            <p className="mt-4 text-xs text-gray-500">Only wallet payment is supported by the current subscription API. Card, crypto and ISP payment are not available.</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
