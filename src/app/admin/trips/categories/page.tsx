"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from "@/utils/auth";
import { toast } from 'react-toastify';
import { PlusCircleIcon } from 'lucide-react';
import CategoryTreeTable from './components/CategoryTreeTable';
import CategoryModal from './components/CategoryModal';
import { CategoryDTO } from '@/app/shared/types/category.types'; // Musisz zdefiniować ten typ

// Definicja typu DTO w pliku types/category.types.ts
/*
export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  tripType: string;
  parentId: number | null;
  order: number | null;
  children: CategoryDTO[];
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  iconUrl?: string;
}
*/

export default function CategoriesPage() {
    const [selectedType, setSelectedType] = useState('INDIVIDUAL'); // Domyślny typ
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

    const fetchCategories = useCallback(async () => {
        if (!selectedType) return;
        setIsLoading(true);
        try {
            const res = await apiFetch(`/categories/by-type/${selectedType}?showChildren=1`);
            const json = await res.json();

            const list = Array.isArray(json) ? json : json?.content ?? [];
            setCategories(list);
        } catch (error) {
            toast.error('Nie udało się pobrać kategorii.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedType]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenModal = async (category: CategoryDTO | null = null) => {
        if (category) {
            // dociągnij pełne dane z backendu (pewne imageUrl/iconUrl)
            const res = await apiFetch(`/categories/${category.id}`);
            const full = await res.json();
            setEditingCategory(full);
        } else {
            setEditingCategory(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleFormSubmit = async (formData: FormData) => {
        try {
            if (editingCategory) {
                // Edycja
                await apiFetch(`/categories/admin/${editingCategory.id}`, {
                    method: 'PATCH',
                    body: formData,
                });
                toast.success('Kategoria zaktualizowana pomyślnie!');
            } else {
                // Tworzenie
                await apiFetch('/categories/admin', {
                    method: 'POST',
                    body: formData,
                });
                toast.success('Kategoria dodana pomyślnie!');
            }
            handleCloseModal();
            fetchCategories(); // Odśwież listę
        } catch (error: any) {
            toast.error(`Błąd: ${error.message || 'Nie udało się zapisać kategorii.'}`);
        }
    };

    const handleDelete = async (categoryId: number) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę kategorię? Usunięcie nie będzie możliwe, jeśli są do niej przypisane wycieczki.')) {
            try {
                await apiFetch(`/categories/admin/${categoryId}`, { method: 'DELETE' });
                toast.success('Kategoria usunięta!');
                fetchCategories(); // Odśwież listę
            } catch (error: any) {
                toast.error(`Błąd: ${error.message || 'Nie udało się usunąć kategorii.'}`);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Zarządzanie Kategoriami</h1>

                <div className="flex items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
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
                        <PlusCircleIcon size={18} />
                        Dodaj kategorię
                    </button>
                </div>
            </div>

            <div className="border rounded-lg p-4 bg-white shadow">
                {isLoading ? (
                    <p>Ładowanie...</p>
                ) : (
                    <CategoryTreeTable
                        categories={categories}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {isModalOpen && (
                <CategoryModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleFormSubmit}
                    initialData={editingCategory}
                    tripType={selectedType}
                />
            )}
        </div>
    );
}