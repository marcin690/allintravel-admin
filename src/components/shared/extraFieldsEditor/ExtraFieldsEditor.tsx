"use client"
import React from 'react';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Załóżmy, że te typy są zdefiniowane gdzieś w Twoim projekcie
// export enum ExtraFieldType { ... }
// export interface ExtraFieldNodeFE { ... }
// Poniżej umieszczam definicje dla kompletności kodu:
export enum ExtraFieldType {
    TEXT = "TEXT",
    LONG_TEXT = "LONG_TEXT",
    IMAGE = "IMAGE",
    REPEATER = "REPEATER",
    LINK = "LINK"
}


const toKey = (s: string) =>
    s.trim()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // usuń ogonki
        .replace(/ł/g, 'l')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');


export interface ExtraFieldNodeFE {
    __id?: string;
    key: string;
    label: string;
    type: ExtraFieldType;
    textValue?: string;
    longTextValue?: string;
    imageValue?: string;
    linkValue?: string;
    visiblePublicLabel?: string;
    rows?: ExtraFieldNodeFE[][];
    _file?: File | null; // Pole pomocnicze dla frontendu
}


type Props = {
    value: ExtraFieldNodeFE[];
    onChange: (next: ExtraFieldNodeFE[]) => void;
    title?: string
}


export function ensureUniqueKey(base: string, used: string[]) {
    if (!used.includes(base)) return base;
    let i = 2;
    while (used.includes(`${base}-${i}`)) i++;
    return `${base}-${i}`;
}

const FieldWrapper = ({ children, title, onRemove }: { children: React.ReactNode, title: string, onRemove: () => void }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <h3 className="font-semibold text-gray-700">{title}</h3>
            <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
            </button>
        </div>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

const FormRow = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">{children}</div>
);

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-600">{label}</label>
        {children}
    </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-3 py-2 text-sm h-10 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition" />
);

const SelectInput = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-3 py-2 text-sm h-10 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
);

const TextAreaInput = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
);

