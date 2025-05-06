// app/utils/withRoleProtection.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import useUser from "@/app/hooks/useUser";
import { useEffect, useState } from "react";

type Role = "admin" | "organizer" | "user" | "participant" | "spectator";

const routeRolePatterns: { pattern: RegExp; roles: Role[] }[] = [
  { pattern: /^\/admin(?:$|\/)/,                roles: ["admin"] },
  { pattern: /^\/organizer(?:$|\/)/,            roles: ["organizer"] },
];

export const withRoleProtection = (WrappedComponent: React.ComponentType) => {
  const ProtectedComponent = (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loadingUser } = useUser();
    const [checked, setChecked] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
      if (loadingUser) return;

      // 1) Si no hay usuario → redirect + bloquea todo render
      // if (!user) {
      //   router.replace("/login");
      //   setChecked(true);
      //   return;
      // }

      // 2) Busca patrón de ruta
      const match = routeRolePatterns.find(({ pattern }) =>
        pattern.test(pathname)
      );

      // 3) Rutas públicas (sin match) → permitimos
      if (!match) {
        setIsAllowed(true);
        setChecked(true);
        return;
      }

      // 4) Rutas protegidas → chequear rol
      if (match.roles.includes(user?.roleId as Role)) {
        setIsAllowed(true);
      } else {
        router.replace("/unauthorized");
      }

      setChecked(true);
    }, [user, loadingUser, pathname, router]);

    // Mientras loadingUser o antes de checked → Loading
    if (loadingUser || !checked) {
      return <div>Loading…</div>;
    }

    // Si no está permitido → nada
    if (!isAllowed) {
      return null;
    }

    // Finalmente, renderizamos el componente
    return <WrappedComponent {...props} />;
  };

  // displayName para ESLint/DevTools
  const name = WrappedComponent.displayName || WrappedComponent.name || "Component";
  ProtectedComponent.displayName = `withRoleProtection(${name})`;

  return ProtectedComponent;
};
