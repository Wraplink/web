import {isIP} from "node:net";
import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backend = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "");

async function forward(request: NextRequest, context: {params: Promise<{path: string[]}>}) {
    if (!backend) {
        return NextResponse.json({error: "Backend proxy is not configured"}, {status: 503});
    }
    const {path} = await context.params;
    const target = new URL(`${backend}/api/v1/${path.map(encodeURIComponent).join("/")}`);
    target.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");
    headers.delete("x-real-ip");
    headers.delete("x-forwarded-for");
    headers.delete("forwarded");

    // Next.js supplies X-Forwarded-For for incoming requests. Only accept
    // it when the Next.js ingress is secured against client-supplied values.
    // For local development this is opt-in; never trust raw client headers.
    if (process.env.BACKEND_PROXY_TRUST_NEXT_FORWARDED_FOR === "true") {
        const forwarded = request.headers.get("x-forwarded-for");
        if (forwarded) {
            const lastHop = forwarded.split(",").at(-1)?.trim() ?? "";
            const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(lastHop);
            const clientIP = mapped && isIP(mapped[1]) === 4 ? mapped[1] : lastHop;
            if (isIP(clientIP)) {
                headers.set("x-forwarded-for", clientIP);
            }
        }
    }

    const response = await fetch(target, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
        redirect: "manual",
        cache: "no-store",
    });

    const outgoing = new Headers(response.headers);
    outgoing.delete("transfer-encoding");
    outgoing.delete("content-encoding");
    outgoing.delete("content-length");
    outgoing.delete("access-control-allow-origin");
    outgoing.delete("access-control-allow-credentials");

    return new NextResponse(response.body, {status: response.status, headers: outgoing});
}

export {forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE, forward as OPTIONS};
