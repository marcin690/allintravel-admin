"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TripForm from "@/components/admin/trips/AddTripForm";
import { TripDetailsDTO } from "@/app/shared/types/trip.types";
import { apiFetch } from "@/utils/auth";

export default function EditTripPage() {
    const router = useRouter();
    const { id } = useParams();
    const [initialData, setInitialData] = useState<TripDetailsDTO | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        apiFetch(`/trips/admin/${id}`)
            .then(async (res) => {  // res to Response object
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();  // ✅ Musisz sparsować JSON!
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
            <h1 className="text-2xl mb-4">Edycja wycieczki #{id}</h1>
            {initialData && (
                <TripForm
                    initialData={initialData}
                    onSuccess={() => router.push("/admin/trips")}
                />
            )}
        </div>
    );
}
