"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TripForm from "@/components/admin/trips/AddTripForm";
import {PageItem} from "@/app/admin/pages/page";
import { apiFetch } from "@/utils/auth";
import PageForm from "@/app/admin/pages/components/PageForm";

export default function EditTripPage() {
    const router = useRouter();
    const { id } = useParams();
    const [initialData, setInitialData] = useState<PageItem | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        apiFetch(`/content/${id}`)
            .then(async (res) => {  // res to Response object
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                setInitialData(data);
                setLoading(false);
            })
            .catch((e) => {
                setError((e as Error).message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Ładowanie danych…</p>;
    if (error)   return <p className="text-red-600">Błąd: {error}</p>;

    return (
        <div className="">
            <h1 className="text-2xl mb-4">Edycja strony #{id}</h1>
            {initialData && (
                <PageForm
                    pageId={id as number}
                    onSuccess={() => router.push("/admin/pages")}
                    mode={"edit"}
                    initialData={initialData} />
            )}
        </div>
    );
}
