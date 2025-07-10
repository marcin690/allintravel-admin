"use client"

import {useUniversalTable} from "@/hooks/useUniwersalTable";
import {flexRender} from "@tanstack/react-table";

interface UniversalTableProps<T> {
    fetchData: (query: string, page: number) => Promise<T[]>;
    columns: any
    pageable?: boolean;
    searchable?: boolean;
    pageSize?: number;
}

export default function UniversalTable<T>({
                                              fetchData,
                                              columns,
                                              pageable = true,
                                              searchable = true,
                                              pageSize = 25
                                          }: UniversalTableProps<T>) {

    const {table, searchQuery, setSearchQuery} = useUniversalTable({
        fetchData,
        columnConfig: columns,
        pageable,
        pageSize,

    })

    return (
        <div className="space-y-4">
            {searchable && (
                <input
                    className="border p-2 w-full"
                    type="text"
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            )}

            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-left shadow">
                <thead className="bg-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300"
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                className="p-4 text-sm text-gray-800 whitespace-nowrap border-b border-gray-200"
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {pageable && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Poprzednia
                    </button>
                    <span>
            Strona {table.getState().pagination.pageIndex + 1}
          </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Następna
                    </button>
                </div>
            )}
        </div>
    );

}