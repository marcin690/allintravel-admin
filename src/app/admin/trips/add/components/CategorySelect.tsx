"use client"
import React, {useEffect, useState} from "react";
import { apiFetch } from "@/utils/auth";



function flattenForSelect(nodes: any[] = [], depth = 0) {
    if (!Array.isArray(nodes)) return [];   // gdyby przyszło coś innego niż tablica

    const out: { id: number; label: string }[] = [];

    for (const node of nodes) {
        const indent = "— ".repeat(depth);
        out.push({ id: Number(node.id), label: indent + (node.name ?? "") });

        // UWAGA: musi być node.children (pojedyncze!), plus twarda kontrola tablicy
        if (Array.isArray(node.children) && node.children.length > 0) {
            out.push(...flattenForSelect(node.children, depth + 1));
        }
    }

    return out;
}

type Props = {
    tripType: "INDIVIDUAL" | "SCHOOL" | "SENIOR" | "PILGRIMAGE" | "CORPORATE";
    value: number;                   // wybrane ID (0 = brak)
    onChange: (id: number) => void;  // zwracamy samo ID
    className?: string;
    placeholder?: string;
};


export default function CategorySelect({
                                           tripType,
                                           value,
                                           onChange,
                                           className,
                                           placeholder = "Wybierz kategorię",
                                       }: Props) {
    const [categoryOptions, setCategoryOptions] = useState<{ id: number; label: string }[]>([]);
    const [catsLoading, setCatsLoading] = useState(false);
    const [catsError, setCatsError] = useState<string | null>(null);
    useEffect(() => {
        let alive = true;

        async function load() {
            setCatsLoading(true);
            setCatsError(null);
            try {
                const res = await apiFetch(`/categories/by-type/${tripType}?showChildren=1`, { method: "GET" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);


                const json = await res.json();


                const tree = Array.isArray(json) ? json : (json?.content ?? json?.data ?? []);


                const opts = flattenForSelect(tree);
                if (!alive) return;

                setCategoryOptions(opts);

                if (value && !opts.some(o => o.id === value)) onChange(0);
            } catch (e: any) {
                if (!alive) return;
                setCatsError(e?.message ?? "Nie udało się pobrać kategorii");
                setCategoryOptions([]);
                onChange(0);
            } finally {
                if (alive) setCatsLoading(false);
            }
        }

        load();
        return () => { alive = false; };
    }, [tripType]);


    return (
        <div className="flex flex-col gap-1">
            <select
                value={value || 0}
                onChange={(e) => onChange(Number(e.target.value))}
                className={className}
                disabled={catsLoading || categoryOptions.length === 0}
            >
                <option value={0} disabled>
                    {catsLoading
                        ? "Ładowanie kategorii..."
                        : catsError
                            ? "Błąd ładowania kategorii"
                            : placeholder}
                </option>

                {categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {catsError && <span className="text-xs text-red-600">{catsError}</span>}
        </div>
    );

}