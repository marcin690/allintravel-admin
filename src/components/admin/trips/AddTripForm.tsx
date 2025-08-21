"use client"

import React, {useState, FormEvent, useEffect} from "react";
import {
    TripCreateUpdateDTO,
    TripDetailsDTO,
    ItineraryDayDTO,
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
import {ErrorBar} from "recharts";

interface TripFormProps {
    initialData?: TripDetailsDTO;
}



const TripForm: React.FC<TripFormProps> = ({initialData}) => {

    const isEditMode = Boolean(initialData)



    const [tripData, setTripData] = useState<TripCreateUpdateDTO>({
        name: '',
        status: 'DRAFT',
        shortDescription: '',
        longDescription: '',
        mainImageUrl: '',
        featured: false,
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
        tagNames: [],
        itineraryDays: [],
        departureOptions: [],
        terms: [],
        metaTitle: '',
        metaDescription: '',
        corporatePricePerPerson: undefined, // tylko gdy używasz CORP
    });

    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImageUrl, setMainImageUrl] = useState<string | null>(null)
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
    const [extraFields, setExtraFields] = React.useState<ExtraFieldNodeFE[]>([]);


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
            categoryId: initialData.category?.id ?? 0,
            transportType: initialData.transportType ?? 'COACH',
            durationDays: initialData.durationDays ?? 0,
            country: initialData.country ?? '',
            region: initialData.region ?? '',
            priceIncludes: initialData.priceIncludes ?? '',
            priceExcludes: initialData.priceExcludes ?? '',
            hasAvailableDates: initialData.hasAvailableDates ?? true,

            tagNames: (initialData.tags ?? []).map(t => t.name),

            itineraryDays: (initialData.itineraryDays ?? []).map(d => ({
                dayNumber: Number(d.dayNumber),
                title: d.title ?? '',
                description: d.description ?? '',
            })),

            departureOptions: initialData.departureOptions ?? [],


            terms: initialData.terms ?? [],

            metaTitle: initialData.metaTitle ?? '',
            metaDescription: initialData.metaDescription ?? '',


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
    }

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
            description: ""
        }

        const newListOfDays = [...tripData.itineraryDays, newDay];
        setTripData({
            ...tripData,
            itineraryDays: newListOfDays
        })
    }

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

        // 1) Walidacje szybkie
        if (tripData.itineraryDays.some(d => !d.description?.trim())) {
            toast.error('Każdy dzień programu musi mieć opis.');
            return;
        }
        if ((tripData.departureOptions ?? []).some(o => !o.locationName?.trim())) {
            toast.error('Każda lokalizacja wyjazdu musi mieć nazwę (locationName).');
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
                const ct = res.headers.get('content-type') || '';
                msg += ct.includes('application/json')
                    ? `: ${(await res.json())?.message ?? JSON.stringify(await res.json())}`
                    : `: ${await res.text()}`;
            } catch {}
            toast.error(msg);
            console.error('Trip save failed:', res);
            return;
        }

        // 5) Sukces – TripDetailsDTO
        const data = await res.json();
        toast.success(isEditMode ? 'Wycieczka zaktualizowana!' : 'Wycieczka dodana!');
        console.log('Trip saved:', data);
    };

    function normalizeTripDto(data: TripCreateUpdateDTO): TripCreateUpdateDTO {
        const dto: TripCreateUpdateDTO = { ...data };

        // Wymuś liczby tam, gdzie trzeba
        dto.categoryId = Number(dto.categoryId);
        if (dto.ratePerKm !== undefined && dto.ratePerKm !== null) {
            dto.ratePerKm = Number(dto.ratePerKm);
        }

        // Itinerary: upewnij się, że wszystkie dni mają description
        dto.itineraryDays = (dto.itineraryDays ?? []).map(d => ({
            dayNumber: Number(d.dayNumber),
            title: d.title ?? '',
            description: d.description ?? '', // backend ma NOT NULL
        }));

        // DepartureOptions: pilnuj locationName
        dto.departureOptions = (dto.departureOptions ?? []).map(o => ({
            locationName: o.locationName?.trim() ?? '', // NOT NULL
            pickupPoint: o.pickupPoint ?? undefined,
            priceAdjustment: o.priceAdjustment !== undefined && o.priceAdjustment !== null ? Number(o.priceAdjustment) : undefined,
            departureTime: o.departureTime ?? undefined,
        }));

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
                    brackets: (gt.brackets ?? []).map((b: any) => ({
                        minParticipants: String(b.minParticipants) as '25'|'45'|'60', // <-- string
                        freeSpotsPerBooking: b.freeSpotsPerBooking ?? null,
                        prices: (b.prices ?? []).map((p: any) => ({
                            voivodeship: p.voivodeship,
                            pricePerPerson: Number(p.pricePerPerson ?? 0),
                        })),
                    })),
                };
            });
        } else if (dto.tripType === 'CORPORATE') {
            dto.terms = []; // brak terminów
        }

        return dto;
    }

    // Style dla inputów, aby uniknąć powtarzania
    const inputClassName = "w-full px-3.5 py-2 text-sm h-10 rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const textareaClassName = "w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-grow flex-col @container [&_label]:font-medium">
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
                                <label className="block text-sm mb-1.5">Główne zdjęcie</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        setMainImageFile(e.target.files?.[0] ?? null);
                                        setMainImageUrl(null); // wyczyść URL jeśli dodano nowe
                                    }}
                                    className={inputClassName}
                                />

                                {/* Podgląd z backendu */}
                                {mainImageUrl && (
                                    <div className="mt-2 relative w-32 h-20 mb-2">
                                        <img src={getImageUrl(mainImageUrl)}
                                             className="w-full h-full object-cover rounded"/>
                                        <button
                                            type="button"
                                            onClick={() => setMainImageUrl(null)}
                                            className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}


                                {mainImageFile && !mainImageUrl && (
                                    <div className="relative w-32 h-20 mb-2">
                                        <img src={URL.createObjectURL(mainImageFile)}
                                             className="w-full h-full object-cover rounded"/>
                                        <button
                                            type="button"
                                            onClick={() => setMainImageFile(null)}
                                            className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}


                            </div>

                            <div>
                                <label className="block text-sm mb-1.5">Galeria zdjęć</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        if (!e.target.files) return;
                                        setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files)]);
                                    }}
                                    className={inputClassName}
                                />

                                {/* Podgląd galerii */}
                                <div className="mt-2 grid grid-cols-4 gap-2 mt-2">
                                    {/* Zdjęcia z backendu */}
                                    {galleryImageUrls.map((url, idx) => (
                                        <div key={`url-${idx}`} className="relative">
                                            <img src={getImageUrl(url)} className="w-full h-24 object-cover rounded"/>
                                            <button
                                                type="button"
                                                onClick={() => setGalleryImageUrls(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    {/* Nowe pliki */}
                                    {galleryFiles.map((file, idx) => (
                                        <div key={`file-${idx}`} className="relative">
                                            {file instanceof File && (
                                                <img src={URL.createObjectURL(file)}
                                                     className="w-full h-24 object-cover rounded"/>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                                    <p className="mt-1 text-xs text-yellow-500">Nie możesz edytować typu wycieczki po zapisaniu.</p>
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
                            <h5 className="text-lg font-semibold">Plan Wycieczki</h5>
                            <p className="mt-1 text-sm text-gray-500">Rozpisz program dzień po dniu.</p>
                        </header>
                        <div className="col-span-4">
                            <div className="space-y-4">
                                {tripData.itineraryDays.map((day, index) => (
                                    <div key={index} className="grid grid-cols-1 gap-4 border p-4 rounded-md relative">
                                        <button type="button" onClick={() => removeItineraryDay(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                                        <div className="grid grid-cols-6 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm mb-1.5">Dzień</label>
                                                <input type="number" value={day.dayNumber}
                                                       onChange={(e) => handleItineraryChange(index, 'dayNumber', Number(e.target.value))}
                                                       className={inputClassName}/>
                                            </div>
                                            <div className="col-span-5">
                                                <label className="block text-sm mb-1.5">Tytuł</label>
                                                <input type="text" value={day.title}
                                                       onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                                                       className={inputClassName}/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1.5">Opis</label>
                                            <RichTextEditor
                                                value={day.description}
                                                onChange={(data) => handleItineraryDescriptionChange(index, data)}
                                            />

                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addItineraryDay}
                                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">
                                Dodaj Dzień
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
                onChange={(seo) => setTripData(prev => ({...prev, ...seo}))}
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