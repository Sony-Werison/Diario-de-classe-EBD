"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Trophy, LogOut, Settings, CalendarCheck } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => {
  const pathname = usePathname();
  const active = pathname === href;

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
    <aside className="w-20 bg-card border-r border-border flex flex-col items-center py-6 gap-4 shrink-0 hidden sm:flex">
      <NavLink href="/" icon={LayoutGrid} label="Painel" />
      <NavLink href="/rankings" icon={Trophy} label="Rankings" />
      <NavLink href="/report" icon={CalendarCheck} label="Relatório Mensal" />
      <NavLink href="/settings" icon={Settings} label="Configurações" />
      <div className="mt-auto">
        <NavLink href="/logout" icon={LogOut} label="Sair" />
      </div>
    </aside>
  );
}
