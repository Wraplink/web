"use client";
import {useAdminCapabilities} from "./adminCapabilities";

import {useCallback, useEffect, useState} from "react";
import {useLocale} from "next-intl";
import {apiClient} from "@/lib/api/client";

type Session = {
  ID: string;
  AgentID: string;
  AgentSessionID: string;
  UserID: string;
  ClientIP: string;
  Mode: string;
  Protocol: string;
  LastReportAt: string;
  State: string;
};
type Command = {commandId: string; status: string; errorCode?: string};

export default function AdminOnlineUsersContent() {
  const canManage = useAdminCapabilities().includes("network_manage");
  const locale = useLocale();
  const fa = locale === "fa";
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [commands, setCommands] = useState<Record<string, Command>>({});
  const [reason, setReason] = useState("");

  const refresh = useCallback(async () => {
    try {
      const {data} = await apiClient.get<{items: Session[]}>("/api/v1/admin/network/sessions?limit=100");
      setSessions(data.items ?? []);
      setError("");
    } catch {
      setError(fa ? "دریافت نشست‌های شبکه ناموفق بود. دسترسی مدیر و فعال بودن سرویس را بررسی کنید." : "Unable to load network sessions. Check administrator access and backend availability.");
    } finally {
      setLoading(false);
    }
  }, [fa]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function disconnect(session: Session) {
    if (busy || !reason.trim()) return;
    const confirmText = fa ? "اتصال انتخاب‌شده قطع شود؟" : "Disconnect this SNI connection?";
    if (!window.confirm(confirmText)) return;
    setBusy(session.ID);
    try {
      const {data} = await apiClient.post<Command>(
        `/api/v1/admin/network/sessions/${encodeURIComponent(session.ID)}/disconnect`,
        {reason: reason.trim(), idempotencyKey: crypto.randomUUID()}
      );
      setCommands(previous => ({...previous, [session.ID]: data}));
      setReason("");
    } catch {
      setError(fa ? "ثبت دستور قطع اتصال ناموفق بود." : "Could not queue disconnect command.");
    } finally {
      setBusy(null);
    }
  }

  async function checkCommand(sessionID: string, commandID: string) {
    try {
      const {data} = await apiClient.get<Command>(
        `/api/v1/admin/network/disconnect-commands/${encodeURIComponent(commandID)}`
      );
      setCommands(previous => ({...previous, [sessionID]: data}));
      await refresh();
    } catch {
      setError(fa ? "بررسی وضعیت دستور ناموفق بود." : "Could not check command status.");
    }
  }

  return <main className="mx-auto max-w-6xl px-6 py-12">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{fa ? "کاربران آنلاین شبکه" : "Online network sessions"}</h1>
      <button type="button" onClick={() => void refresh()} className="rounded-lg border px-4 py-2">{fa ? "بازخوانی" : "Refresh"}</button>
    </div>
    <p className="mt-3 text-sm text-gray-400">
      {fa ? "فقط نشست‌های دارای گزارش تازه نمایش داده می‌شوند. ورود به وب‌سایت به معنی اتصال شبکه نیست." : "Only recently reported network sessions appear. Website sign-in does not imply an active network connection."}
    </p>
    <p className="mt-2 text-sm text-gray-400">{fa ? "به‌روزرسانی خودکار هر ۱۵ ثانیه" : "Automatically refreshes every 15 seconds"}</p>
    {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
    {canManage && <label className="mt-6 block max-w-xl text-sm">
      {fa ? "دلیل قطع اتصال (الزامی)" : "Disconnect reason (required)"}
      <input value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} className="mt-2 block w-full rounded-lg border border-white/20 bg-transparent p-3" />
    </label>}
    {loading ? <p className="mt-6">{fa ? "در حال بارگذاری…" : "Loading…"}</p> :
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/15">
        <table className="w-full text-sm" dir={fa ? "rtl" : "ltr"}>
          <thead><tr className="border-b border-white/15 text-start">
            <th className="p-3">{fa ? "کاربر" : "User"}</th>
            <th className="p-3">IP</th><th className="p-3">{fa ? "عامل" : "Agent"}</th>
            <th className="p-3">{fa ? "حالت" : "Mode"}</th><th className="p-3">{fa ? "آخرین گزارش" : "Last report"}</th>
            {canManage && <th className="p-3">{fa ? "عملیات" : "Action"}</th>}
          </tr></thead>
          <tbody>{sessions.map(session => <tr key={session.ID} className="border-b border-white/10">
            <td className="p-3 font-mono text-xs">{session.UserID}</td>
            <td className="p-3">{session.ClientIP}</td>
            <td className="p-3">{session.AgentID}</td>
            <td className="p-3">{session.Mode}/{session.Protocol}</td>
            <td className="p-3">{new Date(session.LastReportAt).toLocaleString(locale)}</td>
            {canManage && <td className="p-3">
              {session.Mode === "sni" && session.Protocol === "tcp" && session.State === "online" &&
                <button type="button" disabled={!!busy || !reason.trim() || commands[session.ID]?.status === "pending"}
                  onClick={() => void disconnect(session)} className="rounded border px-3 py-1 disabled:opacity-50">
                  {fa ? "قطع اتصال" : "Disconnect"}
                </button>}
              {commands[session.ID] && <div className="mt-2">
                <span role="status">{commands[session.ID].status}</span>
                <button type="button" className="ms-2 underline" onClick={() => void checkCommand(session.ID, commands[session.ID].commandId)}>
                  {fa ? "بررسی نتیجه" : "Check result"}
                </button>
              </div>}
            </td>}
          </tr>)}</tbody>
        </table>
        {sessions.length === 0 && <p className="p-6 text-center text-gray-400">{fa ? "نشست فعالی گزارش نشده است." : "No active network sessions reported."}</p>}
      </div>}
  </main>;
}
