"use client";

import React, { useEffect, Dispatch, SetStateAction } from "react";
import {
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface OrganizerSideBarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const OrganizerSideBar: React.FC<OrganizerSideBarProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  const pathname = usePathname();

  // Auto-colapsar en mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const enlaces = [
    {
      label: "Dashboard",
      href: "/organizer",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Events",
      href: "/organizer/events",
      icon: <Calendar size={20} />,
    },
    {
      label: "Students",
      href: "/organizer/students",
      icon: <User size={20} />,
    },
  ];

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Sidebar principal */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-white shadow-md min-h-screen transition-all duration-300 relative`}
      >
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-600 transition-colors z-10"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-4">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-red-700 mb-6">Organizador</h1>
          )}
          <nav>
            <ul className="space-y-2">
              {enlaces.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsCollapsed(false)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-red-100 text-red-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default OrganizerSideBar;
