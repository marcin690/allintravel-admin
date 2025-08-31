"use client";

import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
} from '@tanstack/react-table'
import {useEffect, useState} from "react";

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

interface UseUniversalTableProps<T> {
    initialData?: T[];
    fetchData?: (query: string, page: number) => Promise<PageResponse<T>>;
    columnConfig: ColumnDef<T, any>[];
    pageable?: boolean;
    pageSize?: number;
}

export function useUniversalTable<T>({
                                         initialData,
                                         fetchData,
                                         columnConfig,
                                         pageable = true,
                                         pageSize = 10
                                     }: UseUniversalTableProps<T>) {

    // Używamy `initialData` tylko do JEDNORAZOWEJ inicjalizacji stanu
    const [data, setData] = useState<T[]>(initialData || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(!initialData); // Ładowanie jest true, jeśli nie ma danych początkowych
    const [pageCount, setPageCount] = useState(0);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });

    // Ten useEffect obsługuje TYLKO tryb "Fetch"
    useEffect(() => {
        // Jeśli nie ma funkcji `fetchData`, to jesteśmy w trybie statycznym - nie rób nic.
        if (!fetchData) {
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchData(searchQuery, pagination.pageIndex);
                setData(response.content);
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
    }, [fetchData, searchQuery, pagination.pageIndex]); // Usunęliśmy `initialData` z zależności

    // Ten useEffect obsługuje TYLKO tryb "Data" (statyczny)
    useEffect(() => {
        // Jeśli nie przekazano `initialData` lub jest funkcja `fetchData`, nie rób nic.
        if (!initialData || fetchData) {
            return;
        }
        setData(initialData);
        setPageCount(Math.ceil((initialData.length || 0) / pageSize));

    }, [initialData, pageSize, fetchData]);

    const table = useReactTable({
        data,
        columns: columnConfig,
        pageCount,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: !!fetchData,
    });

    return { table, setSearchQuery, searchQuery, loading };
}