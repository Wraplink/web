"use client";

import {useMemo, useState} from "react";
import {
    Wallet,
    CreditCard,
    Bitcoin,
    Building2,
    ArrowDownCircle,
    ArrowUpCircle
} from "lucide-react";

import {useTranslations} from "next-intl";

type Props = {
    locale: string;
};

type Filter = "all" | "deposit" | "withdraw";
type PaymentMethod = "wallet" | "cart" | "crypto" | "isp";

export default function WalletContent({locale}: Props) {

    const t = useTranslations("WalletPage");

    const [filter, setFilter] = useState<Filter>("all");
    const [method, setMethod] =
        useState<PaymentMethod>("wallet");
    const [amount, setAmount] = useState("");

    /*
     * ============================================================
     * BACKEND TODO
     * ============================================================
     *
     * GET  /api/v1/wallet/balance
     * GET  /api/v1/wallet/transactions
     * POST /api/v1/wallet/deposit
     * POST /api/v1/wallet/withdraw
     * GET  /api/v1/payment/methods
     *
     * Replace mock values with API responses.
     * ============================================================
     */

    const balance = "$126.75";

    const transactions = [
        {
            id: "TX1001",
            type: "deposit",
            amount: "$50",
            date: "Today"
        },
        {
            id: "TX1002",
            type: "withdraw",
            amount: "$20",
            date: "Yesterday"
        },
        {
            id: "TX1003",
            type: "deposit",
            amount: "$100",
            date: "2 days ago"
        }
    ];

    const filtered = useMemo(() => {
        if (filter === "all") {
            return transactions;
        }

        return transactions.filter(
            (transaction) => transaction.type === filter
        );
    }, [filter]);

    const submitDeposit = () => {
        console.log("Deposit", {
            locale,
            method,
            amount
        });
    };

    const submitWithdraw = () => {
        console.log("Withdraw", {
            locale,
            amount
        });
    };

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">

            {/* Header */}

            <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                <h1 className="text-4xl font-black">
                    {t("title")}
                </h1>

                <p className="mt-3 text-gray-300">
                    {t("subtitle")}
                </p>

            </div>

            {/* Balance */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center justify-between">

                    <div>

                        <div className="text-gray-400">
                            {t("balance")}
                        </div>

                        <div className="mt-3 text-5xl font-black text-cyan-400">
                            {balance}
                        </div>

                    </div>

                    <Wallet
                        size={60}
                        className="text-cyan-400"
                    />

                </div>

            </div>

            {/* Forms */}

            <div className="mt-10 grid gap-8 lg:grid-cols-2">

                {/* Deposit */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <div className="mb-6 flex items-center gap-3">

                        <ArrowDownCircle className="text-green-400"/>

                        <h2 className="text-2xl font-bold">
                            {t("deposit")}
                        </h2>

                    </div>

                    <label className="mb-2 block text-sm">
                        {t("amount")}
                    </label>

                    <input
                        value={amount}
                        onChange={(event) =>
                            setAmount(event.target.value)
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400"
                        placeholder="$50"
                    />

                    <div className="mt-6">

                        <label className="mb-3 block text-sm">
                            {t("paymentMethods")}
                        </label>

                        <div className="grid gap-3 grid-cols-2">

                            <MethodButton
                                active={method === "wallet"}
                                onClick={() =>
                                    setMethod("wallet")
                                }
                                icon={<Wallet size={18}/>}
                                title={t("methods.wallet")}
                            />

                            <MethodButton
                                active={method === "cart"}
                                onClick={() =>
                                    setMethod("cart")
                                }
                                icon={
                                    <CreditCard size={18}/>
                                }
                                title={t("methods.cart")}
                            />

                            <MethodButton
                                active={method === "crypto"}
                                onClick={() =>
                                    setMethod("crypto")
                                }
                                icon={<Bitcoin size={18}/>}
                                title={t("methods.crypto")}
                            />

                            <MethodButton
                                active={method === "isp"}
                                onClick={() =>
                                    setMethod("isp")
                                }
                                icon={<Building2 size={18}/>}
                                title={t("methods.isp")}
                            />

                        </div>

                    </div>

                    <button
                        onClick={submitDeposit}
                        className="mt-8 w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02]"
                    >
                        {t("submitDeposit")}
                    </button>

                </div>

                {/* Withdraw */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <div className="mb-6 flex items-center gap-3">

                        <ArrowUpCircle className="text-red-400"/>

                        <h2 className="text-2xl font-bold">
                            {t("withdraw")}
                        </h2>

                    </div>

                    <label className="mb-2 block text-sm">
                        {t("amount")}
                    </label>

                    <input
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400"
                        placeholder="$20"
                    />

                    <button
                        onClick={submitWithdraw}
                        className="mt-8 w-full rounded-xl border border-red-400 py-3 font-bold text-red-400 transition hover:bg-red-400 hover:text-black"
                    >
                        {t("submitWithdraw")}
                    </button>

                </div>

            </div>

            {/* Transactions */}

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex flex-wrap items-center justify-between gap-4">

                    <h2 className="text-2xl font-bold">
                        {t("transactions")}
                    </h2>

                    <div className="flex gap-2">

                        {(["all", "deposit", "withdraw"] as const).map((item) => (
                            <button
                                key={item}
                                onClick={() => setFilter(item)}
                                className={`rounded-full px-4 py-2 text-sm transition ${
                                    filter === item
                                        ? "bg-cyan-400 text-black"
                                        : "border border-white/10 text-gray-300 hover:border-cyan-400"
                                }`}
                            >
                                {t(`filters.${item}`)}
                            </button>
                        ))}

                    </div>

                </div>

                <div className="mt-8 space-y-3">

                    {filtered.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4"
                        >

                            <div className="flex items-center gap-4">

                                {transaction.type === "deposit"
                                    ? (
                                        <ArrowDownCircle className="text-green-400"/>
                                    ) : (
                                        <ArrowUpCircle className="text-red-400"/>
                                    )}

                                <div>

                                    <div className="font-semibold">
                                        {transaction.id}
                                    </div>

                                    <div className="text-sm text-gray-400">
                                        {transaction.date}
                                    </div>

                                </div>

                            </div>

                            <div
                                className={`font-bold ${
                                    transaction.type === "deposit"
                                        ? "text-green-400"
                                        : "text-red-400"
                                }`}
                            >
                                {transaction.amount}
                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}

function MethodButton({
                          active,
                          onClick,
                          icon,
                          title
                      }: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 rounded-xl border p-3 transition ${
                active
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 hover:border-cyan-400"
            }`}
        >
            {icon}
            <span className="text-sm">
                {title}
            </span>
        </button>
    );
}