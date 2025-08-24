"use client";
import React from "react";

export type DepartureOptionDTO = {
    id?: number | null;
    locationName: string;
    priceAdjustment?: number | null; // PLN; może być ujemna/0
    departureTime?: string | null;   // np. '2025-09-20T05:30'
};

interface Props {
    value: DepartureOptionDTO[];
    onChange: (next: DepartureOptionDTO[]) => void;
    tableInputClassName?: string; // możesz podać swój styl z formularza
}

export default function DepartureOptionsEditor({
                                                   value,
                                                   onChange,
                                                   tableInputClassName = "w-full p-1.5 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                               }: Props) {
    // Dodaj nowy pusty wiersz
    const addRow = () => {
        onChange([
            ...value,
            { id: null, locationName: "", priceAdjustment: 0, departureTime: "" },
        ]);
    };

    // Usuń wiersz po indeksie
    const removeRow = (idx: number) => {
        onChange(value.filter((_, i) => i !== idx));
    };

    // Zmień pole w danym wierszu
    const updateCell = (
        idx: number,
        field: keyof DepartureOptionDTO,
        raw: string
    ) => {
        const next = [...value];
        const current = { ...next[idx] };

        if (field === "priceAdjustment") {
            current.priceAdjustment = raw === "" ? null : Number(raw);
        } else if (field === "locationName") {
            current.locationName = raw;
        } else if (field === "departureTime") {
            current.departureTime = raw;
        }

        next[idx] = current;
        onChange(next);
    };

    return (
        // KARTA — tak jak w edytorze cennika (grupowym): ramka, cień, odstępy
        <div className="">
            {/* NAGŁÓWEK — tytuł lewo, akcja prawo; brak dodatkowego marginesu (spójne z cennikiem) */}
            <div className="flex items-center justify-between">
                <h6 className="text-md font-semibold text-gray-800">Przystanki</h6>

            </div>

            {/* TABELA — identyczne klasy jak w tabeli cen */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Miejscowość / punkt zbiórki
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dopłata (PLN)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data i godzina wyjazdu
                        </th>
                        <th className="px-4 py-3"/>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {value.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-4 py-6 text-sm text-gray-500 text-center">
                                Brak przystanków. Kliknij „Dodaj przystanek”.
                            </td>
                        </tr>
                    )}

                    {value.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            {/* Miejscowość */}
                            <td className="px-4 py-3">
                                <input
                                    type="text"
                                    placeholder="np. Warszawa, Dw. Zachodni"
                                    value={row.locationName ?? ""}
                                    onChange={(e) => updateCell(idx, "locationName", e.target.value)}
                                    className={tableInputClassName}
                                />
                            </td>

                            {/* Dopłata */}
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="np. 0 / 30 / -10"
                                    value={
                                        row.priceAdjustment === null || row.priceAdjustment === undefined
                                            ? ""
                                            : String(row.priceAdjustment)
                                    }
                                    onChange={(e) => updateCell(idx, "priceAdjustment", e.target.value)}
                                    className={tableInputClassName}
                                />
                            </td>

                            {/* Data + godzina */}
                            <td className="px-4 py-3">
                                {/* Jeśli backend przyjmuje tylko datę → zmień na type="date" */}
                                <input
                                    type="time"
                                    value={row.departureTime ?? ""}
                                    onChange={(e) => updateCell(idx, "departureTime", e.target.value)}
                                    className={tableInputClassName}
                                />
                            </td>

                            {/* Usuń */}
                            <td className="px-4 py-3 text-right">
                                <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    title="Usuń przystanek"
                                >
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <button
                    type="button"
                    onClick={addRow}
                    className="pt-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Dodaj przystanek
                </button>
            </div>

            {/* Podpowiedź — tak jak w innych kartach: drobny opis pod tabelą */}
            <p className="text-xs text-gray-500">
                <strong>Dopłata</strong> może być ujemna (zniżka), równa 0 lub dodatnia. Format daty/godziny odpowiada
                polu
                <code className="mx-1">datetime-local</code>.
            </p>
        </div>
    );
}