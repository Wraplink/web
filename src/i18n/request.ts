import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({requestLocale}) => {
    const locale = (await requestLocale) ?? "fa";

    const validLocale =
        locale === "fa" ? "fa" : "en";

    return {
        locale: validLocale,
        messages: (
            await import(`../messages/${validLocale}.json`)
        ).default,
    };
});