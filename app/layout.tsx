// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import RootLayoutClient from './RootLayoutClient';
import Script from "next/script";


const poppins = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins-regular",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Concursia | Marinera",
  description: "Maqueta de proyecto",
  keywords: "concursos, peru, maqueta, proyecto, marinera",

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" translate="yes">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}