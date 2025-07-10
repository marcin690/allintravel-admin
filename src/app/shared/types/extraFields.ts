export type ExtraFieldType = 'TEXT' | 'LONG_TEXT' | 'IMAGE' | 'REPEATER' | 'LINK';

export interface ExtraFieldNodeFE {
    key: string;
    label: string;
    type: ExtraFieldType;

    textValue?: string;
    longTextValue?: string;
    imageValue?: string;
    linkValue?: string;
    visiblePublicLabel?: string;

    // REPEATER: tablica wierszy, każdy wiersz to lista pól
    rows?: ExtraFieldNodeFE[][];

    // FRONT-ONLY: plik wybrany przez użytkownika (dla IMAGE)
    _file?: File | null;
}