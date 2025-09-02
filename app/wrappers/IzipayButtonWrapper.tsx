

// components/IzipayScriptWrapper.tsx
"use client";
import Script from "next/script";
import { ReactNode } from "react";

interface IzipayScriptWrapperProps {
  children: ReactNode;
}

export default function IzipayScriptWrapper({ children }: IzipayScriptWrapperProps) {
  return (
    <>
      <Script
        src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
        kr-public-key={process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY}
      />
      {/* Scripts que Izipay requiere */}
      <link
        rel="stylesheet"
        href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon-reset.min.css"
      />

      {children}
    </>
  );
}