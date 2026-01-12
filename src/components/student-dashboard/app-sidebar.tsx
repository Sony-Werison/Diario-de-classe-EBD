"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Trophy, LogOut, Settings } from "lucide-react";
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
          <a
            href={href}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors",
              active
                ? "bg-slate-800 text-primary"
                : "bg-transparent text-slate-500 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon size={24} />
            <span className="sr-only">{label}</span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};

export function AppSidebar() {
  return (
    <aside className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-4 shrink-0 hidden sm:flex">
      <NavLink href="/" icon={LayoutGrid} label="Painel" />
      <NavLink href="/students" icon={Users} label="Alunos" />
      <NavLink href="/rankings" icon={Trophy} label="Rankings" />
      <NavLink href="/settings" icon={Settings} label="Configurações" />
      <div className="mt-auto">
        <NavLink href="/logout" icon={LogOut} label="Sair" />
      </div>
    </aside>
  );
}
