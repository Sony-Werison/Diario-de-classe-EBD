
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import AppLayout from "./AppLayout";
import { DataProvider } from "@/contexts/DataContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Diário de classe EBD - ICABV",
  description: "Painel de controle para Escola Bíblica Dominical.",
  openGraph: {
    title: "Diário de classe EBD - ICABV",
    description: "Painel de controle para Escola Bíblica Dominical.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Diário de classe EBD - ICABV",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head></head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <DataProvider>
            <AppLayout>{children}</AppLayout>
        </DataProvider>
        <Toaster />
      </body>
    </html>
  );
}
