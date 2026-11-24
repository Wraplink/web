"use client";

import {useEffect, useState} from "react";
import {useLocale} from "next-intl";
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
  const loadError = fa ? "بارگذاری مجوزها ناموفق بود." : "Unable to load permissions.";

  useEffect(() => {
    let active = true;
    adminPermissions().then(
      result => { if (active) setUsers(result); },
      () => { if (active) setError(loadError); },
    );
    return () => { active = false; };
  }, [loadError]);

  async function update(id: string, option: typeof grantOptions[number], enabled: boolean) {
    const name = fa ? option.fa : option.en;
    const action = fa ? (enabled ? "اعطا" : "لغو") : (enabled ? "Grant" : "Revoke");
    if (!window.confirm(`${action} “${name}” (${id})?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await updateAdminPermission(id, option.id, enabled);
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
      if (option && target.trim()) void update(target.trim(), option, true);
    }} className="mb-8 flex flex-wrap gap-3">
      <input required aria-label={fa ? "شناسه کاربر" : "User UUID"} placeholder={fa ? "شناسه کاربر" : "User UUID"} value={target} onChange={event => setTarget(event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-transparent p-3" />
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
          <button key={option.id} disabled={busy} onClick={() => void update(user.userId, option, false)} className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50">
            {fa ? `لغو ${option.fa}` : `Revoke ${option.en.toLowerCase()}`}
          </button>
        )}
      </div>
    </article>)}</div>
  </main>;
}
