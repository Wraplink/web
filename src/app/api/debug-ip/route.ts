import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return new NextResponse(null, {status: 404});
    }

    return NextResponse.json(
        {
            forwardedFor: request.headers.get("x-forwarded-for"),
            realIP: request.headers.get("x-real-ip"),
            host: request.headers.get("host"),
        },
        {headers: {"Cache-Control": "no-store"}}
    );
}
