import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { mockAlerts } from "@/lib/mockData";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const ack = (id: string) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, ack: true } : x)));
    toast.success("Alert acknowledged");
  };
  const open = alerts.filter((a) => !a.ack);
  const acked = alerts.filter((a) => a.ack);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="alerts" description="Threshold-based and anomaly alerts across your infrastructure." />

      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Open · {open.length}
      </h2>
      <div className="space-y-2">
        <AnimatePresence>
          {open.map((a) => (
            <motion.div
              key={a.id} layout
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="card-gradient flex items-center justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {a.source} · {a.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={a.severity} />
                <Button size="sm" variant="outline" onClick={() => ack(a.id)}>
                  <Check className="mr-1 h-3 w-3" /> Ack
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <h2 className="mt-8 mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Acknowledged · {acked.length}
      </h2>
      <div className="space-y-2 opacity-60">
        {acked.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-success" />
              <span className="text-sm">{a.title}</span>
            </div>
            <StatusBadge status={a.severity} />
          </div>
        ))}
      </div>
    </div>
  );
}
