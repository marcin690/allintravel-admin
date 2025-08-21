import { routes } from "@/config/routes";
import {PiAirplaneTiltDuotone, PiFolder} from "react-icons/pi";
import React from "react";

export const routes = {
  // ...inne trasy
  trips: {
    list: "/admin/trips",
    byType: (type: string) => `/admin/trips?type=${type}`,
    details: (id: number | string) => `/admin/trips/${id}`,
  },
};

export const menuItems = [
  {
    name: "Organizacja",
  },
  {
    name: "Wycieczki",
    href: "#",
    icon: <PiAirplaneTiltDuotone />,
    dropdownItems: [
      {
        name: "Indywidualne",
        href: routes.trips.byType("INDIVIDUAL"),
      },
      {
        name: "Szkolne",
        href: routes.trips.byType("SCHOOL"),
      },
      {
        name: "Pielgrzymki",
        href: routes.trips.byType("PILGRIMAGE"),
      },
      {
        name: "Firmowe",
        href: routes.trips.byType("CORPORATE"),
      },
    ],
  },

  // ...możesz tu dalej wklejać kolejne sekcje jak „Widgets”, „Tables”, „Auth”, itd.
];
