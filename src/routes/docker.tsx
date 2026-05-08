import { createFileRoute } from "@tanstack/react-router";
import { Boxes, RotateCw, Square, FileText, Cpu, MemoryStick } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { LiveChart } from "@/components/LiveChart";
import { mockContainers } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/docker")({ component: DockerPage });

function DockerPage() {
  const running = mockContainers.filter((c) => c.status === "running").length;
  const totalMem = mockContainers.reduce((a, c) => a + c.mem, 0);
  const totalCpu = mockContainers.reduce((a, c) => a + c.cpu, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader title="docker" description="Container fleet status, resource consumption, and lifecycle controls." />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Running" value={running} delta={`${mockContainers.length} total`} icon={Boxes} tone="primary" />
        <MetricCard label="Aggregate CPU" value={totalCpu.toFixed(1)} unit="%" icon={Boxes} tone="info" />
        <MetricCard label="Aggregate memory" value={totalMem} unit=" MB" icon={Boxes} tone="warning" />
      </div>

      <div className="mt-6 card-gradient rounded-xl border border-border">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-medium">Containers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
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
                  <td className="px-4 py-3 text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.image}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right">{c.cpu}%</td>
                  <td className="px-4 py-3 text-right">{c.mem} MB</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => toast.success(`Restarting ${c.name}...`)}>
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => toast(`Stopped ${c.name}`)}>
                        <Square className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => toast(`Streaming logs for ${c.name}`)}>
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
    </div>
  );
}
