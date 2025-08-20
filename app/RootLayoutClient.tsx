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

        {/* Botón flotante - Extremo derecho inferior */}
        <a
            href="https://wa.me/51916886591"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300"
            title="Contáctanos por WhatsApp"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.844 5.09 2.438 7.188L4 29l7.031-2.312A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.09 0-4.125-.627-5.844-1.813l-.418-.281-4.188 1.375 1.375-4.063-.273-.43C6.627 18.125 6 16.09 6 14c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10zm5.125-7.219c-.281-.141-1.656-.82-1.906-.914-.25-.094-.438-.141-.625.141-.188.281-.719.914-.883 1.102-.164.188-.328.211-.609.07-.281-.141-1.188-.438-2.266-1.398-.838-.747-1.406-1.672-1.57-1.953-.164-.281-.018-.433.123-.574.127-.126.281-.328.422-.492.141-.164.188-.281.281-.469.094-.188.047-.352-.023-.492-.07-.141-.625-1.508-.857-2.063-.226-.543-.457-.469-.625-.477-.164-.008-.352-.01-.539-.01-.188 0-.492.07-.75.352-.258.281-.984.961-.984 2.344s1.008 2.719 1.148 2.906c.141.188 1.984 3.031 4.812 4.125.674.29 1.2.463 1.61.592.677.216 1.294.186 1.779.113.543-.082 1.656-.676 1.891-1.33.234-.653.234-1.215.164-1.33-.07-.117-.258-.188-.539-.328z"/>
            </svg>
        </a>

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