import React, { useState } from 'react';
import RichTextEditor from "@/components/ui/RichTextEditor";
import ImageUploader from "@/components/shared/ImageUploader";
import { ItineraryDayDTO } from "@/app/shared/types/tripe.types";

interface ItineraryDayEditorProps {
    day: ItineraryDayDTO;
    index: number;
    onUpdate: (index: number, field: keyof ItineraryDayDTO, value: string | number) => void;
    onRemove: (index: number) => void;
    inputClassName: string;
}

const ItineraryDayEditor: React.FC<ItineraryDayEditorProps> = ({
                                                                   day,
                                                                   index,
                                                                   onUpdate,
                                                                   onRemove,
                                                                   inputClassName
                                                               }) => {
    // Stan dla zdjęcia dnia
    const [dayImageFile, setDayImageFile] = useState<File | null>(null);
    const [dayImageUrl, setDayImageUrl] = useState<string | null>(day.imageUrl || null);

    const handleFieldChange = (field: keyof ItineraryDayDTO, value: string | number) => {
        onUpdate(index, field, value);
    };

    const handleImageFileSelect = (file: File | null) => {
        setDayImageFile(file);
        if (file) {
            setDayImageUrl(null); // Wyczyść URL jeśli dodano nowy plik
        }
    };

    const handleImageUploadSuccess = (uploadedUrl: string) => {
        setDayImageUrl(uploadedUrl);
        setDayImageFile(null); // Wyczyść plik po udanym uploadzie
        onUpdate(index, 'imageUrl', uploadedUrl); // Zaktualizuj dane formularza
    };

    // Aktualizuj URL w danych formularza gdy się zmieni
    React.useEffect(() => {
        if (dayImageFile) {
            // Tu możesz dodać logikę uploadu pliku lub przechowywania w stanie formularza
            // Na razie zakładam, że plik zostanie przesłany podczas submit całego formularza
        }
    }, [dayImageFile]);

    return (
        <div className="border p-4 rounded-md relative bg-gray-50">
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                title="Usuń dzień"
            >
                ✕
            </button>

            {/* Podstawowe pola */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-1">
                    <label className="block text-sm mb-1.5 font-medium">Dzień</label>
                    <input
                        type="number"
                        value={day.dayNumber}
                        onChange={(e) => handleFieldChange('dayNumber', Number(e.target.value))}
                        className={inputClassName}
                        min="1"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm mb-1.5 font-medium">Data specjalna</label>
                    <input
                        type="date"
                        value={day.specDateForOffer || ''}
                        onChange={(e) => handleFieldChange('specDateForOffer', e.target.value)}
                        className={inputClassName}
                        placeholder="np. 15 sierpnia"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Widoczne w ofercie PDF
                    </p>
                </div>
                <div className="col-span-1">
                    <label className="block text-sm mb-1.5 font-medium">Tytuł główny</label>
                    <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className={inputClassName}
                        placeholder="np. Wyjazd do Krakowa"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm mb-1.5 font-medium">Podtytuł</label>
                    <input
                        type="text"
                        value={day.subtitle || ''}
                        onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                        className={inputClassName}
                        placeholder="np. Zwiedzanie Starego Miasta"
                    />
                </div>
            </div>

            {/* Zdjęcie dla dnia */}
            <div className="mb-4">
                <ImageUploader
                    label="Zdjęcie dnia"
                    currentImageUrl={dayImageUrl}
                    selectedFile={dayImageFile}
                    onFileSelect={handleImageFileSelect}

                    autoUpload={true}
                    onUploadSuccess={handleImageUploadSuccess}
                    className={inputClassName}
                    previewWidth="w-40"
                    previewHeight="h-24"
                    placeholder="Dodaj zdjęcie dla tego dnia..."
                />
            </div>

            {/* Krótki opis */}
            <div className="mb-4">
                <label className="block text-sm mb-1.5 font-medium">Opis (krótki)</label>
                <RichTextEditor
                    value={day.description}
                    onChange={(value) => handleFieldChange('description', value)}
                />
            </div>

            {/* Długi opis dla oferty */}
            <div>
                <label className="block text-sm mb-1.5 font-medium">Długi opis dla oferty</label>
                <RichTextEditor
                    value={day.longDescriptionForOffer || ''}
                    onChange={(value) => handleFieldChange('longDescriptionForOffer', value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Rozszerzony opis używany w szczegółach oferty (PDF)
                </p>
            </div>
        </div>
    );
};

export default ItineraryDayEditor;