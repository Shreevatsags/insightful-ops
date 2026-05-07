import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { mockLogs } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/logs")({ component: LogsPage });

const levelColor: Record<string, string> = {
  INFO: "text-info",
  DEBUG: "text-muted-foreground",
  WARN: "text-warning",
  ERROR: "text-destructive",
};

function LogsPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return mockLogs.filter((l) => {
      const matchQ = !q || l.message.toLowerCase().includes(q.toLowerCase()) || l.source.includes(q);
      const matchL = level === "ALL" || l.level === level;
      return matchQ && matchL;
    });
  }, [q, level]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader title="logs" description="Aggregated structured logs from all services." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages or source..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 font-mono text-sm"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "INFO", "WARN", "ERROR", "DEBUG"].map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-xs",
                level === lv
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="card-gradient rounded-xl border border-border">
        <div className="max-h-[70vh] overflow-y-auto font-mono text-xs">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No log entries match your filter.</div>
          )}
          {filtered.map((l) => (
            <div key={l.id} className="flex gap-3 border-b border-border/40 px-4 py-2 last:border-0 hover:bg-muted/20">
              <span className="text-muted-foreground shrink-0">{l.time}</span>
              <span className={cn("w-12 shrink-0 font-semibold", levelColor[l.level])}>{l.level}</span>
              <span className="w-32 shrink-0 truncate text-info">[{l.source}]</span>
              <span className="text-foreground">{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
