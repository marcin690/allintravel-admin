"use client";

import React, {useCallback, useEffect, useState} from "react";
import {TripSummaryDTO} from "@/app/shared/types/trip.types";
import { apiFetch } from "@/utils/auth";
import {ColumnDef} from "@tanstack/react-table";
import {useUniversalTable} from "@/hooks/useUniwersalTable";
import UniversalTable from "@/components/ui/UniversalTable";
import TripTypesSummary from "@/app/admin/trips/components/TripTypesSummary";
import Link from "next/link";
import {BiPencil} from "react-icons/bi";
import {AiFillDelete} from "react-icons/ai";
import {toast} from "react-toastify";
import {PlusCircleIcon} from "lucide-react";

export default function TripsPage() {

    const [trips, setTrips] = useState([]);
    const [tableKey, setTableKey] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);


    const fetchTrips = useCallback(
        async (query: string, page: number): Promise<TripSummaryDTO[]> => {
            let url = "";

            if (selectedType) {
                url = `/trips/admin?type=${selectedType}&page=${page}`;
            } else {
                url = `/trips/admin/all?page=${page}`;
            }

            const res = await apiFetch(url);
            const data = await res.json();
            setTrips(data.content);
            return data.content;
        },
        [selectedType] // ważne: re-run gdy zmienia się typ
    );

    useEffect(() => {
        setTableKey(prevKey => prevKey + 1);
    }, [selectedType]);



    async function deleteTrip(id: number) {
        try {
            await apiFetch(`/trips/${id}`, { method: 'DELETE' });
            setTableKey(prev => prev + 1);
            toast.success("Wycieczka usunięta");
        } catch (err: any) {
            toast.error(`Błąd usuwania: ${err.message}`);
        }
    }

    // kolumny (na początek 2-3 kolumny)
    const columns: ColumnDef<TripSummaryDTO>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: (info) => {
                console.log(info.row.original);
                return info.getValue();
            }
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
            cell: (info) => info.getValue(),
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
                        <div
                            className={`text-center h-4 w-4 rounded-full ${statusColor}`}
                        />
                        <span>{statusName}</span>
                    </div>
                );
            },
        },
        {
            header: "Actions",
            cell: (info) => {
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { /* tu wstaw kod do edycji */ }}
                        >
                            <BiPencil />
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                    deleteTrip(info.row.original.id);
                                }
                            }}
                        >
                            <AiFillDelete />
                        </button>
                    </div>
                );
            },
        }




    ];



    const {table} = useUniversalTable({
        fetchData: fetchTrips,
        columnConfig: columns,
        pageable: true,
        pageSize: 10
    });

    return (
        <div className="p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Lista Wycieczek</h1>

                <div className="flex items-center gap-3">
                    {/* Dropdown */}
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                        value={selectedType ?? ""}
                        onChange={(e) => setSelectedType(e.target.value || null)}
                    >
                        <option value="">Pokaż wszystkie typy wycieczek</option>
                        <option value="INDIVIDUAL">Indywidualne</option>
                        <option value="SCHOOL">Szkolne</option>
                        <option value="SENIOR">Seniorzy</option>
                        <option value="PILGRIMAGE">Pielgrzymki</option>
                        <option value="CORPORATE">Firmowe</option>
                    </select>

                    {/* Button */}
                    <Link
                        href="/admin/trips/add"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition"
                    >
                        <PlusCircleIcon size={18}/>
                        Dodaj wycieczkę
                    </Link>
                </div>
            </div>


            <div className="border rounded-lg p-4 bg-white shadow">
                <UniversalTable key={tableKey} fetchData={fetchTrips} columns={columns} pageable={true} pageSize={10}/>
            </div>
        </div>
    )


}