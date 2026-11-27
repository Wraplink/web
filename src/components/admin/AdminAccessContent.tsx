"use client";

import {useEffect, useRef, useState} from "react";
import {useLocale} from "next-intl";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {adminPermissions, updateAdminPermission, type AdminPermission, type GrantableAdminPermission} from "@/lib/api/admin";

const grantOptions: {id: GrantableAdminPermission; en: string; fa: string}[] = [
  {id: "payment_review", en: "Review payments", fa: "بررسی پرداخت‌ها"},
  {id: "payment_methods", en: "Manage payment methods", fa: "مدیریت روش‌های پرداخت"},
  {id: "discount_admin", en: "Manage discounts", fa: "مدیریت تخفیف‌ها"},
  {id: "plans", en: "Manage plans", fa: "مدیریت پلن‌ها"},
  {id: "starter_plans", en: "Manage starter plans", fa: "مدیریت پلن‌های شروع رایگان"},
  {id: "support", en: "Reply to and manage support tickets", fa: "پاسخ‌گویی و مدیریت تیکت‌ها"},
  {id: "contact_messages", en: "View contact messages", fa: "مشاهده پیام‌های تماس"},
  {id: "network_monitor", en: "Monitor network (read-only)", fa: "پایش شبکه (فقط خواندنی)"},
  {id: "network_manage", en: "Manage network (includes monitoring)", fa: "مدیریت شبکه (شامل پایش)"},
  {id: "domain_policies", en: "Manage domain policies", fa: "مدیریت سیاست‌های دامنه"},
  {id: "users", en: "View user directory", fa: "مشاهده فهرست کاربران"},
  {id: "orders", en: "View orders", fa: "مشاهده سفارش‌ها"},
];

type PermissionChange = {
  userId: string;
  option: typeof grantOptions[number];
  enabled: boolean;
};

function hasGrant(user: AdminPermission, permission: GrantableAdminPermission) {
  if (permission === "payment_review") return user.paymentReview;
  if (permission === "discount_admin") return user.discountAdmin;
  return user.sections.includes(permission);
}

export default function AdminAccessContent() {
  const fa = useLocale() === "fa";
  const [users, setUsers] = useState<AdminPermission[]>([]);
  const [target, setTarget] = useState("");
  const [permission, setPermission] = useState<GrantableAdminPermission>("payment_review");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingChange, setPendingChange] = useState<PermissionChange | null>(null);
  const targetInput = useRef<HTMLInputElement>(null);
  const loadError = fa ? "بارگذاری مجوزها ناموفق بود." : "Unable to load permissions.";

  useEffect(() => {
    let active = true;
    adminPermissions().then(
      result => { if (active) setUsers(result); },
      () => { if (active) setError(loadError); },
    );
    return () => { active = false; };
  }, [loadError]);

  async function confirmChange() {
    if (!pendingChange || busy) return;
    const {userId, option, enabled} = pendingChange;
    setPendingChange(null);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await updateAdminPermission(userId, option.id, enabled);
      setNotice(fa ? "مجوز به‌روزرسانی شد." : "Permission updated.");
      await adminPermissions().then(setUsers, () => setError(loadError));
    } catch (err) {
      setError((err as {response?: {data?: {error?: string}}}).response?.data?.error ??
        (fa ? "به‌روزرسانی مجوز ناموفق بود." : "Unable to update permission."));
    } finally {
      setBusy(false);
    }
  }

  return <main className="mx-auto max-w-5xl px-6 py-12">
    <h1 className="text-3xl font-bold">{fa ? "مجوزهای مدیریت" : "Administrator permissions"}</h1>
    <p className="my-4 text-gray-400">{fa ? "مجوزها را برای هر کاربر انتخاب کنید. تغییرات ثبت می‌شوند." : "Grant permissions by user. Changes are audited."}</p>
    {error && <p role="alert" className="mb-4 text-red-400">{error}</p>}
    {notice && <p role="status" className="mb-4 text-green-300">{notice}</p>}
    <form onSubmit={event => {
      event.preventDefault();
      const option = grantOptions.find(item => item.id === permission);
      if (!busy && option && target.trim()) setPendingChange({userId: target.trim(), option, enabled: true});
    }} className="mb-8 flex flex-wrap gap-3">
      <input ref={targetInput} required aria-label={fa ? "شناسه کاربر" : "User UUID"} placeholder={fa ? "شناسه کاربر" : "User UUID"} value={target} onChange={event => setTarget(event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-transparent p-3" />
      <select aria-label={fa ? "مجوز" : "Permission"} value={permission} onChange={event => setPermission(event.target.value as GrantableAdminPermission)} className="max-w-full rounded-lg border bg-slate-900 p-3">
        {grantOptions.map(option => <option key={option.id} value={option.id}>{fa ? option.fa : option.en}</option>)}
      </select>
      <button disabled={busy || !target.trim()} className="rounded-lg bg-cyan-600 px-4 py-2 disabled:opacity-50">{fa ? "اعطای مجوز" : "Grant permission"}</button>
    </form>
    <div className="space-y-3">{users.map(user => <article key={user.userId} className="rounded-xl border border-white/15 p-4">
      <div className="mb-3 font-semibold">{user.email}<span className="block break-all text-xs font-normal text-gray-400">{user.userId}</span></div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setTarget(user.userId)} className="rounded-lg border border-cyan-400/40 px-3 py-2 text-sm">{fa ? "انتخاب کاربر" : "Select user"}</button>
        {grantOptions.filter(option => hasGrant(user, option.id)).map(option =>
          <button key={option.id} disabled={busy} onClick={() => setPendingChange({userId: user.userId, option, enabled: false})} className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50">
            {fa ? `لغو ${option.fa}` : `Revoke ${option.en.toLowerCase()}`}
          </button>
        )}
      </div>
    </article>)}</div>
    <Dialog open={pendingChange !== null} onOpenChange={open => { if (!open) setPendingChange(null); }}>
      <DialogContent dir={fa ? "rtl" : "ltr"} finalFocus={targetInput} showCloseButton={false} className="border border-white/15 bg-slate-950 text-white">
        {pendingChange && <>
          <DialogHeader>
            <DialogTitle>
              {pendingChange.enabled ? (fa ? "اعطای مجوز؟" : "Grant permission?") : (fa ? "لغو مجوز؟" : "Revoke permission?")}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              <span className="block">{fa ? pendingChange.option.fa : pendingChange.option.en}</span>
              <bdi dir="ltr" className="mt-1 block break-all text-xs text-gray-400">{pendingChange.userId}</bdi>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/15 bg-white/5">
            <DialogClose className="rounded-lg border border-white/20 px-4 py-2">{fa ? "انصراف" : "Cancel"}</DialogClose>
            <button type="button" onClick={() => void confirmChange()} className={`rounded-lg px-4 py-2 ${pendingChange.enabled ? "bg-cyan-700" : "bg-red-700"}`}>
              {pendingChange.enabled ? (fa ? "اعطای مجوز" : "Grant permission") : (fa ? "لغو مجوز" : "Revoke permission")}
            </button>
          </DialogFooter>
        </>}
      </DialogContent>
    </Dialog>
  </main>;
}
