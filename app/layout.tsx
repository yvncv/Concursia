import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./ui/navbar/nav-bar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="yes">
      <body
        className={`${poppins.variable} antialiased   justify-center `}
      >
        <Navbar />
        <div className="mt-10">
          {children}
        </div>
      </body>
    </html>
  );
}
