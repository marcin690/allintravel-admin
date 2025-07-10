"use client";
import React from "react";

interface TagPickerProps {
    value: string[];                       // aktualne tagi (np. ["Góry","Rodzinne"])
    onChange: (next: string[]) => void;    // setter z rodzica
    className?: string;                    // opcjonalnie: dodatkowe klasy z rodzica
}

export default function TagPicker({ value, onChange, className }: TagPickerProps) {
    const [inputValue, setInputValue] = React.useState("");

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        // prosty antyduplikat (case-insensitive)
        const exists = value.some(v => v.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            setInputValue("");
            return;
        }
        onChange([...value, trimmed]);
        setInputValue("");
    };

    const removeTag = (tag: string) => {
        onChange(value.filter(v => v !== tag));
    };

    return (
        <div className={className}>
            {/* Lista wybranych tagów (chipsy) */}
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800"
                    >
            {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="rounded p-0.5 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                            aria-label={`Usuń tag ${tag}`}
                            title="Usuń"
                        >
              ×
            </button>
          </span>
                ))}
            </div>

            {/* Pole + przycisk dodawania */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Dodaj tag…"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Dodaj
                </button>
            </div>

            {/* Pomocnicza podpowiedź */}
            <p className="mt-1 text-xs text-gray-500">
                Naciśnij <kbd className="rounded border px-1">Enter</kbd> albo kliknij „Dodaj”, aby dodać nowy tag.
            </p>
        </div>
    );
}