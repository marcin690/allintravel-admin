// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // chronimy tylko /admin/*
    if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

    const token = req.cookies.get("jwt")?.value;
    const expStr = req.cookies.get("jwt_exp")?.value;
    const exp = expStr ? Number(expStr) : undefined;

    // brak tokenu lub przeterminowany → redirect + skasowanie ciastek
    if (!token || !exp || exp * 1000 <= Date.now()) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
        const res = NextResponse.redirect(url);
        res.cookies.set("jwt", "", { maxAge: 0, path: "/" });
        res.cookies.set("jwt_exp", "", { maxAge: 0, path: "/" });
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};