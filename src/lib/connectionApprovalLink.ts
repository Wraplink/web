const approvalKey = "wraplink:pending-ip-approval";
const validId = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const prefix = "#approve-ip=";

export function getConnectionApprovalId(): string {
    const id = window.location.hash.startsWith(prefix)
        ? window.location.hash.slice(prefix.length)
        : sessionStorage.getItem(approvalKey) ?? "";
    return validId.test(id) ? id : "";
}

export function preserveConnectionApproval(path: string) {
    if (!/^\/(?:en\/|fa\/)?connection\/?$/.test(path) || !window.location.hash.startsWith(prefix)) return false;

    const id = getConnectionApprovalId();
    if (!id) return false;
    sessionStorage.setItem(approvalKey, id);
    return true;
}

export function clearConnectionApproval() {
    sessionStorage.removeItem(approvalKey);
    if (window.location.hash.startsWith(prefix)) {
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
}
