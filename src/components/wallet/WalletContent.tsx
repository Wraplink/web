"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {ArrowDownCircle, ArrowUpCircle, RefreshCw, Wallet} from "lucide-react";
import {useTranslations} from "next-intl";

import {
    createWalletDeposit,
    getWalletBalance,
    getWalletDeposits,
    getWalletTransactions,
    type WalletBalance,
    type WalletDeposit,
    type WalletTransaction,
} from "@/lib/api/wallet";

type Props = {locale: string};
type Filter = "all" | "credit" | "debit";

function formatMoney(amount: number, locale: string): string {
    return `${new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        maximumFractionDigits: 0,
    }).format(amount)} IRR`;
}

export default function WalletContent({locale}: Props) {
    const t = useTranslations("WalletPage");
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [deposits, setDeposits] = useState<WalletDeposit[]>([]);
    const [filter, setFilter] = useState<Filter>("all");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const pendingKey = useRef<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const [nextBalance, nextTransactions, nextDeposits] = await Promise.all([
                getWalletBalance(),
                getWalletTransactions(),
                getWalletDeposits(),
            ]);
            setBalance(nextBalance);
            setTransactions(nextTransactions);
            setDeposits(nextDeposits);
            setError("");
        } catch (err) {
            console.error("Could not load wallet:", err);
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const submitDeposit = async () => {
        if (submitting) return;
        const value = Number(amount.trim());
        if (!/^[0-9]+$/.test(amount.trim()) || !Number.isSafeInteger(value) || value <= 0) {
            setError(t("invalidAmount"));
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");
        // Keep the same key across retries; never create duplicate deposits on a timeout.
        if (!pendingKey.current) pendingKey.current = crypto.randomUUID();
        try {
            const request = await createWalletDeposit(value, pendingKey.current);
            setMessage(t("requestCreated", {id: request.id.slice(0, 8)}));
            setAmount("");
            pendingKey.current = null;
            await refresh();
        } catch (err) {
            console.error("Could not create deposit request:", err);
            setError(t("requestError"));
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = filter === "all"
        ? transactions
        : transactions.filter((transaction) => transaction.direction === filter);

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">
                <h1 className="text-4xl font-black">{t("title")}</h1>
                <p className="mt-3 text-gray-300">{t("subtitle")}</p>
            </div>

            {error && (
                <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
                    {error}
                </div>
            )}
            {message && (
                <div role="status" className="mt-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200">
                    {message}
                </div>
            )}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-gray-400">{t("balance")}</div>
                        <div className="mt-3 text-3xl font-black text-cyan-400 sm:text-5xl">
                            {loading ? t("loading") : balance
                                ? formatMoney(balance.balanceMinor, locale)
                                : "—"}
                        </div>
                    </div>
                    <Wallet size={60} className="shrink-0 text-cyan-400"/>
                </div>
                <button type="button" onClick={() => void refresh()} disabled={loading || submitting}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-400 disabled:opacity-50">
                    <RefreshCw size={16}/>{t("refresh")}
                </button>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                        <ArrowDownCircle className="text-green-400"/>{t("deposit")}
                    </h2>
                    <label htmlFor="wallet-deposit-amount" className="mb-2 block text-sm">{t("amountIrr")}</label>
                    <input id="wallet-deposit-amount" type="text" inputMode="numeric" value={amount}
                        onChange={(event) => {
                            setAmount(event.target.value);
                            pendingKey.current = null;
                            setMessage("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400"
                        placeholder="500000"/>
                    <p className="mt-4 text-sm leading-6 text-yellow-200/80">{t("depositNotice")}</p>
                    <button type="button" onClick={() => void submitDeposit()} disabled={submitting || loading}
                        className="mt-8 w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
                        {submitting ? t("submitting") : t("requestDeposit")}
                    </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                        <ArrowUpCircle className="text-red-400"/>{t("withdraw")}
                    </h2>
                    <p className="text-sm leading-7 text-gray-400">{t("withdrawUnavailable")}</p>
                    <button type="button" disabled
                        className="mt-8 w-full cursor-not-allowed rounded-xl border border-white/10 py-3 font-bold text-gray-500">
                        {t("submitWithdraw")}
                    </button>
                </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold">{t("pendingDeposits")}</h2>
                <p className="mt-2 text-sm text-gray-400">{t("depositHistoryNotice")}</p>
                <div className="mt-6 space-y-3">
                    {deposits.length === 0 ? <p className="text-gray-400">{t("noDeposits")}</p>
                        : deposits.map((deposit) => (
                            <div key={deposit.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                                <div>
                                    <p className="font-semibold">{formatMoney(deposit.amountMinor, locale)}</p>
                                    <p className="text-xs text-gray-400">{new Date(deposit.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}</p>
                                </div>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-sm">{deposit.status}</span>
                            </div>
                        ))}
                </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{t("transactions")}</h2>
                        <p className="mt-1 text-xs text-gray-500">{t("recentTransactions")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(["all", "credit", "debit"] as const).map((item) => (
                            <button type="button" key={item} onClick={() => setFilter(item)}
                                className={`rounded-full px-4 py-2 text-sm transition ${filter === item
                                    ? "bg-cyan-400 text-black" : "border border-white/10 text-gray-300 hover:border-cyan-400"}`}>
                                {t(`filters.${item}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-8 space-y-3">
                    {filtered.length === 0 ? <p className="text-gray-400">{t("noTransactions")}</p>
                        : filtered.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                                <div className="flex min-w-0 items-center gap-4">
                                    {transaction.direction === "credit"
                                        ? <ArrowDownCircle className="shrink-0 text-green-400"/>
                                        : <ArrowUpCircle className="shrink-0 text-red-400"/>}
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold">{transaction.reason.replaceAll("_", " ")}</div>
                                        <div className="text-sm text-gray-400">
                                            {new Date(transaction.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
                                        </div>
                                    </div>
                                </div>
                                <div className={`shrink-0 font-bold ${transaction.direction === "credit" ? "text-green-400" : "text-red-400"}`}>
                                    {transaction.direction === "credit" ? "+" : "−"}{formatMoney(transaction.amountMinor, locale)}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
}
