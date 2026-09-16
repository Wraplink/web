"use client";

import {useEffect} from "react";

type Props = {
    locale: string;
};

export default function LocaleDocument({locale}: Props) {
    useEffect(() => {
        const isRTL = locale === "fa";

        document.documentElement.lang = locale;
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [locale]);

    return null;
}