const FileInput = ({ onChange, existingValue }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, existingValue?: string }) => (
    <div className="w-full">
        <input type="file" accept="image/*" onChange={onChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {existingValue && <p className="text-xs text-gray-500 mt-1">Obecny plik: <span className="font-mono">{existingValue}</span></p>}
    </div>
);

export default function ExtraFieldsEditor({ value = [], onChange, title = "Pola dodatkowe" }: Props) {

    // --- Funkcje zarządzania stanem (logika pozostaje taka sama) ---

    function addTopLevelField(type: ExtraFieldType) {
        const newField: ExtraFieldNodeFE = {
            __id: uid(),
            key: "",
            label: "",
            type,
            ...(type === 'REPEATER' ? { rows: [] } : {}),
        }
        onChange([...value, newField]);
    }

    function updateTopLevelField(index: number, patch: Partial<ExtraFieldNodeFE>) {
        const updatedFields = [...value];
        const currentField = updatedFields[index];



        updatedFields[index] = { ...currentField, ...patch };
        onChange(updatedFields);
    }

    function removeTopLevelField(index: number) {
        onChange(value.filter((_, i) => i !== index));
    }

    function addRowToRepeater(parentIndex: number) {
        const parent = value[parentIndex];
        const newRows = parent.rows ? [...parent.rows, []] : [[]];
        updateTopLevelField(parentIndex, { rows: newRows });
    }

    function removeRowFromRepeater(parentIndex: number, rowIndex: number) {
        const parent = value[parentIndex];
        if (!parent.rows) return;
        const newRows = parent.rows.filter((_, i) => i !== rowIndex);
        updateTopLevelField(parentIndex, { rows: newRows });
    }

    function addFieldToRow(parentIndex: number, rowIndex: number, type: ExtraFieldType) {
        const parent = value[parentIndex];
        if (!parent.rows) return;

        const newField: ExtraFieldNodeFE = {
            __id: uid(),
            key: "",
            label: "",
            type,
        };

        const newRows = [...parent.rows];
        newRows[rowIndex] = [...(newRows[rowIndex] || []), newField];
        updateTopLevelField(parentIndex, { rows: newRows });
    }

    function removeFieldFromRow(parentIndex: number, rowIndex: number, fieldIndex: number) {
        const parent = value[parentIndex];
        if (!parent.rows || !parent.rows[rowIndex]) return;

        const newRows = [...parent.rows];
        newRows[rowIndex] = newRows[rowIndex].filter((_, i) => i !== fieldIndex);
        updateTopLevelField(parentIndex, { rows: newRows });
    }

    function updateFieldInRow(parentIndex: number, rowIndex: number, fieldIndex: number, patch: Partial<ExtraFieldNodeFE>) {
        const parent = value[parentIndex];
        if (!parent.rows || !parent.rows[rowIndex]) return;



        const newRows = [...parent.rows];
        const newRow = [...newRows[rowIndex]];
        newRow[fieldIndex] = { ...newRow[fieldIndex], ...patch };
        newRows[rowIndex] = newRow;
        updateTopLevelField(parentIndex, { rows: newRows });
    }

    function changeFieldType(updateFn: (patch: Partial<ExtraFieldNodeFE>) => void, currentField: ExtraFieldNodeFE, nextType: ExtraFieldType) {
        const cleaned: Partial<ExtraFieldNodeFE> = {
            type: nextType,
            textValue: nextType === "TEXT" ? currentField.textValue ?? "" : undefined,
            longTextValue: nextType === "LONG_TEXT" ? currentField.longTextValue ?? "" : undefined,
            linkValue: nextType === "LINK" ? currentField.linkValue ?? "" : undefined,
            imageValue: nextType === "IMAGE" ? currentField.imageValue : undefined,
            _file: nextType === "IMAGE" ? currentField._file : undefined,
            rows: nextType === "REPEATER" ? (currentField.rows ?? []) : undefined,
        };
        updateFn(cleaned);
    }





    function renderField(field: ExtraFieldNodeFE, updateFn: (patch: Partial<ExtraFieldNodeFE>) => void) {
        const type = field.type;
        if (type === "TEXT") return <FormField label="Wartość"><TextInput value={field.textValue ?? ""} onChange={e => updateFn({ textValue: e.target.value })} /></FormField>;
        if (type === "LONG_TEXT") return <FormField label="Wartość"><TextAreaInput rows={4} value={field.longTextValue ?? ""} onChange={e => updateFn({ longTextValue: e.target.value })} /></FormField>;
        if (type === "LINK") return <FormField label="URL"><TextInput value={field.linkValue ?? ""} onChange={e => updateFn({ linkValue: e.target.value })} /></FormField>;
        if (type === "IMAGE") return <FormField label="Obrazek"><FileInput existingValue={field.imageValue} onChange={e => updateFn({ _file: e.target.files?.[0] ?? null, imageValue: 'new_file' })} /></FormField>;
        return null;
    }

    function renderRepeaterRow(parentIndex: number, row: ExtraFieldNodeFE[], rowIndex: number) {
        return (
            <div key={rowIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-600">Wiersz #{rowIndex + 1}</h4>
                    <button type="button" onClick={() => removeRowFromRepeater(parentIndex, rowIndex)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                {row.map((childField, childIndex) => (
                    <div key={childField.__id ?? `child-${childIndex}`} className="bg-white p-3 border rounded-md">
                        <FormRow>
                            <FormField label="Etykieta">
                                <TextInput
                                    value={childField.label}
                                    onChange={e => updateFieldInRow(parentIndex, rowIndex, childIndex, { label: e.target.value })}
                                    onBlur={e => {
                                        if (!childField.key) {
                                            updateFieldInRow(parentIndex, rowIndex, childIndex, { key: toKey(e.target.value) });
                                        }
                                    }}
                                />
                            </FormField>
                            <FormField label="Klucz (automatyczny)">
                                <TextInput value={childField.key} disabled />
                            </FormField>
                            <FormField label="Typ">
                                <SelectInput value={childField.type} onChange={e => changeFieldType(
                                    (patch) => updateFieldInRow(parentIndex, rowIndex, childIndex, patch),
                                    childField,
                                    e.target.value as ExtraFieldType
                                )}>
                                    <option value={ExtraFieldType.TEXT}>Tekst</option>
                                    <option value={ExtraFieldType.LONG_TEXT}>Długi tekst</option>
                                    <option value={ExtraFieldType.LINK}>Link</option>
                                    <option value={ExtraFieldType.IMAGE}>Obraz</option>
                                </SelectInput>
                            </FormField>
                            <div className="flex items-end">
                                <button type="button" onClick={() => removeFieldFromRow(parentIndex, rowIndex, childIndex)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </FormRow>
                        <div className="mt-2">
                            {renderField(childField, (patch) => updateFieldInRow(parentIndex, rowIndex, childIndex, patch))}
                        </div>
                    </div>
                ))}

                <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-200">
                    <button type="button" className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded" onClick={() => addFieldToRow(parentIndex, rowIndex, ExtraFieldType.TEXT)}>+ Tekst</button>
                    <button type="button" className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded" onClick={() => addFieldToRow(parentIndex, rowIndex, ExtraFieldType.LONG_TEXT)}>+ Długi tekst</button>
                    <button type="button" className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded" onClick={() => addFieldToRow(parentIndex, rowIndex, ExtraFieldType.LINK)}>+ Link</button>
                    <button type="button" className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded" onClick={() => addFieldToRow(parentIndex, rowIndex, ExtraFieldType.IMAGE)}>+ Obraz</button>
                </div>
            </div>
        );
    }

    function renderTopLevelField(field: ExtraFieldNodeFE, index: number) {
        return (
            <FieldWrapper title={`${field.label || 'Nowe pole'} (${field.type})`} onRemove={() => removeTopLevelField(index)}>
                <FormRow>
                    <FormField label="Etykieta">
                        <TextInput
                            value={field.label}
                            onChange={e => updateTopLevelField(index, { label: e.target.value })}
                            onBlur={e => {
                                if (!field.key) updateTopLevelField(index, { key: toKey(e.target.value) });
                            }}
                        />
                    </FormField>
                    <FormField label="Klucz (automatyczny)">
                        <TextInput
                            value={field.label}
                            onChange={e => updateTopLevelField(index, {
                                label: e.target.value,
                                key: toKey(e.target.value) // Zawsze generuj nowy key
                            })}
                            disabled
                        />
                    </FormField>
                    <FormField label="Typ">
                        <SelectInput value={field.type} onChange={e => changeFieldType(
                            (patch) => updateTopLevelField(index, patch),
                            field,
                            e.target.value as ExtraFieldType
                        )}>
                            <option value={ExtraFieldType.TEXT}>Tekst</option>
                            <option value={ExtraFieldType.LONG_TEXT}>Długi tekst</option>
                            <option value={ExtraFieldType.LINK}>Link</option>
                            <option value={ExtraFieldType.IMAGE}>Obraz</option>
                            <option value={ExtraFieldType.REPEATER}>Powtarzalne (Repeater)</option>
                        </SelectInput>
                    </FormField>
                </FormRow>

                {renderField(field, (patch) => updateTopLevelField(index, patch))}

                {field.type === "REPEATER" && (
                    <div className="mt-4 space-y-4">
                        {(field.rows ?? []).map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`}>{renderRepeaterRow(index, row, rowIndex)}</div>
                        ))}
                        <button type="button" className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-md border border-blue-200 transition" onClick={() => addRowToRepeater(index)}>
                            + Dodaj nowy wiersz
                        </button>
                    </div>
                )}
            </FieldWrapper>
        );
    }

    return (
        <section className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>

            <div className="flex gap-2 flex-wrap mb-4 pb-4 border-b border-gray-200">
                <button type="button" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition" onClick={() => addTopLevelField(ExtraFieldType.TEXT)}>+ Tekst</button>
                <button type="button" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition" onClick={() => addTopLevelField(ExtraFieldType.LONG_TEXT)}>+ Długi tekst</button>
                <button type="button" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition" onClick={() => addTopLevelField(ExtraFieldType.LINK)}>+ Link</button>
                <button type="button" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition" onClick={() => addTopLevelField(ExtraFieldType.IMAGE)}>+ Obraz</button>
                <button type="button" className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition" onClick={() => addTopLevelField(ExtraFieldType.REPEATER)}>+ Powtarzalne</button>
            </div>

            {value.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <p>Brak pól dodatkowych.</p>
                    <p className="text-sm">Użyj przycisków powyżej, aby dodać nowe pole.</p>
                </div>
            ) : (
                value.map((f, i) => (
                        <div key={f.__id ?? `top-${i}`}>{renderTopLevelField(f, i)}</div>
                    ))
            )}
        </section>
    );
}
