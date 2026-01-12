"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  Icon: LucideIcon;
  progress: number;
  trendText?: string;
  color: 'blue' | 'yellow' | 'purple' | 'emerald' | 'pink' | 'indigo';
}

const colorClasses = {
  blue: {
    border: "hover:border-blue-500",
    icon: "text-blue-500",
    progress: "bg-blue-500",
  },
  yellow: {
    border: "hover:border-yellow-500",
    icon: "text-yellow-500",
    progress: "bg-yellow-500",
  },
  purple: {
    border: "hover:border-purple-500",
    icon: "text-purple-500",
    progress: "bg-purple-500",
  },
  emerald: {
    border: "hover:border-emerald-500",
    icon: "text-emerald-500",
    progress: "bg-emerald-500",
  },
  pink: {
    border: "hover:border-pink-500",
    icon: "text-pink-500",
    progress: "bg-pink-500",
  },
  indigo: {
    border: "hover:border-indigo-500",
    icon: "text-indigo-500",
    progress: "bg-indigo-500",
  }
}

export function StatCard({ title, value, unit, Icon, progress, trendText, color }: StatCardProps) {
  return (
    <Card className={cn(
      "bg-card rounded-2xl p-3 sm:p-4 border border-border relative overflow-hidden group transition",
      colorClasses[color].border
      )}>
      <div className="absolute -right-2 -top-2 p-3 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className={cn("text-5xl sm:text-7xl", colorClasses[color].icon)} />
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 truncate">{title}</p>
      <div className="flex items-end gap-1 sm:gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white leading-none">{value}</span>
        {unit && <span className="text-xs text-slate-400 mb-1">{unit}</span>}
        {trendText && (
          <span className="text-xs text-green-400 mb-1 flex items-center whitespace-nowrap">
            {trendText}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-700 h-1 mt-2 sm:mt-3 rounded-full overflow-hidden">
        <Progress value={progress} indicatorClassName={colorClasses[color].progress} className="h-1 bg-slate-700"/>
      </div>
    </Card>
  );
}
