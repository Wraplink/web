"use client";

import {useEffect, useState, type ReactNode} from "react";
import {usePathname} from "next/navigation";
import {Link} from "@/i18n/navigation";
import {useLocale} from "next-intl";
import {adminCapabilities, type AdminCapability} from "@/lib/api/admin";
import {AdminCapabilitiesContext, adminSections} from "./adminCapabilities";

export default function AdminLayoutGate({children}: {children: ReactNode}) {
  const fa = useLocale() === "fa";
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<AdminCapability[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    adminCapabilities().then(
      result => { if (active) setPermissions(result); },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, []);

  if (failed) return <p className="p-10" role="alert">{fa ? "سرویس مدیریت در دسترس نیست." : "The administration service is unavailable."}</p>;
  if (!permissions) return <p className="p-10" role="status">{fa ? "در حال بررسی دسترسی مدیریت…" : "Checking administrator access…"}</p>;
  if (!permissions.length) return <main className="p-10"><h1 className="text-2xl font-bold">{fa ? "حساب شما مجوز مدیریت ندارد" : "Your account has no administrator permissions"}</h1></main>;

  const section = pathname.match(/^\/(?:en\/|fa\/)?admin\/([^/]+)/)?.[1];
  const required = section === "dns" ? "domain_policies" : adminSections.find(tab => tab.path === section)?.permission;
  const allowed = !section || (required && permissions.includes(required));
  const linkStyle = "rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-200 hover:border-cyan-400 hover:text-cyan-300";

  return <AdminCapabilitiesContext.Provider value={permissions}>
    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
      <img src="/wraplink-symbol.svg" alt="" width={68} height={44} className="h-11 w-auto" />
      <div><div className="font-bold text-white">WrapLink</div><div className="text-xs text-cyan-300">{fa ? "مدیریت" : "Administration"}</div></div>
    </div>
    <nav aria-label={fa ? "منوی مدیریت" : "Administrator navigation"} className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-4">
      <Link href="/admin" className={linkStyle}>{fa ? "نمای کلی" : "Overview"}</Link>
      {adminSections.filter(tab => permissions.includes(tab.permission)).map(tab =>
        <Link key={tab.path} href={`/admin/${tab.path}`} className={linkStyle}>{fa ? tab.fa : tab.en}</Link>
      )}
    </nav>
    {allowed ? children : <p className="p-10" role="alert">{fa ? "شما به این بخش دسترسی ندارید." : "You do not have permission to access this section."}</p>}
  </AdminCapabilitiesContext.Provider>;
}
