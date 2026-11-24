"use client";

import {useEffect, useState, type FormEvent} from "react";
import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {routing} from "@/i18n/routing";
import {deleteSavedConnectionIp, getSavedConnectionIps, type ConnectionIpApproval} from "@/lib/api/connection";

type Props = {
    locale: string;
    connecting: boolean;
    error: string | null;
    approval: ConnectionIpApproval | null;
    onCheckApproval: () => Promise<void>;
    onClearError: () => void;
    onClose: () => void;
    onConnect: (clientIp?: string) => Promise<void>;
};

export default function ConnectionIpDialog({
    locale, connecting, error, approval, onCheckApproval, onClearError, onClose, onConnect,
}: Props) {
    const t = useTranslations("ConnectionPage.ipDialog");
    const [clientIp, setClientIp] = useState("");
    const [detectedIp, setDetectedIp] = useState<string>();
    const [savedIps, setSavedIps] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [deleteFailed, setDeleteFailed] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const busy = connecting || deleting !== null;
    const approvalUrl = approval && new URL(
        `${locale === routing.defaultLocale ? "" : `/${locale}`}/connection#approve-ip=${approval.id}`,
        window.location.origin,
    ).href;

    useEffect(() => {
        let current = true;
        getSavedConnectionIps()
            .then(({ips, detectedIp}) => {
                if (current) {
                    setSavedIps(ips);
                    setDetectedIp(detectedIp);
                }
            })
            .catch(() => {
                if (current) setLoadFailed(true);
            })
            .finally(() => {
                if (current) setLoading(false);
            });
        return () => {
            current = false;
        };
    }, [loadAttempt]);

    const selectIp = (ip: string) => {
        setClientIp(ip);
        onClearError();
    };

    const removeIp = async (ip: string) => {
        setDeleting(ip);
        setDeleteFailed(false);
        try {
            await deleteSavedConnectionIp(ip);
            setSavedIps((current) => current.filter((savedIp) => savedIp !== ip));
            if (clientIp.trim() === ip) selectIp("");
        } catch {
            setDeleteFailed(true);
        } finally {
            setDeleting(null);
        }
    };

    const submitIp = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!busy && clientIp.trim()) void onConnect(clientIp.trim());
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
            <DialogContent dir={locale === "fa" ? "rtl" : "ltr"} showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-auto sm:max-w-md">
                <DialogTitle>{t("title")}</DialogTitle>
                <DialogDescription>{t("description")}</DialogDescription>
                <Button type="button" variant="outline" disabled={busy} onClick={() => void onConnect()}>
                    {t("automatic")} {detectedIp && <bdi className="font-mono">{detectedIp}</bdi>}
                </Button>
                <form onSubmit={submitIp} className="space-y-2">
                    <label htmlFor="connection-ip" className="font-medium">{t("manual")}</label>
                    <Input
                        id="connection-ip"
                        dir="ltr"
                        value={clientIp}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={busy}
                        onChange={(event) => selectIp(event.target.value)}
                    />
                    <Button type="submit" className="w-full" disabled={busy || !clientIp.trim()}>
                        {t("connect")}
                    </Button>
                    {connecting && <p role="status">{t("connecting")}</p>}

                </form>
                {approvalUrl && (
                    <section className="space-y-2 border-t pt-3">
                        <p>{t("approvalInstructions")}</p>
                        <label htmlFor="ip-approval-link" className="font-medium">{t("approvalLink")}</label>
                        <Input id="ip-approval-link" dir="ltr" value={approvalUrl} readOnly
                            onFocus={(event) => event.currentTarget.select()} />
                        <Button type="button" variant="outline" disabled={busy} onClick={() => void onCheckApproval()}>
                            {t("approvalCheck")}
                        </Button>
                    </section>
                )}
                {error && <p role="alert" className="text-red-500">{error}</p>}
                <section className="space-y-2 border-t pt-3">
                    <h3 className="font-medium">{t("saved")}</h3>
                    {loading && <p role="status">{t("loading")}</p>}
                    {loadFailed && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p role="alert">{t("loadFailed")}</p>
                            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => {
                                setLoadFailed(false);
                                setLoading(true);
                                setLoadAttempt((attempt) => attempt + 1);
                            }}>{t("retry")}</Button>
                        </div>
                    )}
                    {!loading && !loadFailed && savedIps.length === 0 && <p>{t("empty")}</p>}
                    {savedIps.length > 0 && (
                        <ul className="max-h-44 space-y-1 overflow-auto">
                            {savedIps.map((ip) => (
                                <li key={ip} className="flex items-center justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant={clientIp === ip ? "secondary" : "ghost"}
                                        aria-pressed={clientIp === ip}
                                        disabled={busy}
                                        onClick={() => selectIp(ip)}
                                    >
                                        <bdi className="font-mono">{ip}</bdi>
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" disabled={busy}
                                        aria-label={t("deleteIp", {ip})} onClick={() => void removeIp(ip)}>
                                        {t(deleting === ip ? "deleting" : "delete")}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {deleteFailed && <p role="alert" className="text-red-500">{t("deleteFailed")}</p>}
                </section>
                <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{t(approval ? "close" : "cancel")}</Button>
            </DialogContent>
        </Dialog>
    );
}
