import { createFileRoute } from "@tanstack/react-router";
import { Cpu, MemoryStick, HardDrive, Activity, Server, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { LiveChart } from "@/components/LiveChart";
import { StatusBadge } from "@/components/StatusBadge";
import { mockServers } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="overview"
        description="Real-time fleet metrics across all monitored infrastructure."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="CPU avg" value="42.6" unit="%" delta="+2.1% last 5m" icon={Cpu} tone="primary" />
        <MetricCard label="Memory" value="68.2" unit="%" delta="12.4 / 32 GB used" icon={MemoryStick} tone="info" />
        <MetricCard label="Disk" value="74" unit="%" delta="488 / 660 GB" icon={HardDrive} tone="warning" />
        <MetricCard label="Active alerts" value="4" delta="3 critical · 1 warning" icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LiveChart title="CPU usage" base={42} variance={12} color="var(--color-chart-1)" />
        <LiveChart title="Memory usage" base={68} variance={6} color="var(--color-chart-2)" />
        <LiveChart title="Disk I/O" base={55} variance={20} color="var(--color-chart-3)" unit=" MB/s" />
        <LiveChart title="Network throughput" base={32} variance={25} color="var(--color-chart-4)" unit=" Mbps" />
      </div>

      <div className="mt-6 card-gradient rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">Monitored servers</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{mockServers.length} hosts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Hostname</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Uptime</th>
                <th className="px-4 py-3 font-medium text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {mockServers.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.region}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.uptime}</td>
                  <td className="px-4 py-3 text-right">
                    <Activity className="ml-auto h-4 w-4 text-primary" />
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
