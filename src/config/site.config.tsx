import { Metadata } from "next";
import { LAYOUT_OPTIONS } from "@/config/enums";


enum MODE {
  DARK = "dark",
  LIGHT = "light",
}

export const siteConfig = {
  title: "AllinTravel Admin Panel",
  description: ``,
  // logo: logoImg,
  // icon: logoIconImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
  // TODO: favicon
};

