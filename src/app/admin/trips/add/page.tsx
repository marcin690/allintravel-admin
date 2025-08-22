"use client"; // <--- DODAJ TĘ LINIJKĘ NA SAMEJ GÓRZE

import dynamic from 'next/dynamic';

// Ponieważ cały plik jest teraz "kliencki", możesz użyć dynamicznego importu
const AddTripForm = dynamic(
    () => import('@/components/admin/trips/AddTripForm'),
    { ssr: false }
);

export default function AddTripPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Dodaj nową wycieczkę</h1>

            <AddTripForm/>
        </div>
    );
}