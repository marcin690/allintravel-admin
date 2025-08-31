"use client";
import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/auth";

interface Tag {
    id: number;
    name: string;
    slug: string;
    tripType: string;
    showOnHomepage?: boolean;
    showOnProductPage?: boolean;
    isTechnical?: boolean;
}

interface TagPickerProps {
    value: string[];                    // nazwy tagów (dla kompatybilności wstecz)
    onChange: (next: string[]) => void;
    className?: string;

}

export default function TagPicker({ value, onChange, tripType, className }: TagPickerProps) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Szukaj tagów gdy user pisze
    useEffect(() => {
        const searchTags = async () => {
            if (inputValue.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                // ZMIANA: dodaj filtrowanie po typie wycieczki
                let url = `/tags?q=${encodeURIComponent(inputValue)}`;
                if (tripType) {
                    url += `&tripType=${tripType}`;
                }

                const response = await apiFetch(url);
                const tags = await response.json();

                const filtered = tags.filter((tag: Tag) =>
                    !value.includes(tag.name)
                );

                setSuggestions(filtered);
                setShowDropdown(filtered.length > 0);
            } catch (error) {
                console.error("Błąd wyszukiwania tagów:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(searchTags, 300);
        return () => clearTimeout(debounce);
    }, [inputValue, value, tripType]); // DODAJ tripType do dependencies

    // Zamknij dropdown przy kliknięciu poza
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectTag = (tag: Tag) => {
        onChange([...value, tag.name]);
        setInputValue("");
        setSuggestions([]);
        setShowDropdown(false);
    };

    const removeTag = (tagName: string) => {
        onChange(value.filter(v => v !== tagName));
    };

    return (
        <div className={className}>
            <label className="block text-sm mb-1.5">Tagi</label>

            {/* Lista wybranych tagów */}
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(tagName => (
                    <span
                        key={tagName}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                        {tagName}
                        <button
                            type="button"
                            onClick={() => removeTag(tagName)}
                            className="ml-1 text-blue-600 hover:text-red-600"
                            aria-label={`Usuń tag ${tagName}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            {/* Pole wyszukiwania */}
            <div className="relative" ref={dropdownRef}>
                <input
                    type="text"
                    placeholder="Wyszukaj i wybierz tag..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {isLoading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                )}

                {/* Dropdown z sugestiami */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg border border-gray-200">
                        {suggestions.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => selectTag(tag)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="font-medium">{tag.name}</div>
                                {tag.slug && (
                                    <div className="text-xs text-gray-500">{tag.slug}</div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Brak wyników */}
                {/* Dropdown z sugestiami */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg border border-gray-200">
                        {suggestions.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => selectTag(tag)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="font-medium">{tag.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    {tag.slug && (
                                        <span className="text-xs text-gray-500">{tag.slug}</span>
                                    )}

                                    {/* Wskaźniki */}
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        {tag.showOnProductPage && (
                                            <div className="flex items-center gap-0.5">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Strona produktu"/>
                                                <span className="text-[10px] text-gray-500">produkt</span>
                                            </div>
                                        )}
                                        {tag.showOnHomepage && (
                                            <div className="flex items-center gap-0.5">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Strona główna"/>
                                                <span className="text-[10px] text-gray-500">główna</span>
                                            </div>
                                        )}
                                        {tag.isTechnical && (
                                            <div className="flex items-center gap-0.5">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Tag techniczny"/>
                                                <span className="text-[10px] text-gray-500">tech</span>
                                            </div>
                                        )}
                                    </div>

                                    <a
                                        href={`/admin/trips/tag?editId=${tag.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        title="Edytuj tag"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                        </svg>
                                    </a>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <p className="mt-1 text-xs text-gray-500">
                Wpisz minimum 2 znaki aby wyszukać tagi
            </p>
        </div>
    );
}