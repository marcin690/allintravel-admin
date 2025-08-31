// app/admin/pages/add/page.tsx
// Strona która renderuje formularz dodawania

"use client"


import { useRouter } from 'next/navigation';

import Link from 'next/link';
import React from "react";
import PageForm from "@/app/admin/pages/components/PageForm";

export default function AddPagePage() {
    const router = useRouter(); // Hook do nawigacji

    // Funkcja wywoływana po sukcesie
    const handleSuccess = () => {
        // Po zapisaniu wróć do listy
        router.push('/admin/pages');
    };

    return (
        <div className="p-6">
            {/* Nawigacja powrotna */}
            <div className="mb-6">
                <Link
                    href="/admin/pages"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >

                    Powrót do listy
                </Link>
            </div>

            {/* Nagłówek */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Dodaj nową stronę</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Wypełnij formularz aby utworzyć nową stronę
                </p>
            </div>

            {/* Formularz */}
            <PageForm
                onSuccess={handleSuccess}
                mode="create"
            />
        </div>
    );
}