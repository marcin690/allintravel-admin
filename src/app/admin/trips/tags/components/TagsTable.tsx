import React from 'react';
import { BiPencil } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';
import {TagDTO} from "@/app/admin/trips/tags/page";

interface TagsTableProps {
    tags: TagDTO[];
    onEdit: (tag: TagDTO) => void;
    onDelete: (id: number) => void;
}

const TagsTable: React.FC<TagsTableProps> = ({ tags, onEdit, onDelete }) => {
    const getTripTypeLabel = (type?: string) => {
        switch (type) {
            case 'INDIVIDUAL': return 'Indywidualne';
            case 'SCHOOL': return 'Szkolne';
            case 'SENIOR': return 'Dla seniorów';
            case 'PILGRIMAGE': return 'Pielgrzymki';
            case 'CORPORATE': return 'Firmowe';
            default: return '—';
        }
    };

    return (
        <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Nazwa</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Slug</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Typ wycieczki
                </th>
                <th className="p-4 text-sm font-medium text-gray-700 text-center border-b border-gray-300">Główna</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-center border-b border-gray-300">Produkt</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-center border-b border-gray-300">Techniczny</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Kolejność</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Akcje</th>
            </tr>
            </thead>
            <tbody>
            {tags.length > 0 ? (
                tags.map(tag => (
                    <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-800 border-b border-gray-200">
                            {tag.name}
                            {tag.adminComment && (
                                <span className="block text-xs text-gray-500 mt-1">
                                        {tag.adminComment}
                                    </span>
                            )}
                        </td>
                        <td className="p-4 text-sm text-gray-600 border-b border-gray-200">{tag.slug}</td>
                        <td className="p-4 text-sm text-gray-600 border-b border-gray-200">
                            {getTripTypeLabel(tag.tripType)}
                        </td>
                        <td className="p-4 text-sm text-center border-b border-gray-200">
                                <span className={tag.showOnHomepage ? "text-green-600" : "text-gray-400"}>
                                    {tag.showOnHomepage ? '✓' : '—'}
                                </span>
                        </td>
                        <td className="p-4 text-sm text-center border-b border-gray-200">
                                <span className={tag.showOnProductPage ? "text-green-600" : "text-gray-400"}>
                                    {tag.showOnProductPage ? '✓' : '—'}
                                </span>
                        </td>
                        <td className="p-4 text-sm text-center border-b border-gray-200">
                                <span className={tag.isTechnical ? "text-green-600" : "text-gray-400"}>
                                    {tag.isTechnical ? '✓' : '—'}
                                </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600 border-b border-gray-200">{tag.sortOrder}</td>
                        <td className="p-4 text-sm text-gray-800 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onEdit(tag)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <BiPencil size={18}/>
                                </button>
                                <button
                                    onClick={() => onDelete(tag.id!)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <AiFillDelete size={18}/>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={7} className="text-center p-4 text-gray-500">
                        Brak tagów dla wybranego typu.
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    );
};

export default TagsTable;