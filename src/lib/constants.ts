export const SITE = {
    name: "WrapLink",
    description: "Next Generation Gamer Network",
};

export const LOCALES = ["en", "fa"] as const;

export type Locale = (typeof LOCALES)[number];

export const NAVIGATION = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Market", href: "/market" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
];