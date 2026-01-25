import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-border/50 hover:shadow-xl transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold font-display text-primary tracking-tight">
            {value}
          </h3>
          {trend && (
            <p className={cn("mt-2 text-sm font-medium flex items-center gap-1", trendUp ? "text-green-600" : "text-red-600")}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/5 rounded-xl text-primary">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
