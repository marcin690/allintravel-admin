'use client';

import React from 'react';
import { AvailableDateDTO } from '@/app/shared/types/trip.types';

interface AvailableDatesTableProps {
    dates: AvailableDateDTO[];
    add: () => void;
    remove: (index: number) => void;
    onChange: (
        index: number,
        field: keyof AvailableDateDTO,
        value: string | number
    ) => void;
}

const AvailableDatesTable: React.FC<AvailableDatesTableProps> = ({
                                                                     dates,
                                                                     add,
                                                                     remove,
                                                                     onChange
                                                                 }) => {
    return (
        <div className="overflow-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Od</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Do</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pojemność</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {dates.map((date, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            <input
                                type="date"
                                value={date.startDate}
                                onChange={e => onChange(idx, 'startDate', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            <input
                                type="date"
                                value={date.endDate}
                                onChange={e => onChange(idx, 'endDate', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            <select
                                value={date.status}
                                onChange={e => onChange(idx, 'status', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="AVAILABLE">Dostępny</option>
                                <option value="BOOKED">Zarezerwowany</option>
                                <option value="CANCELLED">Anulowany</option>
                            </select>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            <input
                                type="number"
                                value={date.totalCapacity}
                                onChange={e => onChange(idx, 'totalCapacity', Number(e.target.value))}
                                className="w-24 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            <input
                                type="number"
                                step="0.01"
                                value={date.price ?? ''}
                                onChange={e => onChange(idx, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-28 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                            <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Usuń
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="p-4">
                <button
                    type="button"
                    onClick={add}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Dodaj termin
                </button>
            </div>
        </div>
    );
};

export default AvailableDatesTable;
