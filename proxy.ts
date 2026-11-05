import createMiddleware from "next-intl/middleware";
import {NextRequest} from "next/server";

import {routing} from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);
// Keep an explicit /fa prefix for authenticated shop routes. With the default
// "as-needed" policy, /fa/user/market is canonicalized back to /user/market,
// which can select the wrong (public) layout and lose the sidebar and theme.
const userShopMiddleware = createMiddleware({
    ...routing,
    localePrefix: "always",
});

export default function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (/^\/(?:fa\/)?user\/(?:market|basket)(?:\/|$)/.test(pathname)) {
        return userShopMiddleware(request);
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    ],
};
