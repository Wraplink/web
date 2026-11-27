"use client";

import {useState, useSyncExternalStore} from "react";
import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ConnectionActivationError, confirmConnectionIpApproval} from "@/lib/api/connection";
import {clearConnectionApproval, getConnectionApprovalId} from "@/lib/connectionApprovalLink";

function subscribeToApprovalLink(callback: () => void) {
    window.addEventListener("hashchange", callback);
    return () => window.removeEventListener("hashchange", callback);
}

export default function ConfirmConnectionIpDialog({
    locale, onApproved,
}: {
    locale: string;
    onApproved: () => Promise<void>;
}) {
    const t = useTranslations("ConnectionPage");
    const id = useSyncExternalStore(subscribeToApprovalLink, getConnectionApprovalId, () => "");
    const [dismissed, setDismissed] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const close = () => {
        clearConnectionApproval();
        setDismissed(id);
        setError(null);
    };

    const approve = async () => {
        setConfirming(true);
        setError(null);
        try {
            await confirmConnectionIpApproval(id);
            close();
            await onApproved();
        } catch (err) {
            const code = err instanceof ConnectionActivationError ? err.code : "";
            switch (code) {
                case "IP_APPROVAL_UNAVAILABLE":
                    setError(t("ipDialog.approvalUnavailable"));
                    break;
                case "CLIENT_IP_MISMATCH":
                    setError(t("ipDialog.ipMismatch"));
                    break;
                case "PUBLIC_IPV4_REQUIRED":
                    setError(t("ipDialog.publicIpv4Required"));
                    break;
                case "NO_USABLE_SUBSCRIPTION":
                    setError(t("errors.noUsableSubscription"));
                    break;
                case "CLIENT_IP_IN_USE":
                    setError(t("errors.ipInUse"));
                    break;
                default:
                    setError(t("ipDialog.approvalFailed"));
            }
        } finally {
            setConfirming(false);
        }
    };

    if (!id || id === dismissed) return null;

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !confirming) close(); }}>
            <DialogContent dir={locale === "fa" ? "rtl" : "ltr"} showCloseButton={false} className="wraplink-user-dialog">
                <DialogTitle>{t("ipDialog.approveTitle")}</DialogTitle>
                <DialogDescription>{t("ipDialog.approveDescription")}</DialogDescription>
                {error && <p role="alert" className="text-destructive">{error}</p>}
                <Button type="button" disabled={confirming} onClick={() => void approve()}>
                    {t(confirming ? "ipDialog.connecting" : "ipDialog.approve")}
                </Button>
                <Button type="button" variant="ghost" disabled={confirming} onClick={close}>{t("ipDialog.cancel")}</Button>
            </DialogContent>
        </Dialog>
    );
}
