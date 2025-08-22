// Importujemy funkcję 'dynamic' z biblioteki Next.js
import dynamic from 'next/dynamic';

// Zamiast importować AddTripForm bezpośrednio, robimy to dynamicznie.
// Opcja { ssr: false } jest kluczowa - mówi Next.js, aby nie renderować tego
// komponentu na serwerze, co zapobiega błędowi "self is not defined".
const AddTripForm = dynamic(
    () => import('@/components/admin/trips/AddTripForm'),
    { ssr: false }
);

export default function AddTripPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Dodaj nową wycieczkę</h1>

            {/* Teraz ten komponent zostanie wczytany tylko w przeglądarce klienta */}
            <AddTripForm/>
        </div>
    )
}