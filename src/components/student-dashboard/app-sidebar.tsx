"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutGrid, LogOut, Settings, FileText, Calendar } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: "/", icon: Calendar, label: "Calendário" },
  { href: "/report", icon: FileText, label: "Aulas" },
  { href: "/settings", icon: Settings, label: "Ajustes" },
];

const NavLink = ({
  href,
  icon: Icon,
  label,
  isMobile = false
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isMobile?: boolean;
}) => {
  const pathname = usePathname();
  const active = pathname === href || (href === '/' && pathname.startsWith('/dashboard'));

  if (isMobile) {
    return (
       <Link
          href={href}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-xs p-2 rounded-lg transition-colors w-20",
            active
              ? "bg-primary text-primary-foreground"
              : "text-slate-400 hover:bg-secondary hover:text-white"
          )}
        >
          <Icon size={20} />
          <span>{label}</span>
       </Link>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors",
              active
                ? "bg-secondary text-primary"
                : "bg-transparent text-slate-500 hover:bg-secondary hover:text-white"
            )}
          >
            <Icon size={24} />
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-card border-border text-white">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};

export function AppSidebar() {
  return (
    <aside className="w-20 bg-card border-r border-border flex-col items-center py-6 gap-4 shrink-0 hidden sm:flex">
      {navLinks.map(link => (
        <NavLink key={link.href} {...link} />
      ))}
      <div className="mt-auto">
        <NavLink href="/logout" icon={LogOut} label="Sair" />
      </div>
    </aside>
  );
}

export function AppBottomNav() {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-50">
        {navLinks.map(link => (
          <NavLink key={link.href} {...link} isMobile />
        ))}
    </nav>
  )
}
