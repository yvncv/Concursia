import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, User, Menu, X, Shield, LogOutIcon } from "lucide-react";
import useUser from "@/app/firebase/functions";
import useEvents from "@/app/hooks/useEvents";
import { CustomEvent } from '@/app/types/eventType';
import { useRouter } from "next/navigation"; // Importa el router para la redirección
import { auth } from "@/app/firebase/config";

export default function Navbar({ brandName }: { brandName: string }) {
  const { user, loadingUser } = useUser();
  const { events } = useEvents();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>([]);
  const pathname = usePathname();
  const router = useRouter(); // Inicializa el router

  const enlaces = [
    { href: "/calendario", label: "Calendario", icon: Home, requiresAuth: false },
    { href: "/login", label: "Iniciar Sesión", icon: LogIn, requiresAuth: false },
    { href: "/organizer", label: "Panel Organizador", icon: Shield, requiresAuth: true, requiresRole: "organizer" },
    { href: "/admin", label: "Panel Admin", icon: Shield, requiresAuth: true, requiresRole: "admin" },
    { href: `/user/${user?.id}`, label: "Perfil", icon: User, requiresAuth: true },
    { href: "/login", label: "Logout", icon: LogOutIcon, requiresAuth: true },
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

  const handleSignOut = async () => {
    try {
      router.push("/calendario"); // Redirige al calendario después de cerrar sesión
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const filteredLinks = enlaces.filter((link) => {
    if (link.label === "Logout" && user) return true; // Always show logout if user exists
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

  if (pathname === "/") {
    return (
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div>
            <Link href="/" className="text-2xl font-bold text-red-700 hover:text-red-600">{brandName}</Link>
          </div>

          {/* Menú en Desktop */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li><Link href="/calendario" className="text-gray-600 hover:text-red-700">Calendario</Link></li>
              <li><Link href="#eventos" className="text-gray-600 hover:text-red-700">Eventos Recientes</Link></li>
              <li><Link href="#galeria" className="text-gray-600 hover:text-red-700">Galería</Link></li>
              <li><Link href="#acerca" className="text-gray-600 hover:text-red-700">Acerca de</Link></li>
              <li><Link href="#contacto" className="text-gray-600 hover:text-red-700">Contacto</Link></li>
            </ul>
          </nav>

          {/* Botón de menú para mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-red-700 hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú para Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <ul className="space-y-4 px-4 pb-4 pt-2">
              <li><Link href="/calendario" className="text-gray-600 hover:text-red-700 block">Calendario</Link></li>
              <li><Link href="#eventos" className="text-gray-600 hover:text-red-700 block">Eventos Recientes</Link></li>
              <li><Link href="#galeria" className="text-gray-600 hover:text-red-700 block">Galería</Link></li>
              <li><Link href="#acerca" className="text-gray-600 hover:text-red-700 block">Acerca de</Link></li>
              <li><Link href="#contacto" className="text-gray-600 hover:text-red-700 block">Contacto</Link></li>
            </ul>
          </div>
        )}
      </header>
    );
  }

  return (
    <nav className="bg-white shadow-md py-3">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-red-700 hover:text-red-600" onClick={handleLinkClick}>
              {brandName}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative hidden w-full max-w-sm lg:block">
            <input
              type="search"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
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
                      {event.eventType} {event.name} - {event.location.district}, {event.location.department}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {filteredEvents.length === 0 && searchTerm && (
              <p className="text-center text-gray-500 py-2">No events found</p>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-8">
                {filteredLinks.map((link) => (
                  <li key={link.href}>
                    {link.label === "Logout" ? (
                      <button
                        onClick={handleSignOut}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200
                          ${pathname.includes(link.href)
                            ? "bg-red-100 text-red-700 font-bold"
                            : "hover:bg-gray-100 hover:text-black text-red-700"
                          }`}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="hidden md:block">{link.label}</span>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200
                          ${pathname.includes(link.href)
                            ? "bg-red-100 text-red-700 font-bold"
                            : "hover:bg-gray-100 hover:text-black text-red-700"
                          }`}
                        onClick={handleLinkClick}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="hidden md:block">{link.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-red-700 hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <ul className="space-y-4 px-2 pb-4 pt-2">
              {filteredLinks.map((link) => {
                const isActive = pathname.includes(link.href);

                // This function combines closing the menu and clearing search results
                const handleClick = async () => {
                  setIsMenuOpen(false); // Close the menu
                  handleLinkClick(); // Clear the search term and filtered events
                  if (link.label === "Logout") {
                    await handleSignOut(); // Handle sign-out if the link is "Logout"
                  }
                };

                return (
                  <li key={link.href}>
                    {link.label === "Logout" ? (
                      <button
                        onClick={handleClick} // Use the combined handler for logout and menu close
                        className={`flex items-center space-x-3 p-2 rounded-lg text-red-700 hover:text-gray-200 transition-colors duration-200 
                      ${isActive ? "bg-red-100 text-red-700 font-bold" : "hover:bg-gray-100 hover:text-black text-red-700"}`}
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center space-x-3 p-2 rounded-lg text-red-700 hover:text-gray-200 transition-colors duration-200 
                      ${isActive ? "bg-red-100 text-red-700 font-bold" : "hover:bg-gray-100 hover:text-black text-red-700"}`}
                        onClick={handleClick} // Use the same click handler for other links
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}


            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
