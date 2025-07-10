'use client';

// proste parsowanie payloadu JWT (nie weryfikuje podpisu)
export function parseJwt(token: string): { exp?: number } | null {
    try {
        const payload = token.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function setAuthAfterLogin(token: string) {
    try { localStorage.setItem("jwt", token); } catch {}
    const { exp } = parseJwt(token) ?? {};
    const maxAge = exp ? Math.max(Math.floor(exp - Date.now() / 1000), 0) : 60 * 60 * 8;
    document.cookie = `jwt=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    if (exp) document.cookie = `jwt_exp=${exp}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function logout() {
    try { localStorage.removeItem("jwt"); } catch {}
    document.cookie = "jwt=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "jwt_exp=; Path=/; Max-Age=0; SameSite=Lax";
    if (typeof window !== "undefined") window.location.href = "/login";
}

// fetch z automatycznym Bearer + auto-logout przy 401/403
export async function apiFetch(path: string, init?: RequestInit) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

    const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;


    const headers: HeadersInit = {
        ...(init?.headers as any),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    };

    const res = await fetch(base + path, {
        ...init,
        headers,
    });

    // if (res.status === 401 || res.status === 403) {
    //     logout();
    //     throw new Error("Sesja wygasła lub brak autoryzacji.");
    // }
    return res; // nadal zwracamy Response – w komponentach rób res.json()
}
