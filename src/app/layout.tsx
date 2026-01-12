import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppSidebar, AppBottomNav } from "@/components/student-dashboard/app-sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "EBD Júnior Tracker",
  description: "Painel de controle gamificado para Escola Bíblica Dominical.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-background pb-20 sm:pb-0">{children}</main>
        </div>
        <AppBottomNav />
        <Toaster />
      </body>
    </html>
  );
}
