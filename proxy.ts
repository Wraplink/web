import createMiddleware from "next-intl/middleware";
import {NextRequest, NextResponse} from "next/server";

import {routing} from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    // The user-zone shop must resolve through the authenticated locale route
    // rather than the public /market and /basket storefront pages.
    // Use an explicit locale for these paths to avoid ambiguous default-locale
    // routing, which can render the storefront without the user sidebar.
    if (/^\/user\/(?:market|basket)(?:\/|$)/.test(request.nextUrl.pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = `/fa${request.nextUrl.pathname}`;
        return NextResponse.redirect(url);
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    ],
};
