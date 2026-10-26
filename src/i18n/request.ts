import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({requestLocale}) => {
    const locale = (await requestLocale) ?? "fa";

    const validLocale =
        locale === "en" ? "en" : "fa";

    return {
        locale: validLocale,
        messages: (
            await import(`../messages/${validLocale}.json`)
        ).default,
    };
});