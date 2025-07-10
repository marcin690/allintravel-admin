"use client";
import React from "react";

type SeoValue = {
    metaTitle: string;
    metaDescription: string;
};

interface SeoFieldsProps {
    value: SeoValue;
    onChange: (next: SeoValue) => void;
    inputClassName?: string;
    textareaClassName?: string;
}

export default function SeoFields({
                                      value,
                                      onChange,
                                      inputClassName = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                      textareaClassName = "w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                  }: SeoFieldsProps) {
    const MAX_TITLE = 70;
    const MAX_DESC  = 160;

    return (
        <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
            <header className="col-span-2 mb-6 @5xl:mb-0">
                <h5 className="text-lg font-semibold">SEO</h5>
                <p className="mt-1 text-sm text-gray-500">Meta tytuł i opis dla wyszukiwarek.</p>
            </header>

            <div className="col-span-4 grid grid-cols-1 gap-3 @lg:gap-4 @2xl:gap-5">
                <div>
                    <label className="block text-sm mb-1.5">Meta Title</label>
                    <input
                        type="text"
                        value={value.metaTitle ?? ""}
                        maxLength={MAX_TITLE}
                        onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
                        placeholder="Krótki i treściwy tytuł (do 70 znaków)"
                        className={inputClassName}
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                        {value.metaTitle?.length ?? 0}/{MAX_TITLE}
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-1.5">Meta Description</label>
                    <textarea
                        value={value.metaDescription ?? ""}
                        maxLength={MAX_DESC}
                        onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
                        rows={3}
                        placeholder="Krótki opis (do ~160 znaków), zachęcający do kliknięcia"
                        className={textareaClassName}
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                        {value.metaDescription?.length ?? 0}/{MAX_DESC}
                    </div>
                </div>
            </div>
        </section>
    );
}