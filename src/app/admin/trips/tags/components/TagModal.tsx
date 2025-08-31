import React, { useState, useEffect } from 'react';
import {TagDTO} from "@/app/admin/trips/tags/page";

interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (tagData: TagDTO) => void;
    initialData: TagDTO | null;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [adminComment, setAdminComment] = useState('');
    const [showOnHomepage, setShowOnHomepage] = useState(false);
    const [isTechnical, setIsTechnical] = useState(false);
    const [tripType, setTripType] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [showOnProductPage,setShowOnProductPage] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setAdminComment(initialData.adminComment || '');
            setShowOnHomepage(initialData.showOnHomepage || false);
            setIsTechnical(initialData.isTechnical || false);
            setTripType(initialData.tripType || '');
            setShowOnProductPage(initialData.showOnProductPage || false);
            setSortOrder(initialData.sortOrder || 0);
        } else {
            // Reset dla nowego taga
            setName('');
            setDescription('');
            setAdminComment('');
            setShowOnHomepage(false);
            setIsTechnical(false);
            setTripType('');
            setShowOnProductPage(false);
            setSortOrder(0);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const tagData: TagDTO = {
            name,
            description,
            adminComment,
            showOnHomepage,
            isTechnical,
            showOnProductPage,
            tripType: tripType || undefined,
            sortOrder
        };

        onSubmit(tagData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {initialData ? 'Edytuj tag' : 'Dodaj nowy tag'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nazwa</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Typ wycieczki</label>
                        <select
                            value={tripType}
                            onChange={(e) => setTripType(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">-- Brak (wszystkie typy) --</option>
                            <option value="INDIVIDUAL">Indywidualne</option>
                            <option value="SCHOOL">Szkolne</option>
                            <option value="SENIOR">Dla seniorów</option>
                            <option value="PILGRIMAGE">Pielgrzymki</option>
                            <option value="CORPORATE">Firmowe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kolejność sortowania</label>
                        <input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Opis publiczny</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Opis widoczny dla użytkowników..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Komentarz dla admina</label>
                        <textarea
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            rows={2}
                            placeholder="Notatki wewnętrzne, niewidoczne dla użytkowników..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div className="space-y-2 border-t pt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showOnHomepage}
                                onChange={(e) => setShowOnHomepage(e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Wyświetlaj na stronie głównej
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isTechnical}
                                onChange={(e) => setIsTechnical(e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Tag techniczny (ukryty dla użytkowników)
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showOnProductPage}
                                onChange={(e) => setShowOnProductPage(e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Wyświetlaj na stronie produktu
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Zapisz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TagModal;