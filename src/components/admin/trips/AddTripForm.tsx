"use client"

import React, {useState, FormEvent, useEffect} from "react";
import {
    TripCreateUpdateDTO,
    TripDetailsDTO,
    ItineraryDayDTO,
    AddonDTO,
    TermDTO,
    DepartureOptionDTO,
    PARTICIPANT_BRACKETS, // Pamiętaj, aby importować z poprawnego pliku
    VOIVODESHIPS,       // Pamiętaj, aby importować z poprawnego pliku
} from '@/app/shared/types/tripe.types';
import {apiFetch} from "@/utils/auth";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {getImageUrl} from "@/utils/getImageUrl";

import GroupTermPricingEditor from "@/app/admin/trips/add/components/GroupTermPricingEditor";
import {toast} from "react-toastify";
import CategorySelect from "@/app/admin/trips/add/components/CategorySelect";
import TagPicker from "@/app/admin/trips/add/components/TagPicker";
import IndividualTermsTable from "@/app/admin/trips/add/components/IndividualTermPricingEditor";
import DepartureOptionsEditor from "@/app/admin/trips/add/components/DepartureOptionsEditor";
import SeoFields from "@/app/shared/SeoFields";
import {ExtraFieldNodeFE} from "@/app/shared/types/extraFields";
import ExtraFieldsEditor from "@/components/shared/extraFieldsEditor/ExtraFieldsEditor";
import { sanitizeExtraFields, collectImageFilesDFS } from "@/utils/ExtraFieldsHelper";
import {appendExtraFieldsToFormData} from "@/components/shared/extraFieldsEditor/ExtraFieldsHelper";

import AddonsEditor from "@/app/admin/trips/add/components/AddonsEditor";
import ImageUploader from "@/components/shared/ImageUploader";
import ItineraryDayEditor from "@/app/admin/trips/add/components/ItineraryDayEditor";
import {useRouter} from "next/navigation";
import GalleryUploader from "@/app/admin/trips/add/components/GalleryUploader";

interface TripFormProps {
    initialData?: TripDetailsDTO;
}





