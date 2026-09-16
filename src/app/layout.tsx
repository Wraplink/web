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
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className="text-white antialiased">
        <AppShell>
            {children}
        </AppShell>
        </body>
        </html>
    );
}