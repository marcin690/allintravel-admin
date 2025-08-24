// src/app/shared/types/category.types.ts

export interface CategoryDTO {
    id: number;
    name: string;
    slug: string;
    tripType: string;
    description?: string;
    imageUrl?: string;
    iconUrl?: string;
    parentId?: number | null;
    metaTitle?: string;
    metaDescription?: string;
    order?: number;
    children?: CategoryDTO[];
}

export interface CreateCategoryDTO {
    name: string;
    tripType: string;
    parentId?: number | null;
    order?: number;
    metaTitle?: string;
    metaDescription?: string;
}