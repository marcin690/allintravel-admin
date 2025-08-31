"use client"

import { apiFetch } from "@/utils/auth";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import {FiArrowLeft, FiCheckCircle, FiEdit, FiXCircle} from "react-icons/fi";
import UniversalTable from "@/components/ui/UniversalTable";
import ProgressBar from "@/components/ui/ProgressBarProps";


// --- Typy ---
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// 1. Upewniamy się, że typ zawiera wszystkie potrzebne pola
export type ReservationItem = {
    id: number;
    status: ReservationStatus;
    totalParticipantsCount: number;
    paidParticipantsCount: number;
    unpaidParticipantsCount: number;
    institutionName: string;
    email: string;
    phoneNumber: string;
    startAddress?: string;

    // DODAJ te pola:
    voivodeship?: string;
    basePricePerPerson?: number;
    totalPricePerPerson?: number;
    grandTotalPrice: number;

    createdAt: string;
    term?: { id: number; startDate?: string };
    selectedAddons: { name: string; price?: number }[];
    lastModifiedAt: string;
    lastModifiedBy?: { username: string };
};


type TermSummary = {
    id: number;
    startDate?: string;
    endDate?: string;
    isPricingTemplate?: boolean;
    totalCapacity: number;
    reservedPaid: number;
    reservedFree: number;
};

type GroupedReservations = {
    [termId: string]: ReservationItem[];
};

