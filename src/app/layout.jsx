import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Navigation";
import ToastProvider from "@/components/ToastProvider";
import { CatalogProvider } from "@/context/CatalogContext";

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
    <html lang="es" data-theme="dark">
      <body
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CatalogProvider>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 bg-base-200 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
          <ToastProvider />
        </CatalogProvider>
      </body>
    </html>
  );
}
