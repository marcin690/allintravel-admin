// src/app/shared/types/trip.types.ts

// --- Stałe UI / słowniki ---
export const VOIVODESHIPS = [
    { value: 'DOLNOSLASKIE', label: 'Dolnośląskie' },
    { value: 'KUJAWSKO_POMORSKIE', label: 'Kujawsko-pomorskie' },
    { value: 'LUBELSKIE', label: 'Lubelskie' },
    { value: 'LUBUSKIE', label: 'Lubuskie' },
    { value: 'LODZKIE', label: 'Łódzkie' },
    { value: 'MALOPOLSKIE', label: 'Małopolskie' },
    { value: 'MAZOWIECKIE', label: 'Mazowieckie' },
    { value: 'OPOLSKIE', label: 'Opolskie' },
    { value: 'PODKARPACKIE', label: 'Podkarpackie' },
    { value: 'PODLASKIE', label: 'Podlaskie' },
    { value: 'POMORSKIE', label: 'Pomorskie' },
    { value: 'SLASKIE', label: 'Śląskie' },
    { value: 'SWIETOKRZYSKIE', label: 'Świętokrzyskie' },
    { value: 'WARMINSKO_MAZURSKIE', label: 'Warmińsko-mazurskie' },
    { value: 'WIELKOPOLSKIE', label: 'Wielkopolskie' },
    { value: 'ZACHODNIOPOMORSKIE', label: 'Zachodniopomorskie' },
];

export const PARTICIPANT_BRACKETS = [
    { min: 25, label: 'min. 25 os.' },
    { min: 45, label: 'min. 45 os.' },
    { min: 60, label: 'min. 60 os.' },
];

// --- Terminy INDYWIDUALNE ---
export type IndividualTermDTO = {
    id?: number;
    startDate: string;
    endDate: string;
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
    totalCapacity: number;
    reserved?: number;
    pricePerPerson: number;
    internalNotes?: string;
    travelPayProductUrl:string;
    travelManagerProductId: string
};

// --- Terminy GRUPOWE ---
export type GroupPriceDTO = {
    voivodeship: string;        // np. "MAZOWIECKIE"
    pricePerPerson: number;
};

export type GroupBracketDTO = {
    minParticipants: '25' | '45' | '60';
    freeSpotsPerBooking?: number | null;
    prices: GroupPriceDTO[];
    totalCapacity?: number | null;
};

export type GroupTermDTO = {
    id?: number;
    startDate?: string;
    endDate?: string;
    isPricingTemplate?: boolean;
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
    totalCapacity: number;
    reservedPaid?: number;
    reservedFree?: number;
    internalNotes?: string;
    brackets: GroupBracketDTO[];
};

// --- Unia na potrzeby wspólnego pola `terms` ---
export type TermDTO = IndividualTermDTO | GroupTermDTO;

// --- Pozostałe DTO używane w formularzu ---
export type ItineraryDayDTO = {
    dayNumber: number;
    title: string;
    description: string;
    imageUrl?: string;
    longDescriptionForOffer?: string;
    specDateForOffer?: string;
    subtitle?: string;

};

export type DepartureOptionDTO = {
    locationName: string; // NOT NULL
    pickupPoint?: string;
    priceAdjustment?: number;
    departureTime?: string; // ISO
};

export type AvailableDateDTO = {
    startDate: string;
    endDate: string;
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
    totalCapacity: number;
    price?: number;
};

export type AddonDTO = {
    id: number;
    name: string;
    price?: number;
    description?: string;
    active: boolean;
}

export type TripType =
    | 'INDIVIDUAL'
    | 'SCHOOL'
    | 'SENIOR'
    | 'PILGRIMAGE'
    | 'CORPORATE';

export type TripStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type TripCreateUpdateDTO = {
    name: string;
    status: TripStatus;
    shortDescription?: string;
    longDescription?: string;
    mainImageUrl?: string;
    galleryImageUrls?: string[];
    ratePerKm?: number;
    tripType: TripType;
    featured: boolean;
    categoryId: number;
    transportType?: 'COACH' | 'FLIGHT' | 'OWN_TRANSPORT' | 'TRAIN' | 'SHIP';
    durationDays: number;
    country?: string;
    region?: string;
    priceIncludes?: string;
    priceExcludes?: string;
    hasAvailableDates?: boolean;
    additionalInformation: string;
    startingPriceWithoutDate?: number;
    tagNames?: string[];
    itineraryDays: ItineraryDayDTO[];
    departureOptions?: DepartureOptionDTO[];

    terms: TermDTO[];
    availableDates?: AvailableDateDTO[]; // używasz tego w AddTripForm

    metaTitle?: string;
    metaDescription?: string;

    corporatePricePerPerson?: number; // dla CORPORATE
    extraFields?: any[];
};

// „szerszy” DTO dla edycji: to co przychodzi z backendu
export type TripDetailsDTO = TripCreateUpdateDTO & {
    id: number;
    category?: { id: number } | null;
    tags?: { name: string }[];
};
