import React from 'react';
import {CategoryDTO} from '@/app/shared/types/trip.types';
import { BiPencil } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';

interface CategoryRowProps {
    category: CategoryDTO;
    level: number;
    onEdit: (category: CategoryDTO) => void;
    onDelete: (id: number) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, level, onEdit, onDelete }) => {
    const indentStyle = { paddingLeft: `${level * 2}rem` };

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm text-gray-800 border-b border-gray-200" style={indentStyle}>
                    {category.name}
                </td>
                <td className="p-4 text-sm text-gray-600 border-b border-gray-200">{category.slug}</td>
                <td className="p-4 text-sm text-gray-600 border-b border-gray-200">{category.order}</td>
                <td className="p-4 text-sm text-gray-800 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onEdit(category)} className="text-blue-600 hover:text-blue-800">
                            <BiPencil size={18}/>
                        </button>
                        <button onClick={() => onDelete(category.id)} className="text-red-600 hover:text-red-800">
                            <AiFillDelete size={18}/>
                        </button>
                    </div>
                </td>
            </tr>
            {category.children && category.children.length > 0 && (
                category.children.map(child => (
                    <CategoryRow
                        key={child.id}
                        category={child}
                        level={level + 1}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))
            )}
        </>
    );
};

interface CategoryTreeTableProps {
    categories: CategoryDTO[];
    onEdit: (category: CategoryDTO) => void;
    onDelete: (id: number) => void;
}

const CategoryTreeTable: React.FC<CategoryTreeTableProps> = ({ categories, onEdit, onDelete }) => {
    return (
        <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Nazwa</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Slug</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Kolejność</th>
                <th className="p-4 text-sm font-medium text-gray-700 text-left border-b border-gray-300">Akcje</th>
            </tr>
            </thead>
            <tbody>
            {categories.length > 0 ? (
                categories.map(category => (
                    <CategoryRow key={category.id} category={category} level={0} onEdit={onEdit} onDelete={onDelete} />
                ))
            ) : (
                <tr>
                    <td colSpan={3} className="text-center p-4 text-gray-500">Brak kategorii dla wybranego typu.</td>
                </tr>
            )}
            </tbody>
        </table>
    );
};

export default CategoryTreeTable;