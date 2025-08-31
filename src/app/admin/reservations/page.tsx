"use client"

import { apiFetch } from "@/utils/auth";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import UniversalTable from "@/components/ui/UniversalTable";
import ProgressBar from "@/components/ui/ProgressBarProps";
import EyeIcon from "next/dist/client/components/react-dev-overlay/ui/icons/eye-icon";
import {AiFillEye} from "react-icons/ai";


// Typy dla danych z API (dopasowane do Twojego backendu)
type TripStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type TripType = 'INDIVIDUAL' | 'SCHOOL' | 'SENIOR' | 'PILGRIMAGE' | 'CORPORATE';

export type TripItem = {
    id: number;
    name: string;
    tripType: TripType;
    status: TripStatus;
    lastModifiedAt: string;
    totalCapacity: number;
    totalReserved: number;
    availableSlots: number;

};

// Typ odpowiedzi ze Spring Boot (dokładnie jak w Twoim przykładzie)
interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

export default function ReservationsIndexPage() {
    // 1. Dodajemy stan do przechowywania wybranego typu i klucza do odświeżania tabeli
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [tableKey, setTableKey] = useState(0);
    const PAGE_SIZE = 25; // Możesz dostosować

    // 2. Adaptujemy funkcję pobierającą dane, aby reagowała na zmianę typu
    const fetchTrips = useCallback(
        async (query: string, page: number): Promise<PageResponse<TripItem>> => {
            try {
                let urlPath = `/trips/admin/all?page=${page}&size=${PAGE_SIZE}`;
                if (selectedType) {
                    urlPath = `/trips/admin?type=${selectedType}&page=${page}&size=${PAGE_SIZE}`;
                }
                if (query) {
                    urlPath += `&search=${query}`;
                }

                const response = await apiFetch(urlPath);
                if (!response.ok) {
                    toast.error("Błąd pobierania wycieczek");
                    // Zwracamy obiekt o prawidłowej strukturze, ale z pustą zawartością
                    return { content: [], totalPages: 0, totalElements: 0 };
                }

                // Zwracamy cały obiekt `data` bez żadnych modyfikacji!
                const data: PageResponse<TripItem> = await response.json();
                return data;

            } catch (e) {
                console.error(e);
                toast.error("Nie udało się pobrać listy wycieczek");
                return { content: [], totalPages: 0, totalElements: 0 };
            }
        },
        [selectedType]
    );

    // 3. Dodajemy useEffect, który odświeży tabelę po zmianie filtra
    useEffect(() => {
        setTableKey(prevKey => prevKey + 1);
    }, [selectedType]);

    // Definicja kolumn (bez zmian, jest poprawna)
    const columns: ColumnDef<TripItem>[] = [
        {
            header: 'Nazwa Wycieczki',
            accessorKey: 'name',
            cell: ({ row }) => ( // Używamy cell, żeby zrobić z tego link
                <Link
                    href={`/admin/reservations/show/${row.original.id}`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {row.original.name}
                </Link>
            )
        },
        {
            header: 'Typ',
            accessorKey: 'tripType',
        },
        // NOWA KOLUMNA "DOSTĘPNOŚĆ"
        {
            header: 'Dostępność',
            id: 'availability',
            cell: ({ row }) => {
                const { totalCapacity, totalReserved, availableSlots } = row.original;

                // Jeśli pojemność nie jest zdefiniowana (np. dla wycieczek indywidualnych)
                if (!totalCapacity || totalCapacity === 0) {
                    return <span className="text-gray-400">N/D</span>;
                }

                return (
                    <div className="flex flex-col">
                        <ProgressBar value={totalReserved} max={totalCapacity} />
                        <span className="text-xs text-gray-600 mt-1">
                            Zajęte: {totalReserved} / {totalCapacity} (Wolne: {availableSlots})
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Akcje',
            id: 'actions',
            cell: ({ row }) => (
                <Link
                    href={`/admin/reservations/show/${row.original.id}`}
                    className="p-1.5 text-primary hover:bg-blue-50 rounded transition-colors"
                    title="Zobacz rezerwacje"
                >
                    <AiFillEye className="h-5 w-5" />
                </Link>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Zarządzanie rezerwacjami</h1>

                {/* 4. Dodajemy interfejs użytkownika (dropdown do filtrowania) */}
                <div className="flex items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                        value={selectedType ?? ""}
                        onChange={(e) => setSelectedType(e.target.value || null)}
                    >
                        <option value="">Wszystkie typy</option>
                        <option value="INDIVIDUAL">Indywidualne</option>
                        <option value="SCHOOL">Szkolne</option>
                        <option value="SENIOR">Seniorzy</option>
                        <option value="PILGRIMAGE">Pielgrzymki</option>
                        <option value="CORPORATE">Firmowe</option>
                    </select>
                </div>
            </div>

            <p className="mb-4 text-gray-600">Wybierz wycieczkę, aby zobaczyć przypisane do niej rezerwacje.</p>

            <div className="">
                <UniversalTable
                    key={tableKey} // 5. Dodajemy klucz do odświeżania
                    fetchData={fetchTrips}
                    columns={columns}
                    pageable={true}
                    searchable={true} // Możesz włączyć, jeśli chcesz
                    pageSize={PAGE_SIZE}
                />
            </div>
        </div>
    );
}