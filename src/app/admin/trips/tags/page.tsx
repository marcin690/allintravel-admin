"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from "@/utils/auth";
import { toast } from 'react-toastify';

import TagsTable from './components/TagsTable';
import TagModal from './components/TagModal';
import {useSearchParams} from "next/navigation";

export interface TagDTO {
    id?: number;
    name: string;
    slug?: string;
    adminComment?: string;
    showOnHomepage?: boolean;
    isTechnical?: boolean;
    description?: string;
    showOnProductPage?: boolean;
    tripType?: string;
    sortOrder?: number;
}

export default function TagsPage() {
    const [selectedType, setSelectedType] = useState<string>('');
    const searchParams = useSearchParams(); // DODAJ
    const editId = searchParams.get('editId'); // DODAJ
    const [tags, setTags] = useState<TagDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<TagDTO | null>(null);


    const fetchTags = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = selectedType
                ? `/tags/by-trip-type?tripType=${selectedType}`
                : '/tags/by-trip-type';

            const res = await apiFetch(url);
            const json = await res.json();
            setTags(Array.isArray(json) ? json : []);
        } catch (error) {
            toast.error('Nie udało się pobrać tagów.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedType]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        if (editId) {
            // Otwórz modal z tagiem do edycji
            loadAndEditTag(parseInt(editId));
        }
    }, [editId]);

    const loadAndEditTag = async (tagId: number) => {
        try {
            const res = await apiFetch(`/tags/${tagId}`);
            if (res.ok) {
                const tagData = await res.json();
                setEditingTag(tagData);
                setIsModalOpen(true);
            } else {
                toast.error('Nie znaleziono taga do edycji');
            }
        } catch (error) {
            toast.error('Błąd podczas ładowania taga');
            console.error(error);
        }
    };


    const handleOpenModal = async (tag: TagDTO | null = null) => {
        if (tag) {
            const res = await apiFetch(`/tags/${tag.id}`);
            const full = await res.json();
            setEditingTag(full);
        } else {
            setEditingTag(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTag(null);

        if (editId) {
            window.history.replaceState({}, '', '/admin/trips/tag');
        }
    };

    const handleFormSubmit = async (tagData: TagDTO) => {
        try {
            if (editingTag) {
                await apiFetch(`/tags/admin/${editingTag.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tagData),
                });
                toast.success('Tag zaktualizowany pomyślnie!');
            } else {
                await apiFetch('/tags/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tagData),
                });
                toast.success('Tag dodany pomyślnie!');
            }
            handleCloseModal();
            fetchTags();
        } catch (error: any) {
            toast.error(`Błąd: ${error.message || 'Nie udało się zapisać taga.'}`);
        }
    };

    const handleDelete = async (tagId: number) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten tag? Usunięcie nie będzie możliwe, jeśli są do niego przypisane wycieczki.')) {
            try {
                await apiFetch(`/tags/admin/${tagId}`, { method: 'DELETE' });
                toast.success('Tag usunięty!');
                fetchTags();
            } catch (error: any) {
                toast.error(`Błąd: ${error.message || 'Nie udało się usunąć taga.'}`);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Zarządzanie Tagami</h1>

                <div className="flex items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">Wszystkie typy</option>
                        <option value="INDIVIDUAL">Indywidualne</option>
                        <option value="SCHOOL">Szkolne</option>
                        <option value="SENIOR">Dla seniorów</option>
                        <option value="PILGRIMAGE">Pielgrzymki</option>
                        <option value="CORPORATE">Firmowe</option>
                    </select>

                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
                    >
                        Dodaj tag
                    </button>
                </div>
            </div>

            <div className="border rounded-lg p-4 bg-white shadow">
                {isLoading ? (
                    <p>Ładowanie...</p>
                ) : (
                    <TagsTable
                        tags={tags}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {isModalOpen && (
                <TagModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleFormSubmit}
                    initialData={editingTag}
                />
            )}
        </div>
    );
}