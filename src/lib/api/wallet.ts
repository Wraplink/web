import {apiClient} from "@/lib/api/client";

export const WALLET_CURRENCY = "IRR";

export type WalletBalance = {
    currency: string;
    balanceMinor: number;
    updatedAt?: string;
};

export type WalletTransaction = {
    id: string;
    currency: string;
    paymentId?: string;
    direction: "credit" | "debit";
    reason: string;
    amountMinor: number;
    balanceAfterMinor: number;
    createdAt: string;
};

export type WalletDeposit = {
    id: string;
    amountMinor: number;
    currency: string;
    provider: string;
    status: string;
    paymentId?: string;
    createdAt: string;
    updatedAt: string;
};

export async function getWalletBalance(): Promise<WalletBalance> {
    const response = await apiClient.get<WalletBalance>("/api/v1/me/wallet", {
        params: {currency: WALLET_CURRENCY},
    });
    return response.data;
}

export async function getWalletTransactions(limit = 100): Promise<WalletTransaction[]> {
    const response = await apiClient.get<{transactions: WalletTransaction[]}>(
        "/api/v1/me/wallet/transactions",
        {params: {currency: WALLET_CURRENCY, limit}}
    );
    return response.data.transactions ?? [];
}

export async function getWalletDeposits(limit = 50): Promise<WalletDeposit[]> {
    const response = await apiClient.get<{deposits: WalletDeposit[]}>(
        "/api/v1/me/deposits",
        {params: {limit}}
    );
    return response.data.deposits ?? [];
}

/** Creates a pending request; no money is charged or credited until settlement. */
export async function createWalletDeposit(
    amountMinor: number,
    idempotencyKey: string
): Promise<WalletDeposit> {
    const response = await apiClient.post<WalletDeposit>(
        "/api/v1/me/deposits",
        {amountMinor, currency: WALLET_CURRENCY},
        {headers: {"Idempotency-Key": idempotencyKey}}
    );
    return response.data;
}
