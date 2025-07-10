import AddTripForm from "@/components/admin/trips/AddTripForm";

export default function AddTripPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Dodaj nową wycieczkę</h1>

            {/* Renderer nasz komponent formularza */}
            <AddTripForm/>
        </div>
    )
}