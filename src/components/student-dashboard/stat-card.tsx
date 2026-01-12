"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ArrowUp, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  Icon: LucideIcon;
  progress: number;
  trendText?: string;
  color: 'blue' | 'yellow' | 'purple' | 'emerald';
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
  }
}

export function StatCard({ title, value, unit, Icon, progress, trendText, color }: StatCardProps) {
  return (
    <Card className={cn(
      "bg-slate-800 rounded-2xl p-4 border border-slate-700 relative overflow-hidden group transition",
      colorClasses[color].border
      )}>
      <div className="absolute -right-2 -top-2 p-3 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className={cn("text-6xl sm:text-7xl", colorClasses[color].icon)} />
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 mb-1">{unit}</span>}
        {trendText && (
          <span className="text-xs text-green-400 mb-1 flex items-center">
            {trendText}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-700 h-1 mt-3 rounded-full overflow-hidden">
        <Progress value={progress} indicatorClassName={colorClasses[color].progress} className="h-1 bg-slate-700"/>
      </div>
    </Card>
  );
}
