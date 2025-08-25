"use client";

import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
} from '@tanstack/react-table'
import {useEffect, useState} from "react";

// Spring Boot zwraca taki format
interface PageResponse<T> {
    content: T[];          // dane
    totalPages: number;    // ile jest stron
    totalElements: number; // ile jest wszystkich rekordów
    number: number;        // aktualna strona (0-indexed)
    size: number;          // rozmiar strony
    last: boolean;         // czy to ostatnia strona
    first: boolean;        // czy to pierwsza strona
}

interface UseUniwersalTableProps<T> {
    fetchData: (query: string, page: number) => Promise<PageResponse<T>>; // Zmiana: zwracamy cały obiekt Page
    columnConfig: ColumnDef<T, any>[];
    pageable?: boolean;
    pageSize?: number;
}

export function useUniversalTable<T>({
                                         fetchData,
                                         columnConfig,
                                         pageable = true,
                                         pageSize = 10
                                     }: UseUniwersalTableProps<T>) {

    // Stan dla danych
    const [data, setData] = useState<T[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Stan dla paginacji
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });

    // Ile jest wszystkich stron
    const [pageCount, setPageCount] = useState(0);

    // Pobieranie danych gdy zmienia się strona lub wyszukiwanie
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Pobieramy dane z backendu
                const response = await fetchData(searchQuery, pagination.pageIndex);

                // Ustawiamy dane z content
                setData(response.content);

                // Ustawiamy ilość stron z odpowiedzi
                setPageCount(response.totalPages);

            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
                setData([]);
                setPageCount(0);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [searchQuery, pagination.pageIndex]); // Reaguj na zmiany strony i wyszukiwania

    // Konfiguracja tabeli
    const table = useReactTable({
        data,
        columns: columnConfig,
        pageCount, // Ile jest stron
        state: {
            pagination, // Stan paginacji
        },
        onPaginationChange: setPagination, // Funkcja do zmiany strony
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true, // WAŻNE: Mówimy React Table że sami zarządzamy paginacją
    });

    return {
        table,
        setSearchQuery,
        searchQuery,
        loading,
    };
}