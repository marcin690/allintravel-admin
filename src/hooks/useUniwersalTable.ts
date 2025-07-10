"use client";

import {
ColumnDef,
useReactTable,
getCoreRowModel,
getPaginationRowModel,
} from '@tanstack/react-table'

import {useEffect, useState} from "react";



interface UseUniwersalTableProps<T> {
    fetchData: (query: string, page: number) => Promise<T>;
    columnConfig: ColumnDef<T, any>[];
    pageable?: boolean;
    pageSize?: number;
}

export function useUniversalTable<T>({
    fetchData,
    columnConfig,
    pageable = true,
    pageSize = 25
}: UseUniwersalTableProps<T>)  {
    const [data, setData] = useState<T[]>([])
    const [searchQuery, setSearchQuery] = useState('');
    const [pageIndex, setPageIndex] = useState(0);

    const table = useReactTable({
        data,
        columns: columnConfig,
        getCoreRowModel: getCoreRowModel(),
        ...(pageable? {getPaginationRowModel: getPaginationRowModel()} : {}),
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: pageSize
            }
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === 'function'? updater({pageIndex, pageSize}) : updater
            setPageIndex(next.pageIndex)
        }
    })

    useEffect(() => {
        fetchData(searchQuery, pageIndex).then(setData);
    }, [searchQuery, pageIndex])

    return {table, setSearchQuery, searchQuery}

}
