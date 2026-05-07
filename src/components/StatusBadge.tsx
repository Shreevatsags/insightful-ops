import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  online: "bg-success/15 text-success border-success/30",
  running: "bg-success/15 text-success border-success/30",
  resolved: "bg-success/15 text-success border-success/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
  restarting: "bg-warning/15 text-warning border-warning/30",
  monitoring: "bg-warning/15 text-warning border-warning/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  identified: "bg-info/15 text-info border-info/30",
  investigating: "bg-info/15 text-info border-info/30",
  info: "bg-info/15 text-info border-info/30",
  stopped: "bg-muted text-muted-foreground border-border",
  exited: "bg-muted text-muted-foreground border-border",
  offline: "bg-destructive/15 text-destructive border-destructive/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs",
        styles[key] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