export default function ReservationsForTripPage() {
    const params = useParams();
    const tripId = params.id as string;

    const [tripName, setTripName] = useState<string>('');
    const [terms, setTerms] = useState<TermSummary[]>([]);
    const [groupedReservations, setGroupedReservations] = useState<GroupedReservations>({});
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!tripId) return;
        setIsLoading(true);

        Promise.all([
            apiFetch(`/trips/admin/${tripId}`).then(res => res.json()),
            apiFetch(`/reservations/admin/by-trip/${tripId}/all`).then(res => res.json())
        ]).then(([tripData, reservationsData]: [any, ReservationItem[]]) => {
            setTripName(tripData.name);

            // Grupujemy rezerwacje po terminie
            const grouped = reservationsData.reduce((acc, res) => {
                const key = res.term?.id?.toString() ?? 'zapytania';
                if (!acc[key]) acc[key] = [];
                acc[key].push(res);
                return acc;
            }, {} as GroupedReservations);
            setGroupedReservations(grouped);

            // POPRAWKA: Liczymy zajętość na podstawie rezerwacji, nie z API
            const sanitizedTerms = (tripData.terms || []).map((term: any) => {
                // Znajdź rezerwacje dla tego terminu
                const termReservations = grouped[term.id.toString()] || [];

                // Policz zajęte miejsca na podstawie AKTYWNYCH rezerwacji
                let reservedPaid = 0;
                let reservedFree = 0;

                termReservations.forEach(reservation => {
                    // Liczymy tylko potwierdzone i oczekujące rezerwacje
                    if (reservation.status !== 'CANCELLED') {
                        reservedPaid += reservation.paidParticipantsCount;
                        reservedFree += reservation.unpaidParticipantsCount;
                    }
                });

                return {
                    ...term,
                    reservedPaid: reservedPaid,
                    reservedFree: reservedFree,
                    // Dodajemy też obliczone wolne miejsca
                    availableSlots: term.totalCapacity - (reservedPaid + reservedFree)
                };
            });
            setTerms(sanitizedTerms);

        }).catch(err => {
            console.error(err);
            toast.error("Nie udało się wczytać danych.");
        }).finally(() => {
            setIsLoading(false);
        });
    }, [tripId, refreshKey]);

    const getStatusBadge = (status: ReservationStatus) => {
        const config = {
            'CONFIRMED': { class: 'bg-green-100 text-green-800', label: 'Potwierdzona' },
            'PENDING': { class: 'bg-yellow-100 text-yellow-800', label: 'Oczekująca' },
            'CANCELLED': { class: 'bg-red-100 text-red-800', label: 'Anulowana' }
        };
        const { class: className, label } = config[status] || { class: 'bg-gray-100 text-gray-800', label: 'Nieznany' };
        return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{label}</span>;
    };

    const handleApproveReservation = async (reservationId: number) => {
        try {
            const response = await apiFetch(`/reservations/admin/${reservationId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error("Nie można zatwierdzić rezerwacji");
            }

            toast.success(`Rezerwacja #${reservationId} została zatwierdzona`);
            setRefreshKey(prev => prev + 1); // Odświeżamy dane
        } catch (err) {
            toast.error("Nie udało się zatwierdzić rezerwacji");
            console.error(err);
        }
    };

    /**
     * ANULOWANIE/ODRZUCANIE rezerwacji
     */
    const handleRejectReservation = async (reservationId: number) => {
        try {
            const response = await apiFetch(`/reservations/admin/${reservationId}/cancel`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error("Nie można anulować rezerwacji");
            }

            toast.success(`Rezerwacja #${reservationId} została anulowana`);
            setRefreshKey(prev => prev + 1); // Odświeżamy dane
        } catch (err) {
            toast.error("Nie udało się anulować rezerwacji");
            console.error(err);
        }
    };

    // 2. AKTUALIZUJEMY DEFINICJĘ KOLUMN
    const columns: ColumnDef<ReservationItem>[] = [
        { header: 'ID', accessorKey: 'id', size: 60 },
        {
            header: 'Klient / Kontakt',
            id: 'customerInfo',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.institutionName}</div>
                    {/* Dodajemy adres startowy bezpośrednio pod nazwą */}
                    {row.original.startAddress && (
                        <div className="text-xs text-gray-500">
                            Start: {row.original.startAddress}
                        </div>
                    )}
                    <a href={`mailto:${row.original.email}`} className="text-xs text-blue-600 hover:underline">{row.original.email}</a>
                    <div className="text-xs text-gray-600">{row.original.phoneNumber}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            header: 'Dodatki',
            id: 'addons',
            cell: ({ row }) => (
                <ul className="list-disc list-inside text-xs text-gray-700">
                    {row.original.selectedAddons.length > 0 ? (
                        row.original.selectedAddons.map(addon => (
                            <li key={addon.name}>{addon.name}</li>
                        ))
                    ) : (
                        <span className="text-gray-400 italic">Brak</span>
                    )}
                </ul>
            )
        },
        {
            header: 'Uczestnicy',
            id: 'participants',
            cell: ({ row }) => (
                // Nowy, szczegółowy widok uczestników
                <div className="flex flex-col text-sm">
                    <span>Łącznie: <strong>{row.original.totalParticipantsCount}</strong></span>
                    <span className="text-xs text-gray-600">Płatne: {row.original.paidParticipantsCount}</span>
                    <span className="text-xs text-gray-600">Bezpłatne: {row.original.unpaidParticipantsCount}</span>
                </div>
            )
        },
        {
            header: 'Województwo',
            accessorKey: 'voivodeship',
            cell: ({ row }) => {
                if (!row.original.voivodeship) return <span className="text-gray-400">-</span>;
                // Formatuj nazwę województwa
                const formatted = row.original.voivodeship
                    .replace('_', '-')
                    .toLowerCase()
                    .replace(/\b\w/g, l => l.toUpperCase());
                return <span className="text-sm">{formatted}</span>;
            }
        },
        // NOWA KOLUMNA - Cena za osobę
        {
            header: 'Cena/os',
            id: 'pricePerPerson',
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    {row.original.basePricePerPerson ? (
                        <>
                            <span>Bazowa: {row.original.basePricePerPerson.toFixed(2)} zł</span>
                            {row.original.totalPricePerPerson && (
                                <span className="text-xs text-gray-600">
                                Z dodatkami: {row.original.totalPricePerPerson.toFixed(2)} zł
                            </span>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            )
        },
        {
            header: 'Wartość (PLN)',
            accessorKey: 'grandTotalPrice',
            cell: ({ row }) => row.original.grandTotalPrice?.toFixed(2) ?? '0.00',
        },
        {
            header: 'Ostatnia Edycja',
            id: 'audit',
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span>{new Date(row.original.lastModifiedAt).toLocaleString('pl-PL')}</span>
                    <span className="text-gray-500">przez: {row.original.lastModifiedBy?.username ?? 'System'}</span>
                </div>
            )
        },
        {
            header: 'Akcje',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {/* Przyciski widoczne tylko dla rezerwacji w statusie PENDING */}
                    {row.original.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleApproveReservation(row.original.id)}
                                title="Zatwierdź rezerwację"
                                className="text-green-600 hover:text-green-800 transition-colors"
                            >
                                <FiCheckCircle size={18} />
                            </button>
                            <button
                                onClick={() => handleRejectReservation(row.original.id)}
                                title="Odrzuć rezerwację"
                                className="text-red-600 hover:text-red-800 transition-colors"
                            >
                                <FiXCircle size={18} />
                            </button>
                        </>
                    )}

                    {/* Dla zatwierdzonych - możliwość anulowania */}
                    {/*{row.original.status === 'CONFIRMED' && (*/}
                    {/*    <button*/}
                    {/*        onClick={() => handleRejectReservation(row.original.id)}*/}
                    {/*        title="Anuluj rezerwację"*/}
                    {/*        className="text-orange-600 hover:text-orange-800 transition-colors"*/}
                    {/*    >*/}
                    {/*        <FiXCircle size={18} />*/}
                    {/*    </button>*/}
                    {/*)}*/}

                    {/*/!* Dla anulowanych - możliwość przywrócenia *!/*/}
                    {/*{row.original.status === 'CANCELLED' && (*/}
                    {/*    <button*/}
                    {/*        onClick={() => handleApproveReservation(row.original.id)}*/}
                    {/*        title="Przywróć rezerwację"*/}
                    {/*        className="text-blue-600 hover:text-blue-800 transition-colors"*/}
                    {/*    >*/}
                    {/*        <FiCheckCircle size={18} />*/}
                    {/*    </button>*/}
                    {/*)}*/}
                </div>
            ),
        }
    ];

    if (isLoading) return <div className="p-6">Ładowanie...</div>;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin/reservations" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <FiArrowLeft size={18} /> Powrót do listy wycieczek
                </Link>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-8">
                Rezerwacje dla: <span className="text-blue-600">{tripName}</span>
            </h1>

            <div className="space-y-10">
                {terms.map(term => {
                    const termReservations = groupedReservations[term.id.toString()] || [];

                    // POPRAWKA: Liczymy tylko AKTYWNE rezerwacje (nie-anulowane)
                    const activeReservations = termReservations.filter(r => r.status !== 'CANCELLED');

                    // Teraz sumujemy tylko z aktywnych rezerwacji
                    const reservedTotal = activeReservations.reduce(
                        (sum, currentReservation) => sum + currentReservation.totalParticipantsCount,
                        0
                    );

                    // Używamy danych z term który już ma policzone wartości
                    const available = term.totalCapacity - reservedTotal;

                    return (
                        <div key={term.id} className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold mb-2">
                                Termin: {term.isPricingTemplate ? "Cennik dla zapytań" :
                                `${new Date(term.startDate!).toLocaleDateString('pl-PL')} - ${new Date(term.endDate!).toLocaleDateString('pl-PL')}`}
                            </h2>
                            <div className="mb-4">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium">Obłożenie</span>
                                    <span className="text-gray-600">
                        Zajęte: {reservedTotal} / {term.totalCapacity} (Wolne: {available})
                    </span>
                                </div>
                                <ProgressBar value={reservedTotal} max={term.totalCapacity} />
                            </div>

                            {termReservations.length > 0 ? (
                                <UniversalTable
                                    initialData={termReservations}
                                    columns={columns}
                                    pageable={false}
                                    searchable={false}
                                />
                            ) : (
                                <p className="text-sm text-gray-500 italic py-4 text-center">
                                    Brak rezerwacji dla tego terminu.
                                </p>
                            )}
                        </div>
                    )
                })}

                {(groupedReservations['zapytania']?.length ?? 0) > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">
                            Zapytania (rezerwacje bez przypisanego terminu)
                        </h2>
                        <UniversalTable
                            initialData={groupedReservations['zapytania']}
                            columns={columns}
                            pageable={false}
                            searchable={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}