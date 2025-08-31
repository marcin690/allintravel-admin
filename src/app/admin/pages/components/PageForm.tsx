// components/PageForm.tsx
"use client"

import React, { useState, useEffect } from 'react';

import ExtraFieldsEditor from '@/components/shared/extraFieldsEditor/ExtraFieldsEditor';
import { apiFetch } from '@/utils/auth';
import { toast } from 'react-toastify';
import RichTextEditor from "@/components/ui/RichTextEditor";

// Typy
type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface PageFormProps {
    pageId?: number;
    onSuccess: () => void;
    mode: 'create' | 'edit';
    initialData?: any;
}

// Klasy CSS
const inputClassName = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const textareaClassName = "w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

async function createPage(data: any, files: File[]) {
    try {
        const formData = new FormData();

        // DTO zgodne z ContentItemCreateUpdateDTO
        const dto = {
            title: data.title,
            type: data.type,
            status: data.status,
            content: data.content,
            contentType: 'PAGE',
            contentStatus: data.status,
            sortOrder: parseInt(data.sortOrder) || 0,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            extraFields: data.extraFields,

        };

        // Dodaj DTO jako JSON blob
        formData.append('dto', new Blob([JSON.stringify(dto)], {
            type: 'application/json'
        }));

        // Dodaj pliki
        files.forEach(file => {
            formData.append('files', file);
        });

        // Wyślij - apiFetch automatycznie NIE doda Content-Type dla FormData
        const response = await apiFetch('/content', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Nie udało się utworzyć strony');
        }

        const result = await response.json();
        toast.success('Strona została utworzona!');
        return result;

    } catch (error: any) {
        toast.error(error.message || 'Błąd tworzenia strony');
        throw error;
    }
}

const sanitizeExtraFieldsForUpload = (fields: any[]) => {
    // Tworzymy głęboką kopię, aby nie modyfikować stanu komponentu!
    const cleanedFields = JSON.parse(JSON.stringify(fields));

    const recursiveClean = (field: any) => {
        if (field._file) {
            delete field._file;
        }
        if (field.rows) {
            field.rows.forEach((row: any[]) => row.forEach(recursiveClean));
        }
    };

    cleanedFields.forEach(recursiveClean);
    return cleanedFields;
};

async function updatePage(id: number, data: any, files: File[]) {
    try {
        const formData = new FormData();

        const dto = {
            title: data.title,
            type: 'PAGE' as 'PAGE' | 'POST',
            status: data.status,
            content: data.content,
            contentType: 'PAGE',
            contentStatus: data.status,
            sortOrder: parseInt(data.sortOrder) || 0,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            extraFields: data.extraFields,
        };

        formData.append('dto', new Blob([JSON.stringify(dto)], {
            type: 'application/json'
        }));

        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await apiFetch(`/content/admin/${id}`, {
            method: 'PATCH',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Nie udało się zaktualizować strony');
        }

        const result = await response.json();
        toast.success('Strona została zaktualizowana!');
        return result;

    } catch (error: any) {
        toast.error(error.message || 'Błąd aktualizacji strony');
        throw error;
    }
}

// ===== KOMPONENT =====
export default function PageForm({ pageId, onSuccess, mode, initialData }: PageFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'PAGE' as const,
        status: 'DRAFT' as ContentStatus,
        content: '',
        sortOrder: 0,
        metaTitle: '',
        metaDescription: '',
        extraFields: []
    });

    const [loading, setLoading] = useState(mode === 'edit' && !initialData);
    const [saving, setSaving] = useState(false);

    // Ładowanie danych (jeśli edycja)
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                title: initialData.title || '',
                type: initialData.type || 'PAGE', // Ustaw domyślny, jeśli brak
                status: initialData.status || 'DRAFT',
                content: initialData.content || '',
                sortOrder: initialData.sortOrder || 0,
                // Użyj `initialData` bezpośrednio, bo to dane z DTO
                metaTitle: initialData.metaTitle || '',
                metaDescription: initialData.metaDescription || '',
                extraFields: initialData.extraFields || []
            });
            setLoading(false); // Wyłącz ładowanie, gdy dane są ustawione
        }
    }, [initialData, mode]);

    // Obsługa zmian
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa Extra Fields
    const handleExtraFieldsChange = (newFields: any[]) => {
        setFormData(prev => ({
            ...prev,
            extraFields: newFields
        }));
    };

    // Zbieranie plików z Extra Fields
    const collectFiles = () => {
        const files: File[] = [];

        const processField = (field: any) => {
            if (field.type === 'IMAGE' && field._file) {
                files.push(field._file);
            }
            if (field.type === 'REPEATER' && field.rows) {
                field.rows.forEach((row: any[]) => {
                    row.forEach(processField);
                });
            }
        };

        formData.extraFields.forEach(processField);
        return files;
    };

    // Zapis
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Walidacja
        if (!formData.title.trim()) {
            toast.error('Tytuł jest wymagany');
            return;
        }



        setSaving(true);

        try {
            const files = collectFiles();
            const sanitizedExtraFields = sanitizeExtraFieldsForUpload(formData.extraFields);
            const dataForApi = {
                ...formData,
                extraFields: sanitizedExtraFields,
            };

            if (mode === 'create') {
                await createPage(dataForApi, files);
            } else if (pageId) {
                await updatePage(pageId, dataForApi, files);
            }

            onSuccess();

        } catch (err: any) {
            // Toast już pokazany w funkcjach API
            console.error('Błąd:', err);
        } finally {
            setSaving(false);
        }
    };

    // Ładowanie
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-gray-600">Ładowanie...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-6">

                {/* SEKCJA 1: Podstawowe */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Podstawowe informacje</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tytuł *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="np. O nas"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Typ treści *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={inputClassName}
                            >
                                <option value="PAGE">Strona</option>
                                <option value="POST">Post</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={inputClassName}
                            >
                                <option value="DRAFT">Szkic</option>
                                <option value="PUBLISHED">Opublikowany</option>
                                <option value="ARCHIVED">Zarchiwizowany</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kolejność sortowania
                            </label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Treść strony
                        </label>
                        <RichTextEditor
                            value={formData.content}
                            onChange={handleChange}
                        />

                    </div>
                </div>

                {/* SEKCJA 2: SEO */}
                <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">SEO</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meta tytuł (max 70 znaków)
                            </label>
                            <input
                                type="text"
                                name="metaTitle"
                                value={formData.metaTitle}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="Tytuł strony w Google"
                                maxLength={70}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.metaTitle.length}/70 znaków
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meta opis (max 160 znaków)
                            </label>
                            <textarea
                                name="metaDescription"
                                value={formData.metaDescription}
                                onChange={handleChange}
                                rows={3}
                                className={textareaClassName}
                                placeholder="Opis strony w wynikach wyszukiwania"
                                maxLength={160}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.metaDescription.length}/160 znaków
                            </p>
                        </div>
                    </div>
                </div>

                {/* SEKCJA 3: Extra Fields */}
                <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Pola dodatkowe (ACF)</h2>

                    <ExtraFieldsEditor
                        value={formData.extraFields}
                        onChange={handleExtraFieldsChange}
                        title="Zarządzaj polami dodatkowymi"
                    />
                </div>

                {/* Przyciski */}
                <div className="border-t pt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={saving}
                    >
                        Anuluj
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Zapisywanie...
                            </>
                        ) : (
                            <>

                                {mode === 'create' ? 'Utwórz' : 'Zapisz zmiany'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}