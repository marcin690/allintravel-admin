"use client"

import {apiFetch} from "@/utils/auth";
import React, {useState} from "react";
import {toast} from "react-toastify";
import Link from "next/link";
import {AiFillDelete} from "react-icons/ai";
import {BiPencil} from "react-icons/bi";
import {ColumnDef} from "@tanstack/react-table";
import UniversalTable from "@/components/ui/UniversalTable";

type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PageItem = {
    id: number;
    title: string;
    slug: string;
    status: ContentStatus;
    updatedAt: string;
    sortOrder: number;
};

export default function PagesListPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [contentType, setContentType] = useState<'PAGE' | 'POST'>('PAGE');
    type TableResult<T> = {
        rows: T[];
        pageCount: number;
        total: number;
    };

    const createFetchPages = (type: 'PAGE' | 'POST') => {
        return async (
            query: string,
            page: number,
            pageSize: number = 25
        ): Promise<TableResult<PageItem>> => {
            try {
                const params = new URLSearchParams({
                    type,
                    page: String(page),     // Spring pageable: 0-based
                    size: String(pageSize),
                });
                if (query) params.append("search", query);

                const response = await apiFetch(`/content/admin?${params}`);
                if (!response.ok) {
                    toast.error("Błąd pobierania stron");
                    return { rows: [], pageCount: 0, total: 0 };
                }

                const data = await response.json();
                return data; // Zwróć cały obiekt odpowiedzi
            } catch (e) {
                console.error(e);
                toast.error("Nie udało się pobrać listy stron");
                return { rows: [], pageCount: 0, total: 0 };
            }
        };
    };



    const handleDelete = async (id: number) => {
        if (!confirm("Czy na pewno chcesz usunąć tę stronę?")) return;
        try {
            const response = await apiFetch(`/content/admin/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                toast.error('Nie udało się usunąć');
                return;
            }

            toast.success('Strona usunięta pomyślnie');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            toast.error('Nie udało się usunąć');
            console.error(err);
        }
    }

    const getStatusBadge = (status: ContentStatus) => {
        const config = {
            'PUBLISHED': {
                class: 'bg-green-100 text-green-800',
                label: 'Opublikowany'
            },
            'DRAFT': {
                class: 'bg-yellow-100 text-yellow-800',
                label: 'Szkic'
            },
            'ARCHIVED': {
                class: 'bg-gray-100 text-gray-800',
                label: 'Archiwum'
            }
        };

        const { class: className, label } = config[status] || config.DRAFT;

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                {label}
            </span>
        );
    };

    const columns: ColumnDef<PageItem>[] = [
        {
            header: 'Tytuł',
            accessorKey: 'title',
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">
                    {row.original.title}
                </div>
            ),
        },
        {
            header: 'Slug',
            accessorKey: 'slug',
            cell: ({ row }) => (
                <div className="text-gray-500">
                    <span className="text-xs text-gray-400">/</span>
                    {row.original.slug}
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            header: 'Kolejność',
            accessorKey: 'sortOrder',
            cell: ({ row }) => (
                <div className="text-center text-gray-500">
                    {row.original.sortOrder || 0}
                </div>
            ),
        },
        {
            header: 'Ostatnia zmiana',
            accessorKey: 'updatedAt',
            cell: ({ row }) => (
                <div className="text-gray-500 text-sm">
                    {row.original.updatedAt
                        ? new Date(row.original.updatedAt).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })
                        : '-'
                    }
                </div>
            ),
        },
        {
            header: 'Akcje',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Link
                        href={`/admin/pages/edit/${row.original.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edytuj"
                    >
                        <BiPencil className="cursor-pointer hover:text-blue-600" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Usuń"
                    >
                        <AiFillDelete className="cursor-pointer hover:text-red-600" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Lista stron / wpisów</h1>

                <div className="flex items-center gap-3">
                    <select
                        value={contentType}
                        onChange={(e) => {
                            setContentType(e.target.value as 'PAGE' | 'POST');
                            setRefreshKey(prev => prev + 1);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                    >
                        <option value="PAGE">Strony</option>
                        <option value="POST">Wpisy blogowe</option>
                    </select>

                    <Link
                        href={contentType === 'PAGE' ? '/admin/pagesAd/add' : '/admin/pages/add'}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Dodaj {contentType === 'PAGE' ? 'stronę' : 'wpis'}
                    </Link>
                </div>
            </div>

            <div className="">
                <UniversalTable
                    key={`${refreshKey}-${contentType}`}
                    fetchData={createFetchPages(contentType)}
                    columns={columns}
                    pageable={true}
                    searchable={true}
                    pageSize={25}
                />
            </div>
        </div>
    );
}