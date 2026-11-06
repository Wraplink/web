import createMiddleware from "next-intl/middleware";
import {NextRequest, NextResponse} from "next/server";

import {routing} from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    // These Persian default-locale user-zone routes have explicit pages under
    // the authenticated root route group. Do not rewrite or redirect them
    // through [locale], where default-locale canonicalization can select the
    // wrong layout and lose the sidebar and saved theme.
    if (/^\/user\/(?:market|basket)(?:\/|$)/.test(request.nextUrl.pathname)) {
        return NextResponse.next();
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
