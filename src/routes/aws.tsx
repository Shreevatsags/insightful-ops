import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Server, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { LiveChart } from "@/components/LiveChart";
import { StatusBadge } from "@/components/StatusBadge";
import { mockEC2 } from "@/lib/mockData";

export const Route = createFileRoute("/aws")({ component: AWSPage });

function AWSPage() {
  const running = mockEC2.filter((i) => i.state === "running").length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader title="aws / ec2" description="EC2 instances and CloudWatch metrics across regions." />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="EC2 instances" value={mockEC2.length} delta={`${running} running`} icon={Server} tone="primary" />
        <MetricCard label="Regions" value={new Set(mockEC2.map((i) => i.region)).size} icon={Cloud} tone="info" />
        <MetricCard label="CloudWatch" value="connected" icon={Activity} tone="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LiveChart title="EC2 fleet CPU" base={48} variance={10} color="var(--color-chart-1)" />
        <LiveChart title="Network out" base={62} variance={18} color="var(--color-chart-2)" unit=" Mbps" />
      </div>

      <div className="mt-6 card-gradient rounded-xl border border-border">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-medium">EC2 instances</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Instance ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium text-right">CPU</th>
                <th className="px-4 py-3 font-medium text-right">Net I/O</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {mockEC2.map((i) => (
                <tr key={i.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">{i.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.region}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.state} /></td>
                  <td className="px-4 py-3 text-right">{i.cpu}%</td>
                  <td className="px-4 py-3 text-right">{i.network} MB/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
