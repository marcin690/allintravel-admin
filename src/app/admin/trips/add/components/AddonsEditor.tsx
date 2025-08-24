import React from 'react';
import { AddonDTO } from '@/app/shared/types/tripe.types';

interface AddonsEditorProps {
    value: AddonDTO[];
    onChange: (addons: AddonDTO[]) => void;
    inputClassName?: string;
}

const AddonsEditor: React.FC<AddonsEditorProps> = ({
                                                       value,
                                                       onChange,
                                                       inputClassName = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                   }) => {
    const addAddon = () => {
        const newAddon: AddonDTO = {
            name: '',
            price: 0,
            description: '',
            active: true
        };
        onChange([...value, newAddon]);
    };

    const removeAddon = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const updateAddon = (index: number, field: keyof AddonDTO, val: string | number | boolean) => {
        const updated = value.map((addon, i) => {
            if (i === index) {
                return { ...addon, [field]: val };
            }
            return addon;
        });
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h6 className="font-medium">Dodatki do wycieczki</h6>
                <button
                    type="button"
                    onClick={addAddon}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    + Dodaj dodatek
                </button>
            </div>

            {value.length === 0 && (
                <p className="text-sm text-gray-500 italic">Brak dodatków. Kliknij "Dodaj dodatek" aby dodać pierwszy.</p>
            )}

            {value.map((addon, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 border p-4 rounded-md relative">
                    <button
                        type="button"
                        onClick={() => removeAddon(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                    >
                        ×
                    </button>

                    <div className="col">
                        <label className="block text-xs mb-1 text-gray-600">Nazwa dodatku</label>
                        <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => updateAddon(index, 'name', e.target.value)}
                            placeholder="np. Ubezpieczenie turystyczne"
                            className={inputClassName}
                            required
                        />
                    </div>

                    <div className="col">
                        <label className="block text-xs mb-1 text-gray-600">Cena (PLN)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={addon.price}
                            onChange={(e) => updateAddon(index, 'price', Number(e.target.value))}
                            className={inputClassName}
                            required
                        />
                    </div>

                    <div className="col">
                        <label className="block text-xs mb-1 text-gray-600">Opis (opcjonalny)</label>
                        <input
                            type="text"
                            value={addon.description || ''}
                            onChange={(e) => updateAddon(index, 'description', e.target.value)}
                            placeholder="np. Pełne ubezpieczenie na czas podróży"
                            className={inputClassName}
                        />
                    </div>


                </div>
            ))}
        </div>
    );
};

export default AddonsEditor;