const TripForm: React.FC<TripFormProps> = ({initialData}) => {

    const isEditMode = Boolean(initialData)
    const router = useRouter();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [tripData, setTripData] = useState<TripCreateUpdateDTO>({
        name: '',
        status: 'DRAFT',
        shortDescription: '',
        longDescription: '',
        mainImageUrl: '',
        featured: false,
        additionalInformation: "",
        ratePerKm: undefined,
        tripType: 'INDIVIDUAL',
        categoryId: 0,
        transportType: 'COACH',
        durationDays: 0,
        country: '',
        region: '',
        priceIncludes: '',
        priceExcludes: '',
        hasAvailableDates: true,
        startingPriceWithoutDate: undefined,
        tagNames: [],
        itineraryDays: [],
        departureOptions: [],
        terms: [],
        metaTitle: '',
        metaDescription: '',
        corporatePricePerPerson: undefined,
        addons: [],
        startGroupTripDateWithoutPricing: '',
        endGroupTripDateWithoutPricing: '',
    });

    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImageUrl, setMainImageUrl] = useState<string | null>(null)
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

    const [extraFields, setExtraFields] = React.useState<ExtraFieldNodeFE[]>([]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && !isSubmitting) {
                e.preventDefault();
                e.returnValue = ''; // Chrome wymaga ustawienia returnValue
                return 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?';
            }
        };


        window.addEventListener('beforeunload', handleBeforeUnload);


        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges, isSubmitting]);


    useEffect(() => {


        if (!isEditMode || !initialData) return;
        setExtraFields((initialData as any).extraFields ?? []);
        const dataForForm: TripCreateUpdateDTO = {
            name: initialData.name ?? '',
            status: initialData.status ?? 'DRAFT',
            shortDescription: initialData.shortDescription ?? '',
            longDescription: initialData.longDescription ?? '',
            mainImageUrl: initialData.mainImageUrl ?? '',
            featured: initialData.featured ?? false,
            galleryImageUrls: initialData.galleryImageUrls ?? [],
            tripType: initialData.tripType,
            startingPriceWithoutDate: initialData.startingPriceWithoutDate ?? undefined,
            categoryId: initialData.category?.id ?? 0,
            transportType: initialData.transportType ?? 'COACH',
            durationDays: initialData.durationDays ?? 0,
            country: initialData.country ?? '',
            region: initialData.region ?? '',
            priceIncludes: initialData.priceIncludes ?? '',
            priceExcludes: initialData.priceExcludes ?? '',
            additionalInformation: initialData.additionalInformation ?? '',
            hasAvailableDates: initialData.hasAvailableDates ?? true,
            addons: initialData.addons ?? [],
            tagNames: (initialData.tags ?? []).map(t => t.name),
            startGroupTripDateWithoutPricing: (initialData as any).startGroupTripDateWithoutPricing ?? '',
            endGroupTripDateWithoutPricing: (initialData as any).endGroupTripDateWithoutPricing ?? '',
            itineraryDays: (initialData.itineraryDays ?? []).map(d => ({
                id: d.id,
                dayNumber: Number(d.dayNumber),
                title: d.title ?? '',
                subtitle: d.subtitle ?? '',
                description: d.description ?? '',
                longDescriptionForOffer: d.longDescriptionForOffer ?? '',
                imageUrl: d.imageUrl ?? '',
            })),

            departureOptions: initialData.departureOptions ?? [],


            terms: initialData.terms ?? [],

            metaTitle: initialData.seo?.metaTitle || (initialData as any).metaTitle || '',
            metaDescription: initialData.seo?.metaDescription || (initialData as any).metaDescription || '',

            corporatePricePerPerson: (initialData as any).corporatePricePerPerson ?? undefined,

        };
        setTripData(dataForForm);


        setMainImageUrl(initialData.mainImageUrl ?? null);
        setGalleryImageUrls(initialData.galleryImageUrls ?? []);

    }, [isEditMode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        const isNumberField = ['durationDays', 'categoryId','ratePerKm' ].includes(name);


        setTripData(prevData => ({
            ...prevData,
            [name]: isNumberField ? Number(value) : value
        }))

        setHasUnsavedChanges(true);
    }

    const handleSeoChange = (seoData: {metaTitle: string, metaDescription: string}) => {
        setTripData(prev => ({
            ...prev,
            metaTitle: seoData.metaTitle,
            metaDescription: seoData.metaDescription
        }));
        setHasUnsavedChanges(true);
    };


    const handleMainImageUploadSuccess = (uploadedUrl: string) => {
        setMainImageUrl(uploadedUrl);
        setMainImageFile(null);
        setTripData(prev => ({ ...prev, mainImageUrl: uploadedUrl }));
        setHasUnsavedChanges(true);
    };

    const handleMainImageRemove = () => {
        setMainImageUrl(null);
        setTripData(prev => ({ ...prev, mainImageUrl: '' }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        // Sprawdź, czy klawisz to Enter i czy został naciśnięty wewnątrz pola <input>
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName.toLowerCase() === 'input') {
            // Zablokuj domyślne zachowanie (wysłanie formularza)
            e.preventDefault();
        }
    };


    const addTerm = () => {
        if (isGroupTrip) {
            const newTerm: TermDTO = {
                startDate: '',
                endDate: '',
                status: 'AVAILABLE',
                totalCapacity: 50,
                brackets: PARTICIPANT_BRACKETS.map(b => ({
                    minParticipants: String(b.min) as '25'|'45'|'60',  // <-- string
                    freeSpotsPerBooking: 0,
                    prices: VOIVODESHIPS.map(v => ({
                        voivodeship: v.value,
                        pricePerPerson: undefined as unknown as number,
                    })),
                })),
            } as any;
            setTripData(prev => ({ ...prev, terms: [...prev.terms, newTerm] }));
        } else if (isIndividual) {
            const newTerm: TermDTO = {
                startDate: '',
                endDate: '',
                status: 'AVAILABLE',
                totalCapacity: 0,
                reserved: 0,
                pricePerPerson: 0,
            } as any;
            setTripData(prev => ({ ...prev, terms: [...prev.terms, newTerm] }));
        }
    };




    const removeTerm = (termIndex: number) => {
        setTripData(prev => ({ ...prev, terms: prev.terms.filter((_, i) => i !== termIndex) }));
    };
    const handleTermChange = (termIndex: number, updatedTerm: TermDTO) => {
        setTripData(prev => {
            const newTerms = [...prev.terms];
            newTerms[termIndex] = updatedTerm;
            return { ...prev, terms: newTerms };
        });
    };

    const isGroupTrip = ['SCHOOL', 'SENIOR', 'PILGRIMAGE'].includes(tripData.tripType);
    const isIndividual = tripData.tripType === "INDIVIDUAL";
    const isCorporate  = tripData.tripType === "CORPORATE";

    const addItineraryDay = () => {
        const newDay: ItineraryDayDTO = {
            dayNumber: tripData.itineraryDays.length + 1,
            title: "",
            subtitle: "",
            description: "",
            longDescriptionForOffer: "",

            imageUrl: ""
        };

        setTripData(prev => ({
            ...prev,
            itineraryDays: [...prev.itineraryDays, newDay]
        }));
    };



    const removeItineraryDay = (indexToRemove: number) => {
        const oldListOfDays = tripData.itineraryDays;
        const newListOfDays = oldListOfDays.filter((_, currentIndex) => {
            return currentIndex !== indexToRemove;
        })

        setTripData({
            ...tripData,
            itineraryDays: newListOfDays
        })
    }

    const handleItineraryChange = (index: number, field: keyof ItineraryDayDTO, value: string | number) => {
        const newListOfDays = [...tripData.itineraryDays]
        const dayToUpdate = newListOfDays[index];
        dayToUpdate[field] = value as never;

        setTripData({
            ...tripData,
            itineraryDays: newListOfDays
        })
    }

    const handleItineraryDescriptionChange = (index: number, value: string) => {
        const newListOfDays = [...tripData.itineraryDays];
        newListOfDays[index].description = value;
        setTripData(prev => ({ ...prev, itineraryDays: newListOfDays }));
    };

    const addAvailableDate = () => {
        setTripData(prev => ({
            ...prev,
            availableDates: [
                ...prev.availableDates,
                { startDate: '', endDate: '', status: 'AVAILABLE', totalCapacity: 0, price: undefined }
            ]
        }));
    };

    const removeAvailableDate = (idx: number) => {
        setTripData(prev => ({
            ...prev,
            availableDates: prev.availableDates.filter((_, i) => i !== idx)
        }));
    };

    const handleAvailableDateChange = (idx: number, field: keyof AvailableDateDTO, value: string|number) => {
        setTripData(prev => {
            const dates = [...prev.availableDates];
            (dates[idx] as any)[field] = value;
            return { ...prev, availableDates: dates };
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 1) Walidacje szybkie
        if (tripData.itineraryDays.some(d => !d.description?.trim())) {
            toast.error('Każdy dzień programu musi mieć opis.');
            return;
        }

        if (isIndividual && !tripData.hasAvailableDates) {
            toast.error("Wyjazd indywidualny musi mieć predefiniowane terminy.");
            return;
        }

        if (!tripData.categoryId || tripData.categoryId <= 0) {
            toast.error("Musisz wybrać kategorię przed zapisaniem wycieczki.");
            return;
        }

        if ((tripData.departureOptions ?? []).some(o => !o.locationName?.trim())) {
            toast.error('Każda lokalizacja wyjazdu musi mieć nazwę (locationName).');
            return;
        }


        if ((tripData.terms ?? []).some(term => {
            const url = (term as any).travelPayProductUrl;
            return url && !url.match(/^https?:\/\//);
        })) {
            toast.error('Wszystkie linki TravelPay muszą zaczynać się od http:// lub https://');
            return;
        }

        // 2) Zbuduj DTO z poprawnym mainImageUrl ZANIM pójdziesz do helpera
        const dtoForJson = normalizeTripDto({
            ...tripData,
            mainImageUrl: !mainImageFile && mainImageUrl ? mainImageUrl : tripData.mainImageUrl

        });

        // 3) FormData
        const formData = new FormData();

        // trip (JSON) + extraFields (JSON) + files[] z extraFields — WSZYSTKO w helperze
        appendExtraFieldsToFormData(formData, dtoForJson, extraFields);

        // główne zdjęcie (plik) – tylko jeśli wybrano nowy
        if (mainImageFile) formData.append('mainImage', mainImageFile);

        // galeria
        galleryFiles.forEach(f => formData.append('gallery', f));

        // DEBUG: zobacz co faktycznie wysyłasz
        for (const [k, v] of formData.entries()) {
            console.log(k, v instanceof File ? `File(${v.name})` : v);
        }

        const endpoint = isEditMode ? `/trips/${initialData!.id}` : '/trips';
        const method = isEditMode ? 'PATCH' : 'POST';

        const res = await apiFetch(endpoint, { method, body: formData });

        // 4) Twarda obsługa odpowiedzi
        if (!res.ok) {
            let msg = `Błąd ${res.status}`;
            try {
                // spróbuj odczytać payload błędu (JSON lub text)
                setIsSubmitting(false);
                const ct = res.headers.get('content-type') || '';
                msg += ct.includes('application/json')
                    ? `: ${(await res.json())?.message ?? JSON.stringify(await res.json())}`
                    : `: ${await res.text()}`;
            } catch {}
            toast.error(msg);
            console.error('Trip save failed:', res);
            return;
        }

        setHasUnsavedChanges(false);
        setIsSubmitting(false);

        // 5) Sukces – TripDetailsDTO
        const data = await res.json();
        toast.success(isEditMode ? 'Wycieczka zaktualizowana!' : 'Wycieczka dodana!');
        console.log('Trip saved:', data);
        setTimeout(() => router.push("/admin/trips"), 1500);

    };

    function normalizeTripDto(data: TripCreateUpdateDTO): TripCreateUpdateDTO {
        const dto: TripCreateUpdateDTO = { ...data };

        // Wymuś liczby tam, gdzie trzeba
        dto.categoryId = Number(dto.categoryId);
        if (dto.ratePerKm !== undefined && dto.ratePerKm !== null) {
            dto.ratePerKm = Number(dto.ratePerKm);
        }

        dto.addons = (dto.addons ?? []).map(addon => ({
            id: addon.id, // może być undefined dla nowych
            name: addon.name.trim(),
            price: Number(addon.price ?? 0),
            description: addon.description?.trim() || undefined,
        })).filter(addon => addon.name);

        // Itinerary: upewnij się, że wszystkie dni mają wymagane pola
        dto.itineraryDays = (dto.itineraryDays ?? []).map(d => ({
            id: d.id,
            dayNumber: Number(d.dayNumber),
            title: d.title?.trim() ?? '',
            subtitle: d.subtitle?.trim() || undefined,
            description: d.description ?? '', // backend ma NOT NULL
            longDescriptionForOffer: d.longDescriptionForOffer?.trim() || undefined,
            imageUrl: d.imageUrl?.trim() || undefined,
        }));
        dto.galleryImageUrls = [...galleryImageUrls];

        // DepartureOptions: pilnuj locationName
        dto.departureOptions = (dto.departureOptions ?? []).map(o => ({
            locationName: o.locationName?.trim() ?? '', // NOT NULL
            pickupPoint: o.pickupPoint ?? undefined,
            priceAdjustment: o.priceAdjustment !== undefined && o.priceAdjustment !== null ? Number(o.priceAdjustment) : undefined,
            departureTime: o.departureTime ?? undefined,
        }));

        dto.metaTitle = dto.metaTitle || '';
        dto.metaDescription = dto.metaDescription || '';

        // Terms w zależności od typu
        if (dto.tripType === 'INDIVIDUAL') {
            dto.terms = (dto.terms ?? []).map(t => {
                const it = t as any;
                return {
                    id: it.id,
                    startDate: it.startDate,
                    endDate: it.endDate,
                    status: it.status ?? 'AVAILABLE',
                    totalCapacity: Number(it.totalCapacity ?? 0),
                    reserved: it.reserved !== undefined ? Number(it.reserved) : 0,
                    pricePerPerson: Number(it.pricePerPerson ?? 0),
                    internalNotes: it.internalNotes ?? undefined,
                    travelPayProductUrl: it.travelPayProductUrl ?? undefined,
                    travelPayProductId: it.travelPayProductId ?? undefined,
                };
            });
        } else if (['SCHOOL', 'SENIOR', 'PILGRIMAGE'].includes(dto.tripType)) {
            dto.terms = (dto.terms ?? []).map(t => {
                const gt = t as any;
                return {
                    id: gt.id,
                    startDate: gt.startDate,
                    endDate: gt.endDate,
                    status: gt.status ?? 'AVAILABLE',
                    totalCapacity: Number(gt.totalCapacity ?? 0),
                    reservedPaid: gt.reservedPaid ? Number(gt.reservedPaid) : 0,
                    reservedFree: gt.reservedFree ? Number(gt.reservedFree) : 0,
                    internalNotes: gt.internalNotes ?? undefined,
                    unavailableVoivodeships: gt.unavailableVoivodeships, // <-- Ważne, aby to pole było przekazywane
                    brackets: (gt.brackets ?? []).map((b: any) => ({
                        minParticipants: String(b.minParticipants) as '25'|'45'|'60',
                        freeSpotsPerBooking: b.freeSpotsPerBooking ?? null,
                        prices: (b.prices ?? []).map((p: any) => ({
                            voivodeship: p.voivodeship,
                            // ================== TUTAJ JEST POPRAWKA ==================
                            pricePerPerson: p.pricePerPerson != null ? Number(p.pricePerPerson) : null,
                            // =========================================================
                        })),
                    })),
                };
            });
        } else if (dto.tripType === 'CORPORATE') {
            dto.terms = []; // brak terminów
        }

        return dto;
    }

    const handleRemoveGalleryImage = async (index: number) => {
        const imageUrlToRemove = galleryImageUrls[index];

        try {
            const response = await apiFetch(`/files?url=${encodeURIComponent(imageUrlToRemove)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Usuń ze stanu dopiero po potwierdzeniu z backendu
                const newGalleryUrls = galleryImageUrls.filter((_, i) => i !== index);
                setGalleryImageUrls(newGalleryUrls);
                setTripData(prev => ({
                    ...prev,
                    galleryImageUrls: newGalleryUrls
                }));
                setHasUnsavedChanges(true);
                toast.success('Zdjęcie zostało usunięte z galerii. Pamiętaj o zapisaniu zmian!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Błąd podczas usuwania zdjęcia');
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Błąd podczas usuwania zdjęć');
        }
    };

    // Style dla inputów, aby uniknąć powtarzania
    const inputClassName = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const textareaClassName = "w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    return (
        <form onSubmit={handleSubmit}   onKeyDown={handleKeyDown} noValidate className="flex flex-grow flex-col @container [&_label]:font-medium">
            <div className="flex-grow pb-10">
                <div className="grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12">

                    {/* --- SEKCJA 1: PODSTAWOWE INFORMACJE --- */}
                    <section className="@5xl:grid @5xl:grid-cols-6 pt-8">
                        <header className="col-span-2 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Podstawowe Informacje</h5>
                            <p className="mt-1 text-sm text-gray-500">Główne dane identyfikujące wycieczkę.</p>
                        </header>
                        <div className="col-span-4 grid grid-cols-2 gap-3 @lg:gap-4 @2xl:gap-5">
                            <div className="col-span-2">
                                <label className="block text-sm mb-1.5">Nazwa Wycieczki</label>
                                <input type="text" name="name" value={tripData.name} onChange={handleChange}
                                       placeholder="np. Wakacje w Grecji" required className={inputClassName}/>
                            </div>
                            <div className="col-span-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="hasAvailableDates"

                                    checked={tripData.hasAvailableDates}
                                    onChange={e =>
                                        setTripData(prev => ({
                                            ...prev,
                                            hasAvailableDates: e.target.checked
                                        }))
                                    }
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="hasAvailableDates" className="text-sm text-gray-700">
                                    Wyjazd posiada pre-defioniwane terminy wyjazdów
                                </label>
                            </div>
                            <div className="col-span-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={tripData.featured}
                                    onChange={e =>
                                        setTripData(prev => ({
                                            ...prev,
                                            featured: e.target.checked
                                        }))
                                    }
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="featured" className="text-sm text-gray-700">
                                    Wyróżniony wyjazd
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm mb-1.5">Czas trwania (dni)</label>
                                <input type="number" name="durationDays" value={tripData.durationDays}
                                       onChange={handleChange} required className={inputClassName}/>
                            </div>
                            <div>
                                <label className="block text-sm mb-1.5">Status</label>
                                <select name="status" value={tripData.status} onChange={handleChange}
                                        className={inputClassName}>
                                    <option value="DRAFT">Roboczy</option>
                                    <option value="PUBLISHED">Opublikowany</option>
                                    <option value="ARCHIVED">Zarchiwizowany</option>
                                </select>
                            </div>

                            <div>
                                <ImageUploader
                                    label="Główne zdjęcie"
                                    currentImageUrl={mainImageUrl}
                                    selectedFile={mainImageFile}
                                    onFileSelect={setMainImageFile}
                                    onCurrentImageRemove={handleMainImageRemove}
                                    autoUpload={true}
                                    onUploadSuccess={handleMainImageUploadSuccess}
                                    className={inputClassName}
                                    required
                                />
                            </div>

                            <div>

                                <GalleryUploader
                                    currentImageUrls={galleryImageUrls}
                                    selectedFiles={galleryFiles}
                                    onFilesSelect={setGalleryFiles}
                                    onCurrentImageRemove={handleRemoveGalleryImage}
                                    autoUpload={true}
                                    onUploadSuccess={(urls) => {
                                        setGalleryImageUrls(prev => [...prev, ...urls]);
                                        setTripData(prev => ({
                                            ...prev,
                                            galleryImageUrls: [...prev.galleryImageUrls, ...urls]
                                        }));
                                        setHasUnsavedChanges(true);
                                    }}
                                    label="Galeria zdjęć"
                                    className={inputClassName}
                                />
                            </div>

                        </div>
                    </section>

                    {/* --- SEKCJA 2: OPISY --- */}
                    <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                        <header className="col-span-2 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Opisy i Treści</h5>
                            <p className="mt-1 text-sm text-gray-500">Teksty marketingowe widoczne dla klienta.</p>
                        </header>
                        <div className="col-span-4 grid grid-cols-1 gap-3 @lg:gap-4 @2xl:gap-5">
                            <div>
                                <label className="block text-sm mb-1.5">Krótki Opis</label>
                                <textarea name="shortDescription" value={tripData.shortDescription}
                                          onChange={handleChange} rows={3}
                                          placeholder="Zachęcający opis na listę ofert..."
                                          className={textareaClassName}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm mb-1.5">Długi Opis</label>
                                <RichTextEditor
                                    value={tripData.longDescription}
                                    onChange={(val) => setTripData(prev => ({...prev, longDescription: val}))}
                                />
                            </div>
                            <div>

                                <TagPicker
                                    value={tripData.tagNames || []}
                                    onChange={(next) => setTripData(prev => ({...prev, tagNames: next}))}
                                />

                            </div>
                        </div>
                    </section>

                    {/* --- SEKCJA 3: KATEGORYZACJA I LOGISTYKA --- */}
                    <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                        <header className="col-span-2 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Kategoryzacja i Logistyka</h5>
                            <p className="mt-1 text-sm text-gray-500">Typ, kategoria i szczegóły organizacyjne.</p>
                        </header>
                        <div className="col-span-4 grid grid-cols-2 gap-3 @lg:gap-4 @2xl:gap-5">
                            <div>
                                <label className="block text-sm mb-1.5">Typ Wycieczki</label>
                                <select
                                    name="tripType"
                                    value={tripData.tripType}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    disabled={isEditMode} // Disable the field in edit mode
                                >
                                    <option value="INDIVIDUAL">Indywidualna</option>
                                    <option value="SCHOOL">Szkolna</option>
                                    <option value="SENIOR">Dla Seniora</option>
                                    <option value="PILGRIMAGE">Pielgrzymka</option>
                                    <option value="CORPORATE">Firmowa</option>
                                </select>
                                {isEditMode && (
                                    <p className="mt-1 text-xs text-yellow-500">Nie możesz edytować typu wycieczki po
                                        zapisaniu.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm mb-1.5">Kategoria</label>
                                <CategorySelect
                                    tripType={tripData.tripType}
                                    value={tripData.categoryId}
                                    onChange={(id) => setTripData((prev) => ({...prev, categoryId: id}))}
                                    className={inputClassName}
                                    placeholder="Wybierz kategorię"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5">Transport</label>
                                <select name="transportType" value={tripData.transportType} onChange={handleChange}
                                        className={inputClassName}>
                                    <option value="COACH">Autokar</option>
                                    <option value="FLIGHT">Samolot</option>
                                    <option value="OWN_TRANSPORT">Dojazd własny</option>
                                    <option value="TRAIN">Pociąg</option>
                                    <option value="SHIP">Statek</option>
                                </select>
                            </div>
                            {/* Stawka za km – pokazujemy tylko, gdy grupowy i autokar */}


                        </div>
                    </section>

                    {/* --- SEKCJA 4: DANE ZŁOŻONE (JSON) --- */}
                    <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                        <header className="col-span-12 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Szczegóły Oferty</h5>
                            <p className="mt-1 text-sm text-gray-500">Plan, terminy, miejsca wyjazdu.</p>
                        </header>
                        <div className="col-span-12 grid grid-cols-1 gap-4">

                            {!tripData.hasAvailableDates && isGroupTrip && (
                                <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                                    <header className="col-span-2 mb-6 @5xl:mb-0">
                                        <h5 className="text-lg font-semibold">Zakres oferty</h5>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Cena i ogólny zakres dat dla wyjazdów bez zdefiniowanych terminów.
                                        </p>
                                    </header>

                                    <div className="col-span-4 grid grid-cols-1 @lg:grid-cols-3 gap-3 @lg:gap-4 @2xl:gap-5">
                                        {/* Pole Ceny */}
                                        <div>
                                            <label className="block text-sm mb-1.5">Cena "od" (PLN)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="startingPriceWithoutDate"
                                                value={tripData.startingPriceWithoutDate ?? ''}
                                                onChange={(e) =>
                                                    setTripData(prev => ({
                                                        ...prev,
                                                        startingPriceWithoutDate: e.target.value === '' ? undefined : Number(e.target.value)
                                                    }))
                                                }
                                                className={inputClassName}
                                                placeholder="np. 299.00"
                                            />
                                        </div>

                                        {/* 👇 NOWE POLE: DATA OD */}
                                        <div>
                                            <label className="block text-sm mb-1.5">Dostępny od</label>
                                            <input
                                                type="date"
                                                name="startGroupTripDateWithoutPricing"
                                                value={tripData.startGroupTripDateWithoutPricing ?? ''}
                                                onChange={handleChange} // Używamy tej samej funkcji obsługi
                                                className={inputClassName}
                                            />
                                        </div>

                                        {/* 👇 NOWE POLE: DATA DO */}
                                        <div>
                                            <label className="block text-sm mb-1.5">Dostępny do</label>
                                            <input
                                                type="date"
                                                name="endGroupTripDateWithoutPricing"
                                                value={tripData.endGroupTripDateWithoutPricing ?? ''}
                                                onChange={handleChange} // Używamy tej samej funkcji obsługi
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {tripData.hasAvailableDates && (
                                <>
                                    {isIndividual && (
                                        <>
                                            <h6 className="font-medium mb-2">Terminy (indywidualne)</h6>
                                            <IndividualTermsTable
                                                terms={tripData.terms || []}
                                                onChange={(next) => setTripData(prev => ({...prev, terms: next}))}
                                                inputClassName={inputClassName}
                                            />
                                        </>
                                    )}
                                    {isGroupTrip && (

                                        <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                                            <header className="col-span-12 mb-6 @5xl:mb-0">
                                                <h5 className="text-lg font-semibold">Cennik Grupowy</h5>
                                                <p className="mt-1 text-sm text-gray-500">Zdefiniuj terminy i ceny dla
                                                    wycieczek grupowych.</p>
                                            </header>
                                            <div className="col-span-12 space-y-6">
                                                {tripData.terms.map((term, index) => (
                                                    <GroupTermPricingEditor
                                                        key={index}
                                                        term={term}
                                                        termIndex={index}
                                                        onTermChange={handleTermChange}
                                                        onRemoveTerm={removeTerm}
                                                        inputClassName={inputClassName}
                                                    />
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addTerm}
                                                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                                                >
                                                    Dodaj Nowy Termin
                                                </button>
                                            </div>
                                        </section>
                                    )}


                                    {isIndividual && (
                                        <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                                            <header className="col-span-12 mb-6 @5xl:mb-0">
                                                <h5 className="text-lg font-semibold">Miejsca wyjazdu (przystanki)</h5>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Dodaj lokalizacje, ewentualne dopłaty oraz datę/godzinę wyjazdu.
                                                </p>
                                            </header>
                                            <div className="col-span-12">
                                                <DepartureOptionsEditor
                                                    value={tripData.departureOptions ?? []}
                                                    onChange={(next) =>
                                                        setTripData((prev) => ({...prev, departureOptions: next}))
                                                    }
                                                />
                                            </div>
                                        </section>
                                    )}

                                    {tripData.tripType === 'CORPORATE' && (
                                        <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                                            <header className="col-span-2 mb-6 @5xl:mb-0">
                                                <h5 className="text-lg font-semibold">Cena (wyjazd firmowy)</h5>
                                                <p className="mt-1 text-sm text-gray-500">Jedna cena, niezależna od
                                                    terminów.</p>
                                            </header>
                                            <div className="col-span-4 grid grid-cols-2 gap-3 @lg:gap-4 @2xl:gap-5">
                                                <div className="col-span-1">
                                                    <label className="block text-sm mb-1.5">Cena za osobę (PLN)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name="corporatePricePerPerson"
                                                        value={tripData.corporatePricePerPerson ?? ''}
                                                        onChange={(e) =>
                                                            setTripData(prev => ({
                                                                ...prev,
                                                                corporatePricePerPerson: e.target.value === '' ? undefined : Number(e.target.value)
                                                            }))
                                                        }
                                                        className={inputClassName}
                                                        placeholder="np. 199.99"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                </>

                            )}

                        </div>
                    </section>

                    <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                        <header className="col-span-2 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Dodatki</h5>
                            <p className="mt-1 text-sm text-gray-500">
                                Opcjonalne usługi i produkty dostępne do wycieczki.
                            </p>
                        </header>
                        <div className="col-span-4">
                            <AddonsEditor
                                value={tripData.addons || []}
                                onChange={(addons) => setTripData(prev => ({...prev, addons}))}
                                inputClassName={inputClassName}
                            />
                        </div>
                    </section>

                    <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                        <header className="col-span-2 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Plan Wycieczki</h5>
                            <p className="mt-1 text-sm text-gray-500">
                                Rozpisz program dzień po dniu z dodatkowymi polami.
                            </p>
                        </header>
                        <div className="col-span-4">
                            <div className="space-y-6">
                                {tripData.itineraryDays.map((day, index) => (
                                    <ItineraryDayEditor
                                        key={day.id || index} // Użyj ID jeśli dostępne
                                        day={day}
                                        index={index}
                                        onUpdate={handleItineraryChange}
                                        onRemove={removeItineraryDay}
                                        inputClassName={inputClassName}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addItineraryDay}
                                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                            >
                                Dodaj Nowy Dzień
                            </button>
                        </div>
                    </section>
                    <section className="@5xl:grid @5xl:grid-cols-6 pt-7 @2xl:pt-9 @3xl:pt-11">
                        <header className="col-span-2 mb-6 @5xl:mb-0">
                            <h5 className="text-lg font-semibold">Dodatkowe Informacje</h5>
                            <p className="mt-1 text-sm text-gray-500">Zawartość cenowa wycieczki.</p>
                        </header>
                        <div className="col-span-4 grid grid-cols-1 gap-3 @lg:gap-4 @2xl:gap-5">
                            {/* Price Includes */}
                            <div>
                                <label className="block text-sm mb-1.5">Cena zawiera</label>
                                <RichTextEditor
                                    value={tripData.priceIncludes}
                                    onChange={(data) =>
                                        setTripData((prev) => ({...prev, priceIncludes: data}))
                                    }
                                />
                            </div>

                            {/* Price Excludes */}
                            <div>
                                <label className="block text-sm mb-1.5">Cena nie zawiera</label>
                                <RichTextEditor
                                    value={tripData.priceExcludes}
                                    onChange={(data) =>
                                        setTripData((prev) => ({...prev, priceExcludes: data}))
                                    }
                                />
                            </div>


                            <div>
                                <label className="block text-sm mb-1.5">Dodatkowe informacje</label>
                                <RichTextEditor
                                    value={tripData.additionalInformation}
                                    onChange={(data) =>
                                        setTripData((prev) => ({...prev, additionalInformation: data}))
                                    }
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <section className="@5xl:grid @5xl:grid-cols-6 pt-7">
                <header className="col-span-2 mb-6 @5xl:mb-0">
                    <h5 className="text-lg font-semibold">Pola dodatkowe</h5>
                    <p className="mt-1 text-sm text-gray-500">Dowolne pola ACF-like.</p>
                </header>
                <div className="col-span-4">
                    <ExtraFieldsEditor
                        value={extraFields}
                        onChange={setExtraFields}
                        title="Pola dodatkowe"
                    />
                </div>
            </section>

            <SeoFields
                value={{metaTitle: tripData.metaTitle ?? '', metaDescription: tripData.metaDescription ?? ''}}
                onChange={handleSeoChange}
            />

            <div
                className="sticky bottom-0 left-0 right-0 z-10 -mb-8 flex items-center justify-end gap-4 border-t bg-white px-4 py-4 md:px-5 lg:px-6 3xl:px-8 4xl:px-10 dark:bg-gray-50 -mx-4 md:-mx-5 lg:-mx-6 3xl:-mx-8 4xl:-mx-10">
                <button type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 w-full @xl:w-auto">
                    Anuluj
                </button>
                <button type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-full @xl:w-auto">
                    {isEditMode ? 'Zapisz Zmiany' : 'Dodaj Wycieczkę'}
                </button>
            </div>


        </form>
    );

}

export default TripForm;