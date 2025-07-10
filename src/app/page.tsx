import TripsPage from "@/app/admin/trips/page";
import {redirect} from "next/navigation";

export default function HomePage() {
    redirect("/admin/trips");
}