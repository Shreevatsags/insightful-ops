import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Boxes, RotateCw, Square, FileText, Cpu, MemoryStick } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { LiveChart } from "@/components/LiveChart";
import { mockContainers } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/docker")({ component: DockerPage });

type ActionType = "restart" | "stop";
type PendingAction =
  | { scope: "single"; type: ActionType; names: string[] }
  | { scope: "bulk"; type: ActionType; names: string[] }
  | null;

function DockerPage() {
  const running = mockContainers.filter((c) => c.status === "running").length;
  const totalMem = mockContainers.reduce((a, c) => a + c.mem, 0);
  const totalCpu = mockContainers.reduce((a, c) => a + c.cpu, 0);

  const [pending, setPending] = useState<PendingAction>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => mockContainers.map((c) => c.id), []);
  const allSelected = selected.size > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(allIds) : new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectedNames = useMemo(
    () => mockContainers.filter((c) => selected.has(c.id)).map((c) => c.name),
    [selected],
  );

  const requestBulk = (type: ActionType) => {
    if (selectedNames.length === 0) return;
    setPending({ scope: "bulk", type, names: selectedNames });
  };

  const confirmAction = () => {
    if (!pending) return;
    const verb = pending.type === "restart" ? "Restarting" : "Stopped";
    if (pending.scope === "bulk") {
      toast(`${verb} ${pending.names.length} container${pending.names.length === 1 ? "" : "s"}`);
      setSelected(new Set());
    } else {
      const name = pending.names[0];
      if (pending.type === "restart") toast.success(`Restarting ${name}...`);
      else toast(`Stopped ${name}`);
    }
    setPending(null);
  };

  const isRestart = pending?.type === "restart";
  const isBulk = pending?.scope === "bulk";

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader title="docker" description="Container fleet status, resource consumption, and lifecycle controls." />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Running" value={running} delta={`${mockContainers.length} total`} icon={Boxes} tone="primary" />
        <MetricCard label="Aggregate CPU" value={totalCpu.toFixed(1)} unit="%" icon={Cpu} tone="info" />
        <MetricCard label="Aggregate memory" value={totalMem} unit=" MB" icon={MemoryStick} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LiveChart title="Fleet CPU usage" base={32} variance={9} color="var(--color-info)" />
        <LiveChart title="Fleet memory usage" base={58} variance={6} color="var(--color-warning)" />
      </div>

      <div className="mt-6 card-gradient rounded-xl border border-border">
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium">Containers</h2>
            {selected.size > 0 && (
              <span className="text-xs text-muted-foreground font-mono">
                {selected.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={selected.size === 0}
              onClick={() => requestBulk("restart")}
            >
              <RotateCw className="h-3.5 w-3.5" />
              Restart selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={selected.size === 0}
              onClick={() => requestBulk("stop")}
            >
              <Square className="h-3.5 w-3.5" />
              Stop selected
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label="Select all containers"
                  />
                </th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">CPU</th>
                <th className="px-4 py-3 font-medium text-right">Memory</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {mockContainers.map((c) => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={(v) => toggleOne(c.id, v === true)}
                      aria-label={`Select ${c.name}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.image}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right">{c.cpu}%</td>
                  <td className="px-4 py-3 text-right">{c.mem} MB</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Restart ${c.name}`}
                        onClick={() => setPending({ scope: "single", type: "restart", names: [c.name] })}
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Stop ${c.name}`}
                        onClick={() => setPending({ scope: "single", type: "stop", names: [c.name] })}
                      >
                        <Square className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`View logs for ${c.name}`}
                        onClick={() => toast(`Streaming logs for ${c.name}`)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBulk
                ? isRestart
                  ? `Restart ${pending?.names.length} containers?`
                  : `Stop ${pending?.names.length} containers?`
                : isRestart
                  ? "Restart container?"
                  : "Stop container?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  {isBulk
                    ? isRestart
                      ? "All selected containers will be restarted simultaneously. In-flight requests may be dropped."
                      : "All selected containers will be terminated until manually started again."
                    : (
                      <>
                        {isRestart ? "This will restart " : "This will stop "}
                        <span className="font-mono text-foreground">{pending?.names[0]}</span>
                        {isRestart
                          ? ". In-flight requests may be dropped during the restart."
                          : ". The container will be terminated until manually started again."}
                      </>
                    )}
                </p>
                {isBulk && pending && (
                  <ul className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-2 font-mono text-xs text-foreground">
                    {pending.names.map((n) => (
                      <li key={n} className="px-1 py-0.5">{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={!isRestart ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
            >
              {isRestart
                ? isBulk ? `Restart ${pending?.names.length}` : "Restart"
                : isBulk ? `Stop ${pending?.names.length}` : "Stop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
