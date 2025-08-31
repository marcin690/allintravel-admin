"use client";

import React, {useCallback, useEffect, useState} from "react";
import {TripSummaryDTO} from "@/app/shared/types/trip.types";
import { apiFetch } from "@/utils/auth";
import {ColumnDef} from "@tanstack/react-table";
import UniversalTable from "@/components/ui/UniversalTable";
import Link from "next/link";
import {BiPencil} from "react-icons/bi";
import {AiFillDelete, AiFillStar, AiOutlineStar} from "react-icons/ai";
import {toast} from "react-toastify";

// Typ odpowiedzi ze Spring Boot
interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    last: boolean;
    first: boolean;
}

export default function TripsPage() {
    const [tableKey, setTableKey] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Stała wartość pageSize
    const PAGE_SIZE = 50;

    // Funkcja pobierająca dane - WAŻNE: zwraca cały obiekt Page, nie tylko content
    const fetchTrips = useCallback(
        async (query: string, page: number): Promise<PageResponse<TripSummaryDTO>> => {
            let url = "";

            if (selectedType) {
                url = `/trips/admin?type=${selectedType}&page=${page}&size=${PAGE_SIZE}`;
            } else {
                url = `/trips/admin/all?page=${page}&size=${PAGE_SIZE}`;
            }

            const res = await apiFetch(url);
            const data = await res.json();

            // Zwracamy CAŁY obiekt, nie tylko content
            return data;
        },
        [selectedType]
    );

    // Reset tabeli gdy zmienia się typ
    useEffect(() => {
        setTableKey(prevKey => prevKey + 1);
    }, [selectedType]);

    // Funkcja do usuwania
    async function deleteTrip(id: number) {
        try {
            await apiFetch(`/trips/${id}`, { method: 'DELETE' });
            setTableKey(prev => prev + 1); // Odśwież tabelę
            toast.success("Wycieczka usunięta");
        } catch (err: any) {
            toast.error(`Błąd usuwania: ${err.message}`);
        }
    }

    // Definicja kolumn
    const columns: ColumnDef<TripSummaryDTO>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "Nazwa",
            cell: (info) => {
                const row = info.row.original;
                return (
                    <Link
                        href={`/admin/trips/edit/${row.id}`}
                        className="text-blue-600 hover:underline"
                    >
                        {row.name}
                    </Link>
                );
            },
        },
        {
            accessorKey: "tripType",
            header: "Typ",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: (info) => {
                const row = info.row.original;
                let statusColor = '';
                let statusName = '';

                switch(row.status) {
                    case 'DRAFT':
                        statusColor = 'bg-yellow-500';
                        statusName = 'Szkic';
                        break;
                    case 'PUBLISHED':
                        statusColor = 'bg-green-500';
                        statusName = 'Opublikowana';
                        break;
                    case 'ARCHIVED':
                        statusColor = 'bg-gray-500';
                        statusName = 'Zarchiwizowana';
                        break;
                    case 'FUTURE':
                        statusColor = 'bg-blue-500';
                        statusName = 'Zaplanowana';
                        break;
                    default:
                        statusColor = 'bg-red-500';
                        statusName = 'Nieznany';
                        break;
                }

                return (
                    <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full ${statusColor}`} />
                        <span>{statusName}</span>
                    </div>
                );
            },
        },
        {
            header: "Info",
            cell: (info) => {
                const row = info.row.original;
                const lastModifiedAt = row.lastModifiedAt; // Zakładamy, że to pole istnieje
                const isFeatured = row.featured; // Zakładamy, że to pole istnieje

                return (
                    <div>
                        {/* Informacja o wyróżnieniu */}
                        <div className="flex items-center gap-1">
                            {isFeatured ? (
                                <AiFillStar className="text-yellow-500" />
                            ) : (
                                <AiOutlineStar className="text-gray-400" />
                            )}
                            <span className={`text-sm ${isFeatured ? 'font-semibold' : 'text-gray-600'}`}>
                                {isFeatured ? 'Wyróżniona' : 'Standardowa'}
                            </span>
                        </div>

                        {/* Informacja o ostatniej aktualizacji */}
                        <div className="text-xs text-gray-500 mt-1">
                            {lastModifiedAt
                                ? `Aktualizacja: ${new Date(lastModifiedAt).toLocaleString('pl-PL')}`
                                : '-'
                            }
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Akcje",
            cell: (info) => {
                return (
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/trips/edit/${info.row.original.id}`}>
                            <BiPencil className="cursor-pointer hover:text-blue-600" />
                        </Link>
                        <button
                            onClick={() => {
                                if (window.confirm('Czy na pewno chcesz usunąć tę wycieczkę?')) {
                                    deleteTrip(info.row.original.id);
                                }
                            }}
                        >
                            <AiFillDelete className="cursor-pointer hover:text-red-600" />
                        </button>
                    </div>
                );
            },
        }
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Lista Wycieczek</h1>

                <div className="flex items-center gap-3">
                    {/* Filtr typu */}
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

                    {/* Przycisk dodaj */}
                    <Link
                        href="/admin/trips/add"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Dodaj wycieczkę
                    </Link>
                </div>
            </div>

            {/* Tabela */}
            <div className="">
                <UniversalTable
                    key={tableKey}
                    fetchData={fetchTrips}
                    columns={columns}
                    pageable={true}
                    pageSize={PAGE_SIZE}
                    searchable={false} // Wyłącz wyszukiwanie na razie
                />
            </div>
        </div>
    );
}