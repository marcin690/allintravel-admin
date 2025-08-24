"use client";
import React from "react";

type IndividualTerm = {
    startDate: string;
    endDate: string;
    status: "AVAILABLE" | "FEW_LEFT" | "SOLD_OUT";
    totalCapacity: number;
    pricePerPerson?: number;
    travelPayProductUrl?: string;
};

interface Props {
    terms: IndividualTerm[];
    onChange: (next: IndividualTerm[]) => void;
    inputClassName: string; // podaj ten sam co w formie (spójny wygląd)
}

const IndividualTermsEditor: React.FC<Props> = ({ terms, onChange, inputClassName }) => {
    const tableInput =
        "w-full p-1.5 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    const addTerm = () =>
        onChange([
            ...terms,
            { startDate: "", endDate: "", status: "AVAILABLE", totalCapacity: 0, pricePerPerson: undefined, travelPayProductUrl: "" },
        ]);

    const removeTerm = (idx: number) => onChange(terms.filter((_, i) => i !== idx));

    const update = (idx: number, field: keyof IndividualTerm, value: any) => {
        const next = [...terms];
        if (field === "totalCapacity") value = Number(value || 0);
        if (field === "pricePerPerson") value = value === "" ? undefined : Number(value);
        next[idx] = { ...next[idx], [field]: value };
        onChange(next);
    };

    return (
        <div className="">

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                    <tr className="text-left">
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Data od</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Data do</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pojemność</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cena / os.</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Link travelPay</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {terms.map((t, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <input
                                    type="date"
                                    value={t.startDate}
                                    onChange={(e) => update(i, "startDate", e.target.value)}
                                    className={tableInput}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <input
                                    type="date"
                                    value={t.endDate}
                                    onChange={(e) => update(i, "endDate", e.target.value)}
                                    className={tableInput}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <select
                                    value={t.status}
                                    onChange={(e) => update(i, "status", e.target.value)}
                                    className={tableInput}
                                >
                                    <option value="AVAILABLE">Dostępny</option>
                                    <option value="BOOKED_OUT">Wyprzedany</option>
                                    <option value="CANCELLED">Anulowany</option>
                                    <option value="BLOCKED">Zablokowany</option>
                                </select>
                            </td>
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    value={t.totalCapacity}
                                    onChange={(e) => update(i, "totalCapacity", e.target.value)}
                                    className={tableInput}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={t.pricePerPerson ?? ""}
                                    onChange={(e) => update(i, "pricePerPerson", e.target.value)}
                                    className={tableInput}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center">

                                    <input
                                        type="url"
                                        value={t.travelPayProductUrl ?? ""}
                                        onChange={(e) => {
                                            let value = e.target.value.trim();

                                            // Auto-dodaj https:// jeśli nie ma protokołu
                                            if (value && !value.match(/^https?:\/\//)) {
                                                value = `https://${value}`;
                                            }

                                            update(i, "travelPayProductUrl", value);
                                        }}
                                        className={tableInput}
                                        placeholder="allin.travelpay.online/booking/909-218 (https:// zostanie dodane automatycznie)"
                                        title="Protokół https:// zostanie dodany automatycznie"
                                    />
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button type="button" onClick={() => removeTerm(i)}
                                        className="text-red-600 hover:underline">
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                    {terms.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                Brak terminów — dodaj pierwszy.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div>
                <button
                    type="button"
                    onClick={addTerm}
                    className="mt-1 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                >
                    Dodaj termin
                </button>
            </div>
        </div>
    );
};

export default IndividualTermsEditor;