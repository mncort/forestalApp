import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { CatalogProvider } from "@/context/CatalogContext";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gestión Forestal",
  description: "Sistema de gestión de productos forestales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="light">
      <body
        className={`size-full ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <CatalogProvider>
            <ToastProvider />
            {children}
          </CatalogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
