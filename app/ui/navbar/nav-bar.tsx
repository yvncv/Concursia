import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, User, Menu, X, Shield, LogOutIcon } from "lucide-react";
import useUser from "@/app/hooks/useUser";
import useEvents from "@/app/hooks/useEvents";
import { CustomEvent } from '@/app/types/eventType';
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";

export default function Navbar({ brandName }: { brandName: string }) {
  const { user, loadingUser } = useUser();
  const { events } = useEvents();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const isStaffOfAnyEvent = user && events.some(ev =>
    ev.staff?.some(staff => staff.userId === user?.id)
  );

  // Reset the menu state when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const enlaces = [
    {
      href: "/calendario",
      label: "Calendario",
      icon: Home,
      requiresAuth: false,
    },
    {
      href: "/login",
      label: "Iniciar Sesión",
      icon: LogIn,
      requiresAuth: false,
    },
    {
      href: "/organize",
      label: "Eventos",
      icon: Shield,
      requiresAuth: true,
      requiresRole: "organizer",
    },
    {
      href: "/admin",
      label: "Panel Admin",
      icon: Shield,
      requiresAuth: true,
      requiresRole: "admin",
    },
    {
      href: `/user/${user?.id}`,
      label: "Perfil",
      icon: User,
      requiresAuth: true,
    },
    { href: "/login", label: "Logout", icon: LogOutIcon, requiresAuth: true },
  ];

  const enlaces_landing = [
    {
      href: "/calendario",
      label: "Calendario",
      icon: Home,
    },
    {
      href: "#eventos",
      label: "Eventos Recientes",
      icon: Home,
    },
    {
      href: "#galeria",
      label: "Galería",
      icon: Home,
    },
    {
      href: "#acerca",
      label: "Acerca de",
      icon: Home,
    },
    {
      href: "#contacto",
      label: "Contacto",
      icon: Home,
    },
  ];

  if (isStaffOfAnyEvent && user.roleId !== "organizer" && !enlaces.some(e => e.href === "/organize/")) {
    enlaces.unshift({
      href: "/organize/",
      label: "Eventos",
      icon: Shield,
      requiresAuth: true,
    });
  }

  const filteredLinks = enlaces.filter((link) => {
    if (link.label === "Logout" && user) return true; // Always show logout if user exists
    if (link.href === "/login" && user) return false;
    if (link.requiresAuth) {
      if (!user) return false;
      if (link.requiresRole) return user?.roleId === link.requiresRole;
    }
    return true;
  });

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
    setSearchTerm("");
    setFilteredEvents([]);
  };

  const handleSignOut = async () => {
    try {
      router.push("/calendario");
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Loading states
  const loadingMessage = loadingUser ? "Cargando datos..." : null;

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600" />
            <span className="animate-pulse text-red-600 text-lg font-medium">
              {loadingMessage}
            </span>
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
            <Link href="/" className="flex items-center space-x-2">
              <img src="/concursia.png" alt="Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold text-red-700 hover:text-red-600">{brandName}</span>
            </Link>
          </div>

          {/* Menú en Desktop */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4 items-center">
              {enlaces_landing.map((enlace, index) => (
                <li key={index}>
                  {enlace.label === "Calendario" ? (
                    <Link
                      href={enlace.href}
                      className={`flex flex-row space-x-2 py-1 px-2 rounded-lg transition-colors duration-200
                    ${pathname.includes(enlace.href)
                          ? "bg-red-100 text-red-700 font-bold"
                          : "hover:bg-gray-100 hover:text-black text-red-700"
                        }`}
                      onClick={handleLinkClick}
                    >
                      <enlace.icon className="w-5 h-5" />
                      <span className="hidden md:block truncate">
                        {enlace.label}
                      </span>
                    </Link>
                  ) : (
                    <div className="relative group">
                      <Link
                        href={enlace.href}
                        className="text-gray-600 hover:text-red-700"
                      >
                        {enlace.label}
                      </Link>
                      <span className="group-hover:w-full group-hover:opacity-100 opacity-0 duration-300 transition-all ease-in-out absolute bottom-0 left-0 w-[2px] h-[2px] bg-red-700"></span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Botones de sesión o icono de usuario en Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <Link
                href={`/user/${user?.id}`}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm text-gray-800 hover:text-black hover:border-gray-400 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                >
                  <User className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </>
            )}
          </div>

          {/* Botón de menú para mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-red-700 hover:text-gray-200 focus:outline-none transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {/* Menú para Mobile - Añadida transición suave */}
        <div
          className={`md:hidden bg-white shadow-md overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <ul className="space-y-4 px-4 pb-4 pt-2">
            <li><Link href="/calendario" className="text-gray-600 hover:text-red-700 block">Calendario de Eventos</Link></li>
            <li><Link href="#eventos" className="text-gray-600 hover:text-red-700 block">Eventos Recientes</Link></li>
            <li><Link href="#galeria" className="text-gray-600 hover:text-red-700 block">Galería</Link></li>
            <li><Link href="#acerca" className="text-gray-600 hover:text-red-700 block">Acerca de</Link></li>
            <li><Link href="#contacto" className="text-gray-600 hover:text-red-700 block">Contacto</Link></li>
            {user ? (
              <li>
                <Link
                  href={`/user/${user?.id}`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-700 block"
                >
                  <User className="w-5 h-5" />
                  <span>Perfil</span>
                </Link>
              </li>
            ) : (
              <>
                <li><Link href="/login" className="text-gray-600 hover:text-red-700 block">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="text-gray-600 hover:text-red-700 block">Registrarse</Link></li>
              </>
            )}
          </ul>
        </div>
      </header>
    );
  }

  return (
    <nav className="bg-white shadow-md py-3">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between w-full">
          {/* Mobile Layout - Compact design similar to example */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2" onClick={handleLinkClick}>
              <img src="/concursia.png" alt="Logo" className="w-12 h-12 sm:w-9 sm:h-9" />
              <span className="text-2xl font-bold text-red-700 hover:text-red-600 hidden md:inline">{brandName}</span>
            </Link>

            {/* Search Bar on mobile - styled like the example */}
            <div className="relative flex-grow mx-2 md:hidden">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Encuentra eventos, lugares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 outline-none w-full text-sm"
                />
              </div>
              {filteredEvents.length > 0 && (
                <ul className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg bg-white shadow-lg">
                  {filteredEvents.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/event/${event.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                        onClick={handleLinkClick}
                      >
                        {event.eventType} {event.name} - {event.location.district}, {event.location.department}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-red-700 p-1 md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
          {/* Desktop Search Bar */}
          <div className="relative hidden md:block w-full max-w-sm mx-2">
            <input
              type="search"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim() !== "") {
                  router.push(`/search-results?query=${encodeURIComponent(searchTerm)}`);
                  setSearchTerm("");
                }
              }}
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
                      {event.eventType} {event.name} - {event.location.district}
                      , {event.location.department}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-4">
                {filteredLinks.map((link) => (
                  <li key={link.href}>
                    {link.label === "Logout" ? (
                      <button
                        onClick={handleSignOut}
                        className={`flex flex-row space-x-2 py-1 px-2 rounded-lg transition-colors duration-200
                          ${pathname.includes(link.href)
                            ? "bg-red-100 text-red-700 font-bold"
                            : "hover:bg-gray-100 hover:text-black text-red-700"
                          }`}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="hidden md:block truncate">
                          {link.label}
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex flex-row space-x-2 py-1 px-2 rounded-lg transition-colors duration-200
                          ${pathname.includes(link.href)
                            ? "bg-red-100 text-red-700 font-bold"
                            : "hover:bg-gray-100 hover:text-black text-red-700"
                          }`}
                        onClick={handleLinkClick}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="hidden md:block truncate">
                          {link.label}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-red-700 hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu - Transition and content */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out mt-3 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <ul className="space-y-4 px-2 pb-4 pt-2 bg-white rounded-lg shadow-md">
              {filteredLinks.map((link) => {
                const isActive = pathname.includes(link.href);

                const handleClick = async () => {
                  setIsMenuOpen(false);
                  handleLinkClick();
                  if (link.label === "Logout") {
                    await handleSignOut();
                  }
                };

                return (
                  <li key={link.href}>
                    {link.label === "Logout" ? (
                      <button
                        onClick={handleClick}
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 
              ${isActive ? "bg-red-100 text-red-700 font-bold" : "hover:bg-gray-100 hover:text-black text-red-700"}`}
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 
              ${isActive ? "bg-red-100 text-red-700 font-bold" : "hover:bg-gray-100 hover:text-black text-red-700"}`}
                        onClick={handleClick}
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

        </div>
      </div>
    </nav>
  );
}