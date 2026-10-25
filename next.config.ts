import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // Allow HMR when accessing the dev server from the local LAN.
    allowedDevOrigins: ["192.168.108.134"],

    output: "standalone",
};

const withNextIntl = createNextIntlPlugin(
    "./src/i18n/request.ts"
);

export default withNextIntl(nextConfig);