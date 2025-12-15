import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
  coinColor?: string;
}

export const StatsCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  subtitle,
  className,
  coinColor,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "stat-card group animate-fade-in",
        className
      )}
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold font-mono tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium font-mono",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg transition-all duration-300",
            "bg-primary/10 group-hover:bg-primary/20",
            changeType === "positive" && "bg-success/10 group-hover:bg-success/20",
            changeType === "negative" && "bg-destructive/10 group-hover:bg-destructive/20"
          )}
          style={coinColor ? { backgroundColor: `${coinColor}20` } : undefined}
        >
          <Icon
            className={cn(
              "h-5 w-5 transition-colors",
              "text-primary",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive"
            )}
            style={coinColor ? { color: coinColor } : undefined}
          />
        </div>
      </div>
    </div>
  );
};
