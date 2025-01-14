"use client";

import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noMarginRoutes = ["/login", "/register"];
  const shouldApplyMargin = !noMarginRoutes.includes(pathname);

  return (
    <div className={shouldApplyMargin ? "mt-[64px]" : ""}>
      {children}
    </div>
  );
}
