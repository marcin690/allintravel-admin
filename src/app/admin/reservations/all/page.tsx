"use client"

import { apiFetch } from "@/utils/auth";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import UniversalTable from "@/components/ui/UniversalTable";
import { FiEdit } from "react-icons/fi";

// --- Typy ---
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type ReservationListItem = {
    id: number;
    status: ReservationStatus;
    institutionName: string;
    createdAt: string;
    trip: { // Potrzebujemy informacji, do jakiej wycieczki należy rezerwacja
        id: number;
        name: string;
    };
};

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

export default function AllReservationsPage() {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [tableKey, setTableKey] = useState(0);
    const PAGE_SIZE = 25;

    const fetchReservations = useCallback(
        async (query: string, page: number): Promise<PageResponse<ReservationListItem>> => {
            try {
                const urlParams = new URLSearchParams({
                    page: String(page),
                    size: String(PAGE_SIZE),
                    sort: 'createdAt,desc' // Domyślne sortowanie od najnowszych
                });
                if (query) urlParams.append("search", query);
                if (selectedStatus) urlParams.append("status", selectedStatus);

                const response = await apiFetch(`/reservations/admin?${urlParams}`);
                if (!response.ok) {
                    toast.error("Błąd pobierania rezerwacji");
                    return { content: [], totalPages: 0, totalElements: 0 };
                }
                return response.json();
            } catch (e) {
                console.error(e);
                toast.error("Nie udało się pobrać listy rezerwacji");
                return { content: [], totalPages: 0, totalElements: 0 };
            }
        },
        [selectedStatus]
    );

    useEffect(() => {
        setTableKey(prevKey => prevKey + 1);
    }, [selectedStatus]);

    const getStatusBadge = (status: ReservationStatus) => {
        const config = {
            'CONFIRMED': { class: 'bg-green-100 text-green-800', label: 'Potwierdzona' },
            'PENDING': { class: 'bg-yellow-100 text-yellow-800', label: 'Oczekująca' },
            'CANCELLED': { class: 'bg-red-100 text-red-800', label: 'Anulowana' }
        };
        const { class: className, label } = config[status] || { class: 'bg-gray-100 text-gray-800', label: 'Nieznany' };
        return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{label}</span>;
    };

    const columns: ColumnDef<ReservationListItem>[] = [
        { header: 'ID', accessorKey: 'id' },
        {
            header: 'Wycieczka',
            accessorKey: 'trip.name',
            cell: ({ row }) => (
                <Link href={`/admin/reservations/show/${row.original.trip.id}`} className="text-blue-600 hover:underline">
                    {row.original.trip.name}
                </Link>
            )
        },
        { header: 'Instytucja', accessorKey: 'institutionName' },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            header: 'Data Złożenia',
            accessorKey: 'createdAt',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('pl-PL'),
        },
        {
            header: 'Akcje',
            id: 'actions',
            cell: ({ row }) => (
                <Link href={`/admin/reservations/edit/${row.original.id}`} title="Edytuj">
                    <FiEdit size={18} />
                </Link>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Wszystkie Rezerwacje</h1>
                <div className="flex items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                        value={selectedStatus ?? ""}
                        onChange={(e) => setSelectedStatus(e.target.value || null)}
                    >
                        <option value="">Wszystkie statusy</option>
                        <option value="PENDING">Oczekujące</option>
                        <option value="CONFIRMED">Potwierdzone</option>
                        <option value="CANCELLED">Anulowane</option>
                    </select>
                </div>
            </div>

            <UniversalTable
                key={tableKey}
                fetchData={fetchReservations}
                columns={columns}
                pageable={true}
                searchable={true}
                pageSize={PAGE_SIZE}
            />
        </div>
    );
}