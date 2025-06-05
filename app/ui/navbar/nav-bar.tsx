import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, Ticket, User, Menu, X, Shield, LogOutIcon, Search, ChevronDown } from "lucide-react";
import useUser from "@/app/hooks/useUser";
import useEvents from "@/app/hooks/useEvents";
import useAcademies from "@/app/hooks/useAcademies";
import useUsers from "@/app/hooks/useUsers";
import { CustomEvent } from '@/app/types/eventType';
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";

export default function Navbar({ brandName }: { brandName: string }) {
  const { user, loadingUser } = useUser();
  const { events } = useEvents();
  const { academies } = useAcademies();
  const { users } = useUsers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false); // Nueva estado para mostrar/ocultar búsqueda
  const pathname = usePathname();
  const router = useRouter();

  const isStaffOfAnyEvent = user && events.some(ev =>
    ev.staff?.some(staff => staff.userId === user?.id)
  );

  // Reset the menu state when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowMobileSearch(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Mantener el término de búsqueda sincronizado con la URL en la página de resultados
  useEffect(() => {
    if (pathname === '/search-results') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get('query');
      if (queryParam && queryParam !== searchTerm) {
        setSearchTerm(queryParam);
      }
    }
  }, [pathname]);

  const enlaces = [
    {
      href: "/calendario",
      label: "Calendario",
      icon: Home,
      requiresAuth: false,
    },
    {
      href: "/my-registrations",
      label: "Mis Inscripciones",
      icon: Ticket,
      requiresAuth: true,
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
    if (link.label === "Logout" && user) return true;
    if (link.href === "/login" && user) return false;
    if (link.requiresAuth) {
      if (!user) return false;
      if (link.requiresRole) return user?.roleId === link.requiresRole;
    }
    return true;
  });

  // Búsqueda completa
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filtrar eventos
    const filteredEvents = events.filter((event) => {
      const name = typeof event.name === 'string' ? event.name.toLowerCase() : '';
      const eventType = typeof event.eventType === 'string' ? event.eventType.toLowerCase() : '';
      const placeName = typeof event.location?.placeName === 'string' ? event.location.placeName.toLowerCase() : '';

      return (
        name.includes(lowerSearchTerm) ||
        eventType.includes(lowerSearchTerm) ||
        placeName.includes(lowerSearchTerm)
      );
    }).map(event => {
      const capitalize = (text: string | undefined) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

      const eventType = event.eventType || '';
      const name = event.name || '';
      const showEventType = !name.toLowerCase().startsWith(eventType.toLowerCase());

      return {
        ...event,
        type: 'event',
        displayText: `${showEventType ? `${eventType} ` : ''}${name} - ${capitalize(event.location?.district)}${event.location?.department ? `, ${capitalize(event.location.department)}` : ''}`,
        href: `/event/${event.id}`
      };
    });

    // Filtrar academias
    const filteredAcademies = academies.filter((academy) => {
      const name = typeof academy.name === 'string' ? academy.name.toLowerCase() : '';
      return name.includes(lowerSearchTerm);
    }).map(academy => ({
      ...academy,
      type: 'academy',
      displayText: `${academy.name || ''} - ${academy.location?.district || ''}, ${academy.location?.department || ''}`,
      href: `/academy/${academy.id}`
    }));

    // Filtrar usuarios
    const filteredUsers = users.filter((user) => {
      const firstName = typeof user.firstName === 'string' ? user.firstName.toLowerCase() : '';
      const lastName = typeof user.lastName === 'string' ? user.lastName.toLowerCase() : '';
      const category = user.marinera?.participant?.category?.toLowerCase() ?? '';

      return (
        `${firstName} ${lastName}`.includes(lowerSearchTerm) ||
        category.includes(lowerSearchTerm)
      );
    }).map(user => {
      const capitalize = (text: string | undefined) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

      return {
        ...user,
        type: 'user',
        displayText: `${user.firstName} ${user.lastName} - ${user.marinera?.participant?.category ?? ''} - ${capitalize(user.location?.department)}`,
        href: `/user/${user.id}`
      };
    });

    // Combinar todos los resultados y limitar a 10 para el dropdown
    const allResults = [...filteredEvents, ...filteredAcademies, ...filteredUsers];
    setFilteredResults(allResults.slice(0, 10));
  }, [searchTerm, events, academies, users]);

  const handleLinkClick = () => {
    // Solo limpiar si no estamos en la página de resultados
    if (pathname !== '/search-results') {
      setSearchTerm("");
    }
    setFilteredResults([]);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/search-results?query=${encodeURIComponent(searchTerm)}`);
      setFilteredResults([]); // Cerrar dropdown
      setShowMobileSearch(false); // Cerrar búsqueda mobile
    }
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
        {/* Menú para Mobile */}
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
    <nav className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-3">
        {/* Navbar principal */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2" onClick={handleLinkClick}>
            <img src="/concursia.png" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-red-700 hover:text-red-600 hidden sm:inline">{brandName}</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="relative hidden md:flex w-full max-w-md mx-4">
            <input
              type="search"
              placeholder="Buscar eventos, academias, usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
              className="w-full rounded-l-lg border border-r-0 border-gray-300 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
            <button
              onClick={handleSearchSubmit}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-lg border border-red-600 transition-colors duration-200 flex items-center justify-center"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            {/* DROPDOWN PARA DESKTOP */}
            {filteredResults.length > 0 && (
              <ul className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg bg-white shadow-lg max-h-80 overflow-y-auto">
                {filteredResults.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <Link
                      href={result.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-100 border-b last:border-b-0"
                      onClick={handleLinkClick}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {result.type === 'event' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Evento</span>}
                            {result.type === 'academy' && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Academia</span>}
                            {result.type === 'user' && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Usuario</span>}
                          </div>
                          <div className="text-sm">{result.displayText}</div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop Menu */}
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-2 items-center">
                {/* Calendario */}
                <li>
                  <Link
                    href="/calendario"
                    className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors duration-200 text-sm
            ${pathname === "/calendario"
                        ? "bg-red-100 text-red-700 font-bold"
                        : "hover:bg-gray-100 hover:text-black text-red-700"
                      }`}
                    onClick={handleLinkClick}
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden xl:block">Calendario</span>
                  </Link>
                </li>

                {/* Eventos (solo si es staff o organizer) */}
                {(isStaffOfAnyEvent || user?.roleId === "organizer") && (
                  <li>
                    <Link
                      href="/organize"
                      className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors duration-200 text-sm
              ${pathname.includes("/organize")
                          ? "bg-red-100 text-red-700 font-bold"
                          : "hover:bg-gray-100 hover:text-black text-red-700"
                        }`}
                      onClick={handleLinkClick}
                    >
                      <Shield className="w-4 h-4" />
                      <span className="hidden xl:block">Eventos</span>
                    </Link>
                  </li>
                )}

                {/* Menú de usuario */}
                {user ? (
                  <li className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors duration-200 text-sm hover:bg-gray-100 text-red-700"
                    >
                      <User className="w-4 h-4" />
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Dropdown del usuario */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <ul className="py-1">
                          <li>
                            <Link
                              href={`/user/${user.id}`}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setShowUserMenu(false);
                                handleLinkClick();
                              }}
                            >
                              <User className="w-4 h-4" />
                              <span>Perfil</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/my-registrations"
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setShowUserMenu(false);
                                handleLinkClick();
                              }}
                            >
                              <Ticket className="w-4 h-4" />
                              <span>Mis Inscripciones</span>
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                handleSignOut();
                              }}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <LogOutIcon className="w-4 h-4" />
                              <span>Cerrar Sesión</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors duration-200 text-sm hover:bg-gray-100 text-red-700"
                      onClick={handleLinkClick}
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden xl:block">Iniciar Sesión</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Search Button */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="text-red-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-red-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${showMobileSearch ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-lg">
              <div className="flex items-center flex-grow px-3 py-2">
                <Search className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="search"
                  placeholder="Encuentra eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  className="bg-transparent border-none focus:ring-0 outline-none w-full text-sm"
                />
              </div>
              <button
                onClick={handleSearchSubmit}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-r-lg transition-colors duration-200"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Search Dropdown */}
            {filteredResults.length > 0 && showMobileSearch && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                {filteredResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm border-b last:border-b-0"
                    onClick={() => {
                      handleLinkClick();
                      setShowMobileSearch(false);
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {result.type === 'event' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Evento</span>}
                      {result.type === 'academy' && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Academia</span>}
                      {result.type === 'user' && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Usuario</span>}
                    </div>
                    <div className="text-sm text-gray-900">{result.displayText}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {filteredLinks.map((link) => {
                const isActive = pathname.includes(link.href);

                const handleClick = async () => {
                  setIsMenuOpen(false);
                  setShowMobileSearch(false);
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
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 w-full text-left
                          ${isActive ? "bg-red-100 text-red-700 font-bold" : "hover:bg-white hover:shadow-sm text-red-700"}`}
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                          ${isActive ? "bg-red-100 text-red-700 font-bold" : "hover:bg-white hover:shadow-sm text-red-700"}`}
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