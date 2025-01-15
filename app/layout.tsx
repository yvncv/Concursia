import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavbarControl from "./ui/navbar/navbar-control";
import PageTransition from "./ui/page-transition/PageTransition";
import StairTransition from "./ui/page-transition/StairTransition";
import Footer from "./ui/footer/footer";
import { brandName } from "./page";

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
    <html lang="es" translate="yes">
      <body className={`${poppins.variable} antialiased`}>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <NavbarControl brandName={brandName} />
        <StairTransition />
        <PageTransition>{children}</PageTransition>
        <Footer brandName={brandName} />
      </body>
    </html>
  );
}
