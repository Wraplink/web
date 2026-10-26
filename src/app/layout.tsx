import "./globals.css";

import type {Metadata} from "next";

import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
    title: {
        default: "WrapLink",
        template: "%s | WrapLink",
    },
    description:
        "Next generation gamer network and connectivity platform.",
    icons: {
        icon: [{url: "/wraplink-icon.png", sizes: "512x512", type: "image/png"}, {url: "/favicon.ico", sizes: "any"}],
        apple: [{url: "/wraplink-icon.png", sizes: "512x512", type: "image/png"}],
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa" data-scroll-behavior="smooth">
        <body className="text-white antialiased">
        <AppShell>
            {children}
        </AppShell>
        </body>
        </html>
    );
}