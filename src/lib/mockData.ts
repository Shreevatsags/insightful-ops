// Mock data utilities simulating live infrastructure metrics.
// In production, these would be replaced with Socket.io streams from backend.

export type MetricPoint = { time: string; value: number };

const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });

export function seedSeries(base: number, variance: number, length = 30): MetricPoint[] {
  const out: MetricPoint[] = [];
  let v = base;
  const t = Date.now();
  for (let i = length - 1; i >= 0; i--) {
    v = clamp(v + (Math.random() - 0.5) * variance, 5, 98);
    out.push({
      time: new Date(t - i * 5000).toLocaleTimeString("en-US", { hour12: false }),
      value: +v.toFixed(1),
    });
  }
  return out;
}

export function nextPoint(prev: MetricPoint[], variance = 8): MetricPoint[] {
  const last = prev[prev.length - 1]?.value ?? 50;
  const v = clamp(last + (Math.random() - 0.5) * variance, 5, 98);
  return [...prev.slice(1), { time: now(), value: +v.toFixed(1) }];
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const mockServers = [
  { id: "srv-01", name: "api-prod-01", region: "us-east-1", status: "online", uptime: "42d 3h" },
  { id: "srv-02", name: "api-prod-02", region: "us-east-1", status: "online", uptime: "42d 3h" },
  { id: "srv-03", name: "worker-eu-01", region: "eu-west-1", status: "online", uptime: "12d 7h" },
  { id: "srv-04", name: "db-replica-01", region: "us-west-2", status: "degraded", uptime: "8d 2h" },
  { id: "srv-05", name: "cache-01", region: "ap-south-1", status: "offline", uptime: "—" },
];

export const mockContainers = [
  { id: "c1a2b3", name: "nginx-proxy", image: "nginx:1.27-alpine", status: "running", cpu: 2.3, mem: 48 },
  { id: "d4e5f6", name: "api-server", image: "node:20-slim", status: "running", cpu: 38.1, mem: 412 },
  { id: "g7h8i9", name: "postgres-main", image: "postgres:16", status: "running", cpu: 12.6, mem: 768 },
  { id: "j0k1l2", name: "redis-cache", image: "redis:7-alpine", status: "running", cpu: 4.2, mem: 96 },
  { id: "m3n4o5", name: "worker-jobs", image: "node:20-slim", status: "restarting", cpu: 0, mem: 0 },
  { id: "p6q7r8", name: "prometheus", image: "prom/prometheus", status: "running", cpu: 6.8, mem: 220 },
  { id: "s9t0u1", name: "grafana", image: "grafana/grafana", status: "running", cpu: 3.1, mem: 180 },
  { id: "v2w3x4", name: "old-worker", image: "node:18", status: "exited", cpu: 0, mem: 0 },
];

export const mockEC2 = [
  { id: "i-0a1b2c3d4", type: "t3.large", region: "us-east-1", state: "running", cpu: 42, network: 128 },
  { id: "i-0e5f6g7h8", type: "m5.xlarge", region: "us-east-1", state: "running", cpu: 67, network: 412 },
  { id: "i-0i9j0k1l2", type: "t3.medium", region: "eu-west-1", state: "running", cpu: 18, network: 64 },
  { id: "i-0m3n4o5p6", type: "c5.2xlarge", region: "us-west-2", state: "stopped", cpu: 0, network: 0 },
  { id: "i-0q7r8s9t0", type: "t3.small", region: "ap-south-1", state: "running", cpu: 88, network: 220 },
];

export const mockAlerts = [
  { id: "a1", severity: "critical", title: "CPU > 90% on api-prod-02", source: "api-prod-02", time: "2m ago", ack: false },
  { id: "a2", severity: "warning", title: "Disk usage 82% on db-replica-01", source: "db-replica-01", time: "14m ago", ack: false },
  { id: "a3", severity: "critical", title: "Container worker-jobs crashed", source: "worker-jobs", time: "21m ago", ack: false },
  { id: "a4", severity: "info", title: "Deployment v2.14.0 completed", source: "ci-pipeline", time: "1h ago", ack: true },
  { id: "a5", severity: "warning", title: "Memory > 85% on cache-01", source: "cache-01", time: "2h ago", ack: true },
  { id: "a6", severity: "critical", title: "Server cache-01 unreachable", source: "cache-01", time: "3h ago", ack: false },
];

export const mockIncidents = [
  { id: "INC-1042", title: "Payment API latency spike", severity: "high", status: "investigating", assignedTo: "Sarah K.", created: "12m ago" },
  { id: "INC-1041", title: "EU region intermittent 502s", severity: "critical", status: "identified", assignedTo: "Marcus L.", created: "47m ago" },
  { id: "INC-1040", title: "Background job queue backlog", severity: "medium", status: "monitoring", assignedTo: "Priya R.", created: "2h ago" },
  { id: "INC-1039", title: "Grafana dashboard rendering slow", severity: "low", status: "resolved", assignedTo: "James T.", created: "yesterday" },
  { id: "INC-1038", title: "Database failover triggered", severity: "high", status: "resolved", assignedTo: "Sarah K.", created: "2d ago" },
];

export const mockLogs = Array.from({ length: 80 }).map((_, i) => {
  const levels = ["INFO", "INFO", "INFO", "DEBUG", "WARN", "ERROR"] as const;
  const sources = ["api-server", "nginx-proxy", "worker-jobs", "postgres-main", "auth-service"];
  const messages = [
    "Request handled in 24ms",
    "Cache miss for key user:profile:8821",
    "Connection pool size: 12/20",
    "Slow query detected (1.2s)",
    "JWT verification failed: token expired",
    "Health check OK",
    "Garbage collection: 8ms",
    "Webhook delivered to https://hooks.slack.com/...",
    "Rate limit exceeded for 192.168.1.42",
    "Migration 20240507_add_index applied",
  ];
  const t = new Date(Date.now() - i * 7500);
  return {
    id: `log-${i}`,
    time: t.toISOString().replace("T", " ").slice(0, 19),
    level: levels[Math.floor(Math.random() * levels.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  };
});
