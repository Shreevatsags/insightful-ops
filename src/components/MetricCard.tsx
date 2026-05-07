import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "info" | "warning" | "destructive";
};

const toneMap = {
  primary: "text-primary border-primary/30 bg-primary/5",
  info: "text-info border-info/30 bg-info/5",
  warning: "text-warning border-warning/30 bg-warning/5",
  destructive: "text-destructive border-destructive/30 bg-destructive/5",
};

export function MetricCard({ label, value, unit, delta, icon: Icon, tone = "primary" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient relative overflow-hidden rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold text-foreground">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className={cn("rounded-lg border p-2", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute -bottom-px left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </motion.div>
  );
}
