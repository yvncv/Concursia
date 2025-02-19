"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavbarControl from "./ui/navbar/navbar-control";
import PageTransition from "./ui/page-transition/PageTransition";
import StairTransition from "./ui/page-transition/StairTransition";
import Footer from "./ui/footer/footer";
import { brandName } from "./page";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);

  // Actualizar el estado cuando cambie la ruta
  useEffect(() => {
    setShowNavbar(pathname === "/organizer/events" || !pathname.startsWith("/organizer/events/"));
  }, [pathname]);

  return (
    <>
      {showNavbar && (
        <>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <NavbarControl brandName={brandName} />
          <StairTransition />
        </>
      )}
      <PageTransition>{children}</PageTransition>
      {showNavbar && <Footer brandName={brandName} />}
    </>
  );
}
