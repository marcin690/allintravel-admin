// TripTypesSummary.tsx
"use client";
import Link from "next/link";
import {BriefcaseIcon, GraduationCapIcon, UserIcon, HandHeartIcon} from "lucide-react";

const tripTypes = [
    {
        name: "Indywidualne",
        type: "INDIVIDUAL",
        href: "/admin/trips/individual",
        icon: <UserIcon className="w-5 h-5" />,
        colorClass: "bg-blue-600",
    },
    {
        name: "Szkolne",
        type: "SCHOOL",
        href: "/admin/trips/school",
        icon: <GraduationCapIcon className="w-5 h-5" />,
        colorClass: "bg-green-600",
    },
    {
        name: "Pielgrzymki",
        type: "PILGRIMAGE",
        href: "/admin/trips/pilgrimage",
        icon: <HandHeartIcon className="w-5 h-5" />,
        colorClass: "bg-yellow-500",
    },
    {
        name: "Firmowe",
        type: "COMPANY",
        href: "/admin/trips/company",
        icon: <BriefcaseIcon className="w-5 h-5" />,
        colorClass: "bg-red-500",
    },
];

export default function TripTypesSummary() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {tripTypes.map((trip) => (
                <Link href={trip.href} key={trip.type}>
                    <div className="rounded-lg border border-muted p-6 hover:shadow cursor-pointer transition">
                        <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-content-center rounded-lg text-white ${trip.colorClass}`}>
                {trip.icon}
              </span>
                            <h4 className="text-lg font-medium">{trip.name}</h4>
                        </div>
                        <div className="mt-3 text-sm text-gray-500">Zobacz wycieczki</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
