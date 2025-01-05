import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavbarControl from "./ui/navbar/navbar-control";
import ContentWrapper from "./ui/navbar/content-wrapper"; // Nuevo componente para gestionar el margen

const poppins = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins-regular",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tusuy Perú",
  description: "Maqueta de proyecto",
  keywords: "tusuy, peru, maqueta, proyecto, marinera",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased justify-center`}>
        <NavbarControl />
        <ContentWrapper>{children}</ContentWrapper>
      </body>
    </html>
  );
}
