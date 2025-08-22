import { routes } from "@/config/routes";
import {PiAirplaneTiltDuotone, PiFolder} from "react-icons/pi";
import React from "react";
import {Link} from "react-scroll";

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
    href: "/admin/trips",
    icon: <PiAirplaneTiltDuotone />,
    dropdownItems: [
      {
        name: "Lista wycieczek",
        href: "/admin/trips",
      },

      {
        name: "Dodaj nowa",
        href: "/admin/trips/add",
      },
      {
        name: "Kategorie wycieczek",
        href: "/admin/trips/categories/",
      },
    ],
  },

  // ...możesz tu dalej wklejać kolejne sekcje jak „Widgets”, „Tables”, „Auth”, itd.
];
