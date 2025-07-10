import React, { useState, useEffect } from 'react';
import { apiFetch } from "@/utils/auth";
import { CategoryDTO } from '@/app/shared/types/category.types';
import { getImageUrl } from "@/utils/getImageUrl";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    initialData: CategoryDTO | null;
    tripType: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSubmit, initialData, tripType }) => {
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<number | null>(null);
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [icon, setIcon] = useState<File | null>(null);

    // Ten stan i useEffect nie są już potrzebne przy renderowaniu warunkowym
    // const [showExisting, setShowExisting] = useState(false);
    // useEffect(() => {
    //     setShowExisting(!!initialData?.imageUrl);
    // }, [initialData]);

    const [parentOptions, setParentOptions] = useState<CategoryDTO[]>([]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setParentId(initialData.parentId);
            setMetaTitle(initialData.metaTitle || '');
            setMetaDescription(initialData.metaDescription || '');
        } else {
            // Resetuj formularz dla nowej kategorii
            setName('');
            setParentId(null);
            setMetaTitle('');
            setMetaDescription('');
            setImage(null);
            setIcon(null);
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (isOpen && tripType) {
            apiFetch(`/categories/parent-options?tripType=${tripType}`)
                .then(async (response) => {
                    const data = await response.json();
                    const filtered = initialData
                        ? data.filter((cat: CategoryDTO) => cat.id !== initialData.id)
                        : data;
                    setParentOptions(filtered);
                })
                .catch(err => {
                    console.error("Failed to fetch parent categories", err);
                    setParentOptions([]);
                });
        }
    }, [tripType, isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        const categoryData = {
            name,
            tripType,
            parentId: parentId === 0 ? null : parentId,
            metaTitle,
            metaDescription
        };

        formData.append('category', new Blob([JSON.stringify(categoryData)], { type: 'application/json' }));

        if (image) formData.append('image', image);
        if (icon) formData.append('icon', icon);

        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{initialData ? 'Edytuj kategorię' : 'Dodaj nową kategorię'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nazwa</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategoria nadrzędna</label>
                        <select value={parentId || 0} onChange={(e) => setParentId(Number(e.target.value) || null)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value={0}>-- Brak (kategoria główna) --</option>
                            {parentOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tytuł Meta (SEO)</label>
                        <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Opis Meta (SEO)</label>
                        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>


                    {initialData?.imageUrl && (
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">Istniejący obrazek</label>
                            <div className="mt-1">
                                <img
                                    src={getImageUrl(initialData.imageUrl)}
                                    alt="Podgląd"
                                    className="w-24 h-24 object-cover rounded-md border"
                                />
                            </div>
                        </div>
                    )}


                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {initialData?.imageUrl ? 'Zmień obrazek' : 'Dodaj obrazek'}
                        </label>
                        <input type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ikona</label>
                        <input type="file" onChange={(e) => setIcon(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Zapisz</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;