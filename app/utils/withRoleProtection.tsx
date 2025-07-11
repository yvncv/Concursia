// app/utils/withRoleProtection.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import useUser from "@/app/hooks/useUser";
import useEvents from "@/app/hooks/useEvents";
import { useEffect, useState } from "react";

// type Role = "admin" | "organizer" | "user" | "participant" | "spectator";

export const withRoleProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ProtectedComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loadingUser } = useUser();
    const { events, loadingEvents } = useEvents();
    const [checked, setChecked] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
      // pase de error o login
      if (
        pathname === "/unauthorized" ||
        pathname === "/login"
      ) {
        setIsAllowed(true);
        setChecked(true);
        return;
      }

      // mientras carga user o events
      if (loadingUser || loadingEvents || !events) {
        setChecked(false);
        return;
      }

      const parts = pathname.split("/").filter(Boolean);
      const isAdminRoute = /^\/admin(?:$|\/)/.test(pathname);
      const isEventList = parts[0] === "organize";
      const isEventDetail = parts[0] === "organize";

      // 1) /admin
      if (isAdminRoute) {
        if (user?.roleId === "admin") {
          setIsAllowed(true);
        } else {
          router.replace("/unauthorized");
        }
        setChecked(true);
        return;
      }

      // 2) listado de eventos: /organize/events
      if (isEventList) {
        // permitimos a organizador global o a cualquier staff en al menos un evento
        const isStaff = Boolean(
          user &&
          events.some(ev =>
            ev.staff?.some(s => s.userId === user?.id)
          )
        );
        if (user && (user?.roleId === "organizer" || isStaff)) {
          setIsAllowed(true);
        } else {
          router.replace("/unauthorized");
        }
        setChecked(true);
        return;
      }

      // 3) detalle de evento: /organize/events/[id]/...
      if (isEventDetail) {
        const eventId = parts[2];
        const section = parts[3] || "overview";
        const ev = events.find(e => e.id === eventId);
        if (!ev) {
          router.replace("/unauthorized");
          setChecked(true);
          return;
        }
        // organizador global del evento
        if (user?.roleId === "organizer" || ev.organizerId === user?.id || (user?.roleId == "organizer" && ev.academyId === user?.marinera?.academyId)) {
          setIsAllowed(true);
          setChecked(true);
          return;
        }
        // staff
        const staffEntry = ev.staff?.find(s => s.userId === user?.id);
        if (!staffEntry) {
          router.replace("/unauthorized");
        } else if (
          section === "overview" ||
          staffEntry.permissions.includes(section)
        ) {
          setIsAllowed(true);
        } else {
          router.replace("/unauthorized");
        }
        setChecked(true);
        return;
      }

      // 4) resto de rutas: públicas
      setIsAllowed(true);
      setChecked(true);
    }, [
      user,
      loadingUser,
      events,
      loadingEvents,
      pathname,
      router
    ]);

    if (loadingUser || loadingEvents || !checked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600" />
              <span className="animate-pulse text-red-600 text-lg font-medium">
                Cargando datos...
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (!isAllowed) return null;
    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return ProtectedComponent;
};
