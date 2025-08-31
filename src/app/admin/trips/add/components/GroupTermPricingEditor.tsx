'use client';

import React, { useEffect } from 'react';
import { TermDTO, VOIVODESHIPS, PARTICIPANT_BRACKETS } from '@/app/shared/types/tripe.types';

interface TermWithAvailability extends TermDTO {
    unavailableVoivodeships?: string[];
}

type Props = {
    term: TermWithAvailability;
    termIndex: number;
    onTermChange: (index: number, updated: TermDTO) => void;
    onRemoveTerm: (index: number) => void;
    inputClassName: string;
};

function ensureBracket(term: TermDTO, idx: number) {
    if (!term.brackets) term.brackets = [];
    while (term.brackets.length <= idx) {
        term.brackets.push({
            minParticipants: String(PARTICIPANT_BRACKETS[term.brackets.length]?.min ?? 0) as any,
            freeSpotsPerBooking: undefined,
            prices: VOIVODESHIPS.map(v => ({
                voivodeship: v.value,
                pricePerPerson: undefined as unknown as number,
            })),
        } as any);
    }
    if (!term.brackets[idx].prices || term.brackets[idx].prices.length === 0) {
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
        'w-full p-1.5 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';
    const [copyPrice, setCopyPrice] = React.useState('');





    useEffect(() => {
        if (!term.brackets || term.brackets.length === 0) return;

        const allPricesAreNull = term.brackets.every(bracket =>
            bracket.prices.every(p => p.pricePerPerson == null)
        );

        if (allPricesAreNull) {
            if (term.unavailableVoivodeships?.length) {
                onTermChange(termIndex, { ...term, unavailableVoivodeships: [] });
            }
            return;
        }

        const derivedUnavailable = VOIVODESHIPS
            .map(v => {
                const isUnavailable = term.brackets.every(bracket => {
                    const priceInfo = bracket.prices.find(p => p.voivodeship === v.value);
                    return priceInfo?.pricePerPerson == null;
                });
                return isUnavailable ? v.value : null;
            })
            .filter((v): v is string => v !== null);

        const currentUnavailable = term.unavailableVoivodeships || [];

        if (JSON.stringify(derivedUnavailable) !== JSON.stringify(currentUnavailable)) {
            onTermChange(termIndex, {
                ...term,
                unavailableVoivodeships: derivedUnavailable,
            });
        }
    }, [term.brackets, termIndex, onTermChange, term.unavailableVoivodeships]);

    function handlePriceChange(bracketIndex: number, voivodeship: string, next: string) {
        const updated: TermWithAvailability = JSON.parse(JSON.stringify(term));
        const bracket = ensureBracket(updated, bracketIndex);
        const priceRow = bracket.prices.find(p => p.voivodeship === voivodeship);
        if (priceRow) {
            priceRow.pricePerPerson = next === '' ? undefined : parseFloat(next);
        }
        onTermChange(termIndex, updated);
    }



    function handleBracketField(
        bracketIndex: number,
        field: 'minParticipants' | 'freeSpotsPerBooking',
        value: string,
    ) {
        const updated: TermWithAvailability = JSON.parse(JSON.stringify(term));
        const bracket = ensureBracket(updated, bracketIndex);
        if (field === 'minParticipants') {
            bracket.minParticipants = (value === '' ? '' : String(parseInt(value, 10))) as any;
        } else {
            bracket.freeSpotsPerBooking = value === '' ? undefined : parseInt(value, 10);
        }
        onTermChange(termIndex, updated);
    }

    // ======================= POPRAWIONA FUNKCJA =======================
    const handleAvailabilityChange = (voivodeshipValue: string, isUnavailable: boolean) => {
        const updated: TermWithAvailability = JSON.parse(JSON.stringify(term));

        if (!updated.unavailableVoivodeships) {
            updated.unavailableVoivodeships = [];
        }

        if (isUnavailable) {
            // Logika wyłączania - działała poprawnie
            if (!updated.unavailableVoivodeships.includes(voivodeshipValue)) {
                updated.unavailableVoivodeships.push(voivodeshipValue);
            }
            updated.brackets?.forEach((bracket: any) => {
                const priceInfo = bracket.prices.find(p => p.voivodeship === voivodeshipValue);
                if (priceInfo) {
                    priceInfo.pricePerPerson = undefined as any;
                }
            });
        } else {
            // Logika włączania - to jest kluczowa poprawka
            updated.unavailableVoivodeships = updated.unavailableVoivodeships.filter(
                v => v !== voivodeshipValue
            );

            // PRZEŁAMANIE PĘTLI: Ustaw domyślną cenę 0 w pierwszym progu, aby useEffect
            // wiedział, że województwo jest teraz dostępne.
            const firstBracket = ensureBracket(updated, 0);
            const priceInfo = firstBracket.prices.find(p => p.voivodeship === voivodeshipValue);
            if (priceInfo) {
                priceInfo.pricePerPerson = 0;
            }
        }

        onTermChange(termIndex, updated);
    };
    // =================================================================

    function handleCopyPrice(copyPriceValue: string) {
        if (copyPriceValue === '') return;

        const updated: TermWithAvailability = JSON.parse(JSON.stringify(term));
        const newPriceValue = parseFloat(copyPriceValue);

        updated.brackets?.forEach(bracket => {
            bracket.prices.forEach(price => {
                const isUnavailable = updated.unavailableVoivodeships?.includes(price.voivodeship);
                if (!isUnavailable) {
                    price.pricePerPerson = newPriceValue;
                }
            });
        });

        onTermChange(termIndex, updated);
    }

    function handleTermDetailsChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        const updated: TermWithAvailability = { ...term, [name]: name === 'totalCapacity' ? (value === '' ? undefined : parseInt(value, 10)) : value } as any;
        onTermChange(termIndex, updated);
    }

    function handleIsTemplateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const isChecked = e.target.checked;
        const updated: TermWithAvailability = JSON.parse(JSON.stringify(term));

        updated.isPricingTemplate = isChecked;

        // Jeśli zaznaczono, czyścimy i blokujemy daty
        if (isChecked) {
            updated.startDate = undefined; // Ustawiamy na undefined (lub null)
            updated.endDate = undefined;   // Ustawiamy na undefined (lub null)
        }

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
                        value={term.totalCapacity ?? ''}
                        onChange={handleTermDetailsChange}
                        className={inputClassName}
                    />
                </div>
                <div className="flex items-center pb-2">
                    <input
                        type="checkbox"
                        id={`isTemplate-${termIndex}`}
                        name="isPricingTemplate"
                        checked={!!term.isPricingTemplate}
                        onChange={handleIsTemplateChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`isTemplate-${termIndex}`} className="ml-2 text-sm text-gray-700">
                        Szablon cennika
                    </label>
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
                    {VOIVODESHIPS.map(v => {
                        const isUnavailable = term.unavailableVoivodeships?.includes(v.value);
                        return (
                            <tr key={v.value} className={`hover:bg-gray-50 ${isUnavailable ? 'bg-gray-50' : ''}`}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={!!isUnavailable}
                                            onChange={(e) => handleAvailabilityChange(v.value, e.target.checked)}
                                        />
                                        <span className={isUnavailable ? 'text-gray-400' : ''}>
                                            {v.label}
                                        </span>
                                    </label>
                                </td>
                                {PARTICIPANT_BRACKETS.map((b, i) => {
                                    const price = term.brackets?.[i]?.prices?.find(p => p.voivodeship === v.value);
                                    return (
                                        <td key={`${v.value}-${b.min}`} className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="N/D"
                                                value={price?.pricePerPerson ?? ''}
                                                onChange={e => handlePriceChange(i, v.value, e.target.value)}
                                                className={tableInputClassName}
                                                disabled={isUnavailable}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupTermPricingEditor;
