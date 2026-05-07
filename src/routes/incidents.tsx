import { createFileRoute } from "@tanstack/react-router";
import { Siren, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { mockIncidents } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/incidents")({ component: IncidentsPage });

function IncidentsPage() {
  const open = mockIncidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="incidents"
        description="Incident lifecycle, severity tracking and assignments."
        action={
          <Button onClick={() => toast.success("Incident draft created")}>
            <Plus className="mr-1 h-4 w-4" /> New incident
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <MetricCard label="Open" value={open} icon={Siren} tone="destructive" />
        <MetricCard label="Resolved (7d)" value={12} icon={Siren} tone="primary" />
        <MetricCard label="MTTR" value="38" unit=" min" icon={Siren} tone="info" />
      </div>

      <div className="space-y-2">
        {mockIncidents.map((i) => (
          <div
            key={i.id}
            className="card-gradient flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{i.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {i.assignedTo} · {i.created}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={i.severity} />
              <StatusBadge status={i.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
