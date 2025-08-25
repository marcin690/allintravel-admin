import React, { useState } from 'react';
import { getImageUrl } from "@/utils/getImageUrl";
import { toast } from "react-toastify";
import { apiFetch } from "@/utils/auth";

interface GalleryUploaderProps {
    /** Aktualne URLe zdjęć z backendu */
    currentImageUrls?: string[];
    /** Aktualnie wybrane pliki */
    selectedFiles?: File[];
    /** Callback gdy użytkownik wybierze nowe pliki */
    onFilesSelect: (files: File[]) => void;
    /** Callback gdy użytkownik usunie zdjęcie z backendu */
    onCurrentImageRemove?: (index: number) => void;
    /** Callback gdy użytkownik usunie wybrany plik */
    onSelectedFileRemove?: (index: number) => void;
    /** Czy automatycznie uploadować pliki po wybraniu */
    autoUpload?: boolean;
    /** Callback z URLami po udanym uploadzie */
    onUploadSuccess?: (urls: string[]) => void;
    /** Tekst label */
    label?: string;
    /** Klasy CSS dla inputa */
    className?: string;
}

const GalleryUploader: React.FC<GalleryUploaderProps> = ({
                                                             currentImageUrls = [],
                                                             selectedFiles = [],
                                                             onFilesSelect,
                                                             onCurrentImageRemove,
                                                             onSelectedFileRemove,
                                                             autoUpload = false,
                                                             onUploadSuccess,
                                                             label = "Galeria zdjęć",
                                                             className = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                         }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

    const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];

        if (files.length === 0) return;

        // Dodaj nowe pliki do istniejących
        onFilesSelect([...selectedFiles, ...files]);

        // Auto upload jeśli włączony
        if (autoUpload && onUploadSuccess) {
            setIsUploading(true);
            try {
                const uploadPromises = files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await apiFetch('/files/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const data = await response.json();
                        return data.sizes?.['2k'] || data.url;
                    }
                    throw new Error('Upload failed');
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                onUploadSuccess(uploadedUrls);
                toast.success(`${uploadedUrls.length} zdjęć zostało przesłanych`);

                // Po uploadzie czyścimy selected files
                onFilesSelect([]);

            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Błąd podczas przesyłania zdjęć');
            } finally {
                setIsUploading(false);
            }
        }

        // Reset input value aby móc wybrać te same pliki ponownie
        e.target.value = '';
    };

    const handleRemoveCurrentImage = (index: number) => {
        if (onCurrentImageRemove) {
            onCurrentImageRemove(index);
        }
    };

    const handleRemoveSelectedFile = (index: number) => {
        if (onSelectedFileRemove) {
            const newFiles = selectedFiles.filter((_, i) => i !== index);
            onFilesSelect(newFiles);
        } else {
            // Jeśli nie ma dedykowanego handlera, używamy onFilesSelect
            const newFiles = selectedFiles.filter((_, i) => i !== index);
            onFilesSelect(newFiles);
        }
    };

    const handleImageLoad = (imageId: string) => {
        setLoadingImages(prev => ({ ...prev, [imageId]: false }));
    };

    const handleImageError = (imageId: string) => {
        setLoadingImages(prev => ({ ...prev, [imageId]: false }));
    };

    // Inicjalizuj loading state dla nowych zdjęć
    React.useEffect(() => {
        const newLoadingState: { [key: string]: boolean } = {};
        currentImageUrls.forEach((url, idx) => {
            const imageId = `current-${idx}`;
            if (loadingImages[imageId] === undefined) {
                newLoadingState[imageId] = true;
            }
        });
        if (Object.keys(newLoadingState).length > 0) {
            setLoadingImages(prev => ({ ...prev, ...newLoadingState }));
        }
    }, [currentImageUrls]);

    return (
        <div>
            {label && (
                <label className="block text-sm mb-1.5">{label}</label>
            )}

            <div className="space-y-3">
                {/* Input z loaderem */}
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesChange}
                        className={className}
                        disabled={isUploading}
                    />

                    {isUploading && (
                        <div className="flex items-center text-blue-600">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                            <span className="text-sm">Przesyłanie...</span>
                        </div>
                    )}
                </div>

                {/* Grid z podglądem */}
                {(currentImageUrls.length > 0 || selectedFiles.length > 0) && (
                    <div className="grid grid-cols-4 gap-2">
                        {/* Zdjęcia z backendu */}
                        {currentImageUrls.map((url, idx) => {
                            const imageId = `current-${idx}`;
                            const isLoading = loadingImages[imageId] !== false;

                            return (
                                <div key={imageId} className="relative group">
                                    {/* Loader */}
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}

                                    <img
                                        src={getImageUrl(url)}
                                        className="w-full h-24 object-cover rounded"
                                        onLoad={() => handleImageLoad(imageId)}
                                        onError={() => handleImageError(imageId)}
                                        alt={`Gallery image ${idx + 1}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCurrentImage(idx)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Usuń zdjęcie"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}

                        {/* Nowo wybrane pliki */}
                        {selectedFiles.map((file, idx) => (
                            <div key={`selected-${idx}`} className="relative group">
                                <img
                                    src={URL.createObjectURL(file)}
                                    className="w-full h-24 object-cover rounded"
                                    alt={`Selected file ${idx + 1}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => handleRemoveSelectedFile(idx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Usuń wybrany plik"
                                >
                                    ✕
                                </button>

                                {/* Badge "Nowe" */}
                                <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                    Nowe
                                </span>
                            </div>
                        ))}
                    </div>
                )}


                {(currentImageUrls.length > 0 || selectedFiles.length > 0) && (
                    <div className="text-sm text-gray-500">
                        Zdjęć w galerii: {currentImageUrls.length}
                        {selectedFiles.length > 0 && ` (+ ${selectedFiles.length} nowych)`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryUploader;