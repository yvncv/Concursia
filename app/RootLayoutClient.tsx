"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import NavbarControl from "./ui/navbar/navbar-control";
import Footer from "./ui/footer/footer";
import { withRoleProtection } from "./utils/withRoleProtection";

function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const brandName = "CONCURSIA";
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(false);

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

      {/* Toast Container - Extremo derecho superior */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444', 
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default withRoleProtection(RootLayoutClient);