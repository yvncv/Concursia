"use client";

import { usePathname } from "next/navigation";
import Navbar from "./nav-bar";

export default function NavbarControl({brandName}: {brandName: string}) {
  const pathname = usePathname();
  const noNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !noNavbarRoutes.includes(pathname);

  return shouldShowNavbar ? <Navbar brandName={brandName}/> : null;
}