import { routes } from "@/config/routes";
import {PiAirplane, PiAirplaneTiltDuotone, PiBook, PiFolder, PiListBullets} from "react-icons/pi";
import React from "react";
import {Link} from "react-scroll";
import {AiFillDashboard, AiOutlineBook} from "react-icons/ai";

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
    name: "Rezerwacje",
    href: "/admin/reservations",
    icon: <PiListBullets />,
    dropdownItems: [
      {
        name: "Lista rezerwacji",
        href: "/admin/pages",
      }

    ],
  },
  {
    name: "Wycieczki",
    href: "/admin/trips",
    icon: <PiAirplane />,
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
  {
    name: "Strony i posty",
    href: "/admin/trips",
    icon: <PiBook />,
    dropdownItems: [
      {
        name: "Lista ston i postów",
        href: "/admin/pages",
      },

      {
        name: "Dodaj nowa",
        href: "/",
      }

    ],
  },

  // ...możesz tu dalej wklejać kolejne sekcje jak „Widgets”, „Tables”, „Auth”, itd.
];
