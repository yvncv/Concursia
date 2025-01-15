import { useState, useEffect } from "react";
import Link from "next/link";
import useUser from "@/app/firebase/functions";
import { Event } from "@/app/types/eventType";
import { HomeIcon } from "../icons/home";
import { LoginIcon } from "../icons/login";
import { ProfileIcon } from "../icons/profile";
import { MenuIcon } from "../icons/menu";
import { CloseIcon } from "../icons/close";
import AdminIcon from "../icons/admin";
import CalendarIcon from "../icons/calendar";
import useEvents from "@/app/hooks/useEvents";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, loadingUser } = useUser();
  const { events } = useEvents();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const pathname = usePathname();

  const enlaces = [
    { href: "/calendario", label: "Home", icon: HomeIcon, requiresAuth: false },
    { href: "/login", label: "Iniciar Sesión", icon: LoginIcon, requiresAuth: false },
    { href: "/academy-events", label: "Eventos Academia", icon: CalendarIcon, requiresAuth: true, requiresRole: "organizer" },
    { href: "/admin", label: "Panel Admin.", icon: AdminIcon, requiresAuth: true, requiresRole: "admin" },
    { href: `/user/${user?.id}`, label: "Perfil", icon: ProfileIcon, requiresAuth: true },
  ];

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvents([]);
      return;
    }

    const results = events.filter((event) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        event.eventType?.toLowerCase().includes(lowerSearchTerm) ||
        event.location?.placeName?.toLowerCase().includes(lowerSearchTerm)
      );
    });

    setFilteredEvents(results);
  }, [searchTerm, events]);

  const handleLinkClick = () => {
    setSearchTerm(""); // Limpia el buscador
    setFilteredEvents([]); // Limpia los resultados
  };

  const filteredLinks = enlaces.filter((link) => {
    if (link.href === "/login" && user) return false;
    if (link.requiresAuth) {
      if (!user) return false;
      if (link.requiresRole) return user.roleId === link.requiresRole;
    }
    return true;
  });

  // Loading states
  const loadingMessage = loadingUser ? "Cargando datos..." : null;

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600" />
            <span className="animate-pulse text-red-600 text-lg font-medium">{loadingMessage}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-rojo shadow-lg">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200" onClick={handleLinkClick}>
              Tusuy Perú
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative hidden w-full max-w-md md:block">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rojo"
            />
            {filteredEvents.length > 0 && (
              <ul className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg bg-white shadow-lg">
                {filteredEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/event/${event.id}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={handleLinkClick}
                    >
                      {event.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {filteredLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-white transition-colors duration-200 text-lg
                      ${pathname.includes(link.href)
                        ? "bg-white/80 text-black font-bold"
                        : "hover:bg-white/50 hover:text-black"
                      }`}
                    onClick={handleLinkClick}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <ul className="space-y-4 px-2 pb-4 pt-2">
              {filteredLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-3 text-white hover:text-gray-200 transition-colors duration-200 text-lg"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLinkClick();
                    }}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}