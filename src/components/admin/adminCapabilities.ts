"use client";

import {createContext, useContext} from "react";
import type {AdminCapability} from "@/lib/api/admin";

export const adminSections = [
  {path: "users", permission: "users", en: "Users", fa: "کاربران"},
  {path: "orders", permission: "orders", en: "Orders", fa: "سفارش‌ها"},
  {path: "payment-reviews", permission: "payment_review", en: "Payment reviews", fa: "بررسی پرداخت‌ها"},
  {path: "payment-methods", permission: "payment_methods", en: "Payment methods", fa: "روش‌های پرداخت"},
  {path: "discounts", permission: "discount_admin", en: "Discounts", fa: "تخفیف‌ها"},
  {path: "plans", permission: "plans", en: "Plans", fa: "پلن‌ها"},
  {path: "starter-plans", permission: "starter_plans", en: "Starter plans", fa: "پلن‌های شروع رایگان"},
  {path: "support", permission: "support", en: "Support tickets", fa: "تیکت‌های پشتیبانی"},
  {path: "contact-messages", permission: "contact_messages", en: "Contact messages", fa: "پیام‌های تماس"},
  {path: "network", permission: "network_monitor", en: "Network", fa: "شبکه"},
  {path: "domain-policies", permission: "domain_policies", en: "Domain policies", fa: "سیاست‌های دامنه"},
  {path: "access", permission: "access", en: "Permissions", fa: "مجوزها"},
] as const;

export const AdminCapabilitiesContext = createContext<readonly AdminCapability[]>([]);

export function useAdminCapabilities() {
  return useContext(AdminCapabilitiesContext);
}
