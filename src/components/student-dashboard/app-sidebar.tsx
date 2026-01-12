"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Trophy, LogOut } from "lucide-react";

const NavLink = ({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors",
            active
              ? "bg-slate-800 text-primary"
              : "bg-transparent text-slate-500 hover:bg-slate-800 hover:text-white"
          )}
        >
          <Icon size={20} />
          <span className="sr-only">{label}</span>
        </a>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function AppSidebar() {
  return (
    <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0 hidden sm:flex">
      <NavLink href="#" icon={LayoutGrid} label="Painel" active />
      <NavLink href="#" icon={Users} label="Alunos" />
      <NavLink href="#" icon={Trophy} label="Rankings" />
      <div className="mt-auto">
        <NavLink href="#" icon={LogOut} label="Sair" />
      </div>
    </aside>
  );
}
