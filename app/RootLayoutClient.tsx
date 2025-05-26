"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavbarControl from "./ui/navbar/navbar-control";
import Footer from "./ui/footer/footer";
import { withRoleProtection } from "./utils/withRoleProtection";

function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const brandName = "CONCURSIA";
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(false); // 👈 nuevo estado

  useEffect(() => {
    // Mostrar navbar en todas menos subrutas de /organize/events/
    setShowNavbar(
      pathname === "/organize/events" || !pathname.startsWith("/organize/events/")
    );

    // Mostrar footer solo en la página principal
    setShowFooter(pathname === "/");
  }, [pathname]);

  return (
    <>
      {showNavbar && (
        <>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <NavbarControl brandName={brandName} />
        </>
      )}

      {children}

      {showFooter && <Footer brandName={brandName} />}
    </>
  );
}

export default withRoleProtection(RootLayoutClient);
