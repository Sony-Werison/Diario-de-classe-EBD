
"use client";

import { usePathname } from "next/navigation";
import { AppSidebar, AppBottomNav } from "@/components/student-dashboard/app-sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/';

    return (
        <>
            <div className="flex h-screen">
                {!isLoginPage && <AppSidebar />}
                <main className="flex-1 overflow-y-auto bg-background pb-16 sm:pb-0">{children}</main>
            </div>
            {!isLoginPage && <AppBottomNav />}
        </>
    );
}
