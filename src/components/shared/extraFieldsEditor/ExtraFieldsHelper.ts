import type { ExtraFieldNodeFE } from "@/types/extra-fields";

/** Usuwa pola frontendowe (_file) i zostawia czysty JSON do wysyłki na backend. */
export function sanitizeExtraFields(nodes: ExtraFieldNodeFE[] = []): any[] {
    return nodes.map((n) => {
        const { _file, ...rest } = n;
        if (n.type === "REPEATER" && n.rows) {
            return { ...rest, rows: n.rows.map((row) => sanitizeExtraFields(row)) };
        }
        return rest;
    });
}

/** Zbiera pliki IMAGE w kolejności DFS, zgodnej z ExtraFieldFileHelper po stronie backendu. */
export function collectImageFilesDFS(
    nodes: ExtraFieldNodeFE[] = [],
    acc: File[] = []
): File[] {
    for (const n of nodes) {
        if (n.type === "IMAGE" && n._file) acc.push(n._file);
        if (n.type === "REPEATER" && n.rows) {
            for (const row of n.rows) collectImageFilesDFS(row, acc);
        }
    }
    return acc;
}

// utils/ExtraFieldsHelper.ts
export function appendExtraFieldsToFormData(
    formData: FormData,
    tripJson: any,
    extraFields: ExtraFieldNodeFE[]
): void {
    const efJson = sanitizeExtraFields(extraFields);
    tripJson.extraFields = efJson;

    formData.append("trip", new Blob([JSON.stringify(tripJson)], { type: "application/json" }));

    const efFiles = collectImageFilesDFS(extraFields);
    efFiles.forEach((f) => formData.append("files", f));
}