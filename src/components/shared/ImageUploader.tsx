import React, {useState} from 'react';
import { getImageUrl } from "@/utils/getImageUrl";
import {toast} from "react-toastify";
import {apiFetch} from "@/utils/auth";

interface ImageUploader {
    /** Aktualne URL zdjęcia z backendu */
    currentImageUrl?: string | null;
    /** Aktualnie wybrany plik (nowy) */
    selectedFile?: File | null;
    /** Callback gdy użytkownik wybierze nowy plik */
    onFileSelect: (file: File | null) => void;
    /** Callback gdy użytkownik usunie aktualne zdjęcie */
    onCurrentImageRemove?: () => void;
    /** Dodatkowe klasy CSS dla input */
    className?: string;
    /** Tekst label */
    label?: string;
    /** Szerokość podglądu (domyślnie w-32) */
    previewWidth?: string;
    /** Wysokość podglądu (domyślnie h-20) */
    previewHeight?: string;
    /** Czy pokazać podgląd zdjęcia */
    showPreview?: boolean;
    /** Placeholder dla input */
    placeholder?: string;
    /** Czy automatycznie uploadować plik po wybraniu */
    autoUpload?: boolean;
    /** Callback z URL po udanym uploadzie */
    onUploadSuccess?: (url: string) => void;
}




const ImageUploader: React.FC<ImageUploaderProps> = ({
                                                         currentImageUrl,
                                                         selectedFile,
                                                         onFileSelect,
                                                         onCurrentImageRemove,
                                                         className = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                         label,
                                                         previewWidth = "w-32",
                                                         previewHeight = "h-20",
                                                         showPreview = true,
                                                         placeholder,
                                                         autoUpload = false,
                                                         onUploadSuccess,
                                                         required = false
                                                     }) => {

    const [isUploading, setIsUploading] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [selectedImageLoading, setSelectedImageLoading] = useState(true);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        onFileSelect(file);

        setIsUploading(true);
        if (file && autoUpload && onUploadSuccess) {

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await apiFetch('/files/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    const uploadedUrl = data.sizes?.['2k'] || data.url; // Użyj największego rozmiaru
                    onUploadSuccess(uploadedUrl);
                    toast.success('Zdjęcie zostało przesłane');
                } else {
                    toast.error('Błąd podczas przesyłania zdjęcia');
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Błąd podczas przesyłania zdjęcia');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveCurrentImage = () => {
        if (onCurrentImageRemove) {
            onCurrentImageRemove();
        }
    };

    const handleRemoveSelectedFile = () => {
        onFileSelect(null);
    };

    return (
        <div>
            {label && (
                <label className="block text-sm mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="flex items-center gap-3">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={className}
                    placeholder={placeholder}
                    disabled={isUploading}
                />

                {isUploading && (
                    <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    </div>
                )}
            </div>

            {showPreview && (
                <div className="mt-2">
                    {/* Podgląd zdjęcia z backendu */}
                    {currentImageUrl && !selectedFile && (
                        <div className={`relative ${previewWidth} ${previewHeight} mb-2`}>


                            <img
                                src={getImageUrl(currentImageUrl)}
                                alt="Current image"
                                className="w-full h-full object-cover rounded"
                            />
                            {onCurrentImageRemove && (
                                <button
                                    type="button"
                                    onClick={handleRemoveCurrentImage}
                                    className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                                    title="Usuń zdjęcie"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}

                    {/* Podgląd nowo wybranego pliku */}
                    {selectedFile && (
                        <div className={`relative ${previewWidth} ${previewHeight} mb-2`}>
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Selected image"
                                className="w-full h-full object-cover rounded"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveSelectedFile}
                                className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                                title="Usuń wybrany plik"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default ImageUploader;