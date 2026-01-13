
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LogOut, Settings, FileText, Calendar, User, ClipboardEdit, Users } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from "react";
import { DataContext } from "@/contexts/DataContext";
import Image from "next/image";

const navLinks = [
  { href: "/calendar", icon: Calendar, label: "Calendário" },
  { href: "/report", icon: FileText, label: "Relatório" },
  { href: "/settings", icon: Users, label: "Turmas" },
  { href: "/configuracoes", icon: Settings, label: "Configurações" },
];

const mobileNavLinks = [
  { href: "/calendar", icon: Calendar, label: "Calendário" },
  { href: "/report", icon: FileText, label: "Relatório" },
  { href: "/settings", icon: Users, label: "Turmas" },
  { href: "/configuracoes", icon: Settings, label: "Configurações" },
]

const NavLink = ({
  href,
  icon: Icon,
  label,
  isMobile = false,
  onClick
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isMobile?: boolean;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  let active = pathname.startsWith(href) && (href !== '/' || pathname === '/');
  
  if(href === '/calendar' && pathname.startsWith('/dashboard')) {
    active = true;
  }

  if (isMobile) {
    return (
       <Link
          href={href}
          onClick={onClick}
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
            onClick={onClick}
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

const handleLogout = () => {
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('teacherId');
};

export function AppSidebar() {
  const dataContext = useContext(DataContext);
  const { fullData } = dataContext || {};

  const [currentUser, setCurrentUser] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const role = sessionStorage.getItem('userRole') || 'admin';
    const teacherId = sessionStorage.getItem('teacherId');
    let currentUserName = role;
    
    if (fullData && role === 'teacher' && teacherId) {
        const allTeachers = fullData.classes.flatMap(c => c.teachers);
        const teacher = allTeachers.find(t => t.id === teacherId);
        if (teacher) {
            currentUserName = teacher.name;
        }
    }
    setCurrentUser(currentUserName);
    
  }, [fullData]);

  return (
    <aside className="w-20 bg-card border-r border-border flex-col items-center py-6 gap-4 shrink-0 hidden sm:flex">
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-xl" />
      </Link>
      
      {isClient && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700">
                <User size={24} className="text-slate-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card border-border text-white">
              <p className="capitalize">{currentUser}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="flex flex-col gap-4 mt-auto">
        {navLinks.map(link => (
          <NavLink key={link.href} {...link} />
        ))}
      </div>
      
      <div className="mt-auto">
        <NavLink href="/" icon={LogOut} label="Sair" onClick={handleLogout} />
      </div>
    </aside>
  );
}

export function AppBottomNav() {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-50">
        {mobileNavLinks.map(link => (
          <NavLink key={link.href} {...link} isMobile />
        ))}
         <NavLink href="/" icon={LogOut} label="Sair" isMobile onClick={handleLogout} />
    </nav>
  )
}
