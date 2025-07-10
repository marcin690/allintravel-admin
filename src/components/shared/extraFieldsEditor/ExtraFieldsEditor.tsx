"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {ExtraFieldNodeFE, ExtraFieldType} from "@/app/shared/types/extraFields";

type Props = {
    value: ExtraFieldNodeFE[];
    onChange: (next: ExtraFieldNodeFE[]) => void;
    title?: string
}

export default function ExtraFieldsEditor({ value, onChange, title = "Pola dodatkowe" }: Props) {

    function addTopLevelField(type: ExtraFieldType) {
        const newField: ExtraFieldNodeFE = {
            key: "",
            label: "",
            type,
            ...(type === 'REPEATER' ? { rows: [] } : {}),
        }

        const next = [...(value || []), newField];
        onChange(next);
    }

    function updateTopLevelField(index: number, patch: Partial<ExtraFieldNodeFE>) {
       const current = value[index];
       const updated = {...current, ...patch}
        const next = value.splice();
       next[index] = updated;
       onChange(next);
    }

    function removeTopLevelField(index: number) {
        const next = value.filter((_, i) => i !== index);
        onChange(next);
    }

    function addRowToRepeater(parentIndex: number) {
        const parent = value[parentIndex];
        const row = parent.rows ? parent.rows.slice() : [];
        row.push([]);
        updateTopLevelField(parentIndex, { rows: row });
    }

    function addFieldToRow(parentIndex: number, rowIndex: number, type: ExtraFieldType) {
        const parent = value[parentIndex];
        const rows = parent.rows ? parent.rows.slice() : [];
        const row = rows[rowIndex] ? rows[rowIndex].slice() : [];

        const newField: ExtraFieldNodeFE = {
            key: "",
            label: "",
            type,
            ...(type === 'REPEATER' ? { rows: [] } : {}),
        }

        row.push(newField);
        rows[rowIndex] = row;
        updateTopLevelField(parentIndex, { rows });
    }

    function removeFieldFromRow(parentIndex: number, rowIndex: number, fieldIndex: number) {
        const parent = value[parentIndex];
        const rows = parent.rows ? parent.rows.slice() : [];
        const row = rows[rowIndex] ? rows[rowIndex].slice() : [];
        const nextRow = row.filter((_, i) => i !== fieldIndex);
        rows[rowIndex] = nextRow;
        updateTopLevelField(parentIndex, { rows });

    }

    // 8) REPEATER: aktualizuj POLE w wierszu
    function updateFieldInRow(
        parentIndex: number,
        rowIndex: number,
        fieldIndex: number,
        patch: Partial<ExtraFieldNodeFE>
    ) {
        const parent = value[parentIndex];
        const rows = parent.rows ? parent.rows.slice() : [];
        const row = rows[rowIndex] ? rows[rowIndex].slice() : [];
        const currentField = row[fieldIndex];
        const updatedField = { ...currentField, ...patch };
        row[fieldIndex] = updatedField;
        rows[rowIndex] = row;
        updateTopLevelField(parentIndex, { rows });
    }

    function changeFieldTypeTopLevel(index: number, nextType: ExtraFieldType) {
        const current = value[index];
        const cleaned: ExtraFieldNodeFE = {
            ...current,
            type: nextType,
            textValue: nextType === "TEXT" ? current.textValue ?? "" : undefined,
            longTextValue: nextType === "LONG_TEXT" ? current.longTextValue ?? "" : undefined,
            linkValue: nextType === "LINK" ? current.linkValue ?? "" : undefined,
            imageValue: nextType === "IMAGE" ? current.imageValue ?? undefined : undefined,
            _file: nextType === "IMAGE" ? current._file ?? null : undefined,
            rows: nextType === "REPEATER" ? (current.rows ?? []) : undefined,
        };
        updateTopLevelField(index, cleaned);
    }

    // 10) Zmiana typu pola w wierszu repeatera
    function changeFieldTypeInRow(parentIndex: number, rowIndex: number, fieldIndex: number, nextType: ExtraFieldType) {
        const parent = value[parentIndex];
        const rows = parent.rows ? parent.rows.slice() : [];
        const row = rows[rowIndex] ? rows[rowIndex].slice() : [];
        const current = row[fieldIndex];

        const cleaned: ExtraFieldNodeFE = {
            ...current,
            type: nextType,
            textValue: nextType === "TEXT" ? current.textValue ?? "" : undefined,
            longTextValue: nextType === "LONG_TEXT" ? current.longTextValue ?? "" : undefined,
            linkValue: nextType === "LINK" ? current.linkValue ?? "" : undefined,
            imageValue: nextType === "IMAGE" ? current.imageValue ?? undefined : undefined,
            _file: nextType === "IMAGE" ? current._file ?? null : undefined,
            rows: undefined // w tej prostej wersji nie pozwalamy na zagnieżdżony REPEATER
        };

        row[fieldIndex] = cleaned;
        rows[rowIndex] = row;
        updateTopLevelField(parentIndex, { rows });
    }

    function renderTopLevelField(field: ExtraFieldNodeFE, index: number) {
        return (
            <div key={index} >
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div>
                        <label>Key</label><br/>
                        <input value={field.key}  className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={e => updateTopLevelField(index, { key: e.target.value })} />
                    </div>
                    <div>
                        <label>Etykieta</label><br/>
                        <input value={field.label} className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={e => updateTopLevelField(index, { label: e.target.value })} />
                    </div>
                    <div>
                        <label>Widoczna etykieta</label><br/>
                        <input
                            value={field.visiblePublicLabel ?? ""}
                            className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={e => updateTopLevelField(index, { visiblePublicLabel: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Typ</label><br/>
                        <select className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={field.type} onChange={e => changeFieldTypeTopLevel(index, e.target.value as ExtraFieldType)}>
                            <option value="TEXT">TEXT</option>
                            <option value="LONG_TEXT">LONG_TEXT</option>
                            <option value="LINK">LINK</option>
                            <option value="IMAGE">IMAGE</option>
                            <option value="REPEATER">REPEATER</option>
                        </select>
                    </div>
                    <button type="button" onClick={() => removeTopLevelField(index)} style={{ marginLeft: "auto" }}>
                        Usuń pole
                    </button>
                </div>

                {/* wartości wg typu */}
                {field.type === "TEXT" && (
                    <div>
                        <label>Wartość (tekst)</label><br/>
                        <input
                            value={field.textValue ?? ""}
                            className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={e => updateTopLevelField(index, { textValue: e.target.value })}
                        />
                    </div>
                )}

                {field.type === "LONG_TEXT" && (
                    <div>
                        <label>Wartość (długi tekst)</label><br/>
                        <textarea
                            rows={4}
                            className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={field.longTextValue ?? ""}
                            onChange={e => updateTopLevelField(index, { longTextValue: e.target.value })}
                        />
                    </div>
                )}

                {field.type === "LINK" && (
                    <div>
                        <label>Link</label><br/>
                        <input
                            value={field.linkValue ?? ""}
                            className="w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={e => updateTopLevelField(index, { linkValue: e.target.value })}
                        />
                    </div>
                )}

                {field.type === "IMAGE" && (
                    <div>
                        <label>Obraz</label><br/>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                const file = e.target.files?.[0] ?? null;
                                updateTopLevelField(index, { _file: file });
                            }}
                        />
                        {field.imageValue && (
                            <div style={{ fontSize: 12, color: "#666" }}>Obecny: {field.imageValue}</div>
                        )}
                    </div>
                )}

                {field.type === "REPEATER" && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>Wiersze</strong>
                            <button type="button" onClick={() => addRowToRepeater(index)}>Dodaj wiersz</button>
                        </div>

                        {(field.rows ?? []).map((row, rowIndex) => (
                            <div key={rowIndex} style={{ border: "1px dashed #ccc", padding: 8, marginTop: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div><strong>Wiersz #{rowIndex + 1}</strong></div>
                                    <button type="button" onClick={() => removeRowFromRepeater(index, rowIndex)}>Usuń wiersz</button>
                                </div>

                                {/* proste przyciski dodawania pól do wiersza */}
                                <div style={{ margin: "8px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <button type="button" onClick={() => addFieldToRow(index, rowIndex, "TEXT")}>+ Tekst</button>
                                    <button type="button" onClick={() => addFieldToRow(index, rowIndex, "LONG_TEXT")}>+ Długi tekst</button>
                                    <button type="button" onClick={() => addFieldToRow(index, rowIndex, "LINK")}>+ Link</button>
                                    <button type="button" onClick={() => addFieldToRow(index, rowIndex, "IMAGE")}>+ Obraz</button>
                                    {/* Uwaga: świadomie NIE pozwalamy na REPEATER w środku, żeby było prosto */}
                                </div>

                                {row.length === 0 && <div style={{ color: "#777", fontSize: 13 }}>Brak pól.</div>}

                                {row.map((child, childIndex) => (
                                    <div key={childIndex} style={{ border: "1px solid #eee", padding: 8, borderRadius: 6, marginTop: 6 }}>
                                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                            <input
                                                placeholder="key"
                                                value={child.key}
                                                onChange={e => updateFieldInRow(index, rowIndex, childIndex, { key: e.target.value })}
                                            />
                                            <input
                                                placeholder="etykieta"
                                                value={child.label}
                                                onChange={e => updateFieldInRow(index, rowIndex, childIndex, { label: e.target.value })}
                                            />
                                            <select
                                                value={child.type}
                                                onChange={e => changeFieldTypeInRow(index, rowIndex, childIndex, e.target.value as ExtraFieldType)}
                                            >
                                                <option value="TEXT">TEXT</option>
                                                <option value="LONG_TEXT">LONG_TEXT</option>
                                                <option value="LINK">LINK</option>
                                                <option value="IMAGE">IMAGE</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => removeFieldFromRow(index, rowIndex, childIndex)}
                                                style={{ marginLeft: "auto" }}
                                            >
                                                Usuń pole
                                            </button>
                                        </div>

                                        {/* wartości wg typu dla dziecka */}
                                        {child.type === "TEXT" && (
                                            <input
                                                placeholder="tekst"
                                                value={child.textValue ?? ""}
                                                onChange={e => updateFieldInRow(index, rowIndex, childIndex, { textValue: e.target.value })}
                                            />
                                        )}
                                        {child.type === "LONG_TEXT" && (
                                            <textarea
                                                rows={3}
                                                placeholder="długi tekst"
                                                value={child.longTextValue ?? ""}
                                                onChange={e => updateFieldInRow(index, rowIndex, childIndex, { longTextValue: e.target.value })}
                                            />
                                        )}
                                        {child.type === "LINK" && (
                                            <input
                                                placeholder="link"
                                                value={child.linkValue ?? ""}
                                                onChange={e => updateFieldInRow(index, rowIndex, childIndex, { linkValue: e.target.value })}
                                            />
                                        )}
                                        {child.type === "IMAGE" && (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    updateFieldInRow(index, rowIndex, childIndex, { _file: file });
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <section className="border border-gray-300 p-3 rounded">
            <h4 className="mb-2">{title}</h4>

            <div className="flex gap-2 flex-wrap mb-3">
                <button type="button" className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                        onClick={() => addTopLevelField("TEXT")}>+ Tekst
                </button>
                <button type="button" className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                        onClick={() => addTopLevelField("LONG_TEXT")}>+ Długi tekst
                </button>
                <button type="button" className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                        onClick={() => addTopLevelField("LINK")}>+ Link
                </button>
                <button type="button" className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                        onClick={() => addTopLevelField("IMAGE")}>+ Obraz
                </button>
                <button type="button" className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                        onClick={() => addTopLevelField("REPEATER")}>+ Powtarzalne
                </button>
            </div>

            {value.length === 0 ? (
                <div className="text-gray-500">Brak pól — dodaj powyżej.</div>
            ) : (
                value.map((f, i) => renderTopLevelField(f, i))
            )}
        </section>
    );


}
