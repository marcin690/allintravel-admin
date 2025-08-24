'use client';

import React from 'react';
import { TermDTO, VOIVODESHIPS, PARTICIPANT_BRACKETS } from '@/app/shared/types/tripe.types';


type Props = {
    term: TermDTO;
    termIndex: number;
    onTermChange: (index: number, updated: TermDTO) => void;
    onRemoveTerm: (index: number) => void;
    inputClassName: string;
};

// 💡 Helper: upewnia strukturę dla danego bracketu
function ensureBracket(term: TermDTO, idx: number | null) {
    if (!term.brackets) term.brackets = [];
    if (!term.brackets[idx]) {
        term.brackets[idx] = {
            minParticipants: String(PARTICIPANT_BRACKETS[idx]?.min ?? 0) as any,
            freeSpotsPerBooking: 0,
            prices: VOIVODESHIPS.map(v => ({
                voivodeship: v.value,
                pricePerPerson: undefined as unknown as number,
            })),
        } as any;
    }
    if (!term.brackets[idx].prices) {
        term.brackets[idx].prices = VOIVODESHIPS.map(v => ({
            voivodeship: v.value,
            pricePerPerson: undefined as unknown as number,
        }));
    }
    return term.brackets[idx];
}

const GroupTermPricingEditor: React.FC<Props> = ({
                                                     term,
                                                     termIndex,
                                                     onTermChange,
                                                     onRemoveTerm,
                                                     inputClassName,
                                                 }) => {
    const tableInputClassName =
        'w-full p-1.5 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const [copyPrice, setCopyPrice] = React.useState('');
    // Zmiana ceny w komórce tabeli
    function handlePriceChange(bracketIndex: number, voivodeship: string, next: string) {
        const updated: TermDTO = { ...term, brackets: [...(term.brackets ?? [])] };
        const bracket = ensureBracket(updated, bracketIndex);
        const priceRow = bracket.prices.find(p => p.voivodeship === voivodeship);
        if (priceRow) {
            priceRow.pricePerPerson = next === '' ? (undefined as any) : parseFloat(next);
        }
        onTermChange(termIndex, updated);
    }

    // Zmiana pól bracketu (gratisy / minParticipants)
    function handleBracketField(
        bracketIndex: number,
        field: 'minParticipants' | 'freeSpotsPerBooking',
        value: string,
    ) {
        const updated: TermDTO = { ...term, brackets: [...(term.brackets ?? [])] };
        const bracket = ensureBracket(updated, bracketIndex);
        if (field === 'minParticipants') {
            // backend chce stringi '25' | '45' | '60' → trzymamy string
            bracket.minParticipants = (value === '' ? '' : String(parseInt(value, 10))) as any;
        } else {
            bracket.freeSpotsPerBooking = value === '' ? (undefined as any) : parseInt(value, 10);
        }
        onTermChange(termIndex, updated);
    }

    function handlePriceChanger(bracketIndex: null | number, voivodeship: string, next: string) {
        const updated: TermDTO = {...term, brackets: [...(term.brackets ?? [])]};
        const bracket = ensureBracket(updated, bracketIndex);
        const priceRow = bracket.prices.find(p => p.voivodeship === voivodeship);
        if (priceRow) {
            priceRow.pricePerPerson = next === '' ? (undefined as any) : parseFloat(next);
        }

        onTermChange(termIndex, updated);

    }

    function handleCopyPrice(copyPrice: string) {
        const updated: TermDTO = { ...term, brackets: [...(term.brackets ?? [])] };
        updated.brackets = updated.brackets.map(bracket => {
            bracket.prices = bracket.prices.map(price => ({
                ...price,
                pricePerPerson: copyPrice === '' ? (undefined as any) : parseFloat(copyPrice),
            }));
            return bracket;
        });
        onTermChange(termIndex, updated);
    }


    // Zmiany pól terminu (daty/pojemność)
    function handleTermDetailsChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        const updated: TermDTO = { ...term, [name]: name === 'totalCapacity' ? parseInt(value, 10) : value } as any;
        onTermChange(termIndex, updated);
    }

    return (
        <div className="border p-4 rounded-md space-y-4 relative bg-white shadow-sm">
            <button
                type="button"
                onClick={() => onRemoveTerm(termIndex)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
                aria-label="Usuń termin"
            >
                &times;
            </button>
            <div className="flex justify-between items-center">
                <h6 className="font-semibold text-md text-gray-800">Termin #{termIndex + 1}</h6>
                <div className="flex flex-row items-center justify-stretch">
                    <div>
                        <label className="block text-xs mb-1.5">Cena do skopiowania</label>
                        <input
                            type="number"
                            name="copyPriceInput"
                            value={copyPrice}
                            onChange={e => setCopyPrice(e.target.value)}
                            className={`${inputClassName} text-xs w-100`}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => handleCopyPrice(copyPrice)}
                            className="justify-stretch ml-2 py-1 px-2 rounded bg-gray-500 text-white"
                        >
                            Kopiuj
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm mb-1.5">Data od</label>
                    <input
                        type="date"
                        name="startDate"
                        value={term.startDate ?? ''}
                        onChange={handleTermDetailsChange}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1.5">Data do</label>
                    <input
                        type="date"
                        name="endDate"
                        value={term.endDate ?? ''}
                        onChange={handleTermDetailsChange}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1.5">Pojemność</label>
                    <input
                        type="number"
                        name="totalCapacity"
                        value={term.totalCapacity ?? 0}
                        onChange={handleTermDetailsChange}
                        className={inputClassName}
                    />
                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Województwo
                        </th>
                        {PARTICIPANT_BRACKETS.map((b, i) => (
                            <th key={b.min} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {b.label}
                                <label>
                                    <span className="block text-xs mt-1">Liczba gratisów</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Gratisy"
                                    value={term.brackets?.[i]?.freeSpotsPerBooking ?? ''}
                                    onChange={e => handleBracketField(i, 'freeSpotsPerBooking', e.target.value)}
                                    className={tableInputClassName + ' mt-1'}
                                    title="Liczba miejsc gratis (opiekunowie)"
                                />
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {VOIVODESHIPS.map(v => (
                        <tr key={v.value} className="hover:bg-gray-50">

                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{v.label}</td>
                            {PARTICIPANT_BRACKETS.map((b, i) => {
                                const price = term.brackets?.[i]?.prices?.find(p => p.voivodeship === v.value);
                                return (
                                    <td key={`${v.value}-${b.min}`} className="px-4 py-3 whitespace-nowrap">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Cena"
                                            value={price?.pricePerPerson ?? ''}
                                            onChange={e => handlePriceChange(i, v.value, e.target.value)}
                                            className={tableInputClassName}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupTermPricingEditor;
