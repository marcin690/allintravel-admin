export function getImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith("http")) return path

    const base = process.env.NEXT_PUBLIC_STORAGE_URL;
    return `${base}${path}`;
}