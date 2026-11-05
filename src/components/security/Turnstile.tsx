"use client";

import {useEffect, useRef, useState} from "react";
import Script from "next/script";

declare global {
    interface Window {
        turnstile?: {
            render: (element: HTMLElement, options: {
                sitekey: string;
                callback: (token: string) => void;
                "expired-callback": () => void;
                "error-callback": () => void;
            }) => string;
            remove: (id: string) => void;
            reset: (id: string) => void;
        };
    }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function Turnstile({onToken}: {onToken: (token: string) => void}) {
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (!siteKey || !ready || !container.current || !window.turnstile) return;
        const id = window.turnstile.render(container.current, {
            sitekey: siteKey,
            callback: onToken,
            "expired-callback": () => onToken(""),
            "error-callback": () => onToken(""),
        });
        widgetId.current = id;
        return () => {
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
            widgetId.current = null;
        };
    }, [ready, onToken]);
    if (!siteKey) return null;
    return <>
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive" onReady={() => setReady(true)}/>
        <div ref={container} aria-label="Human verification" className="my-4"/>
    </>;
}

export const captchaEnabled = Boolean(siteKey);
