import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { nextPoint, seedSeries, type MetricPoint } from "@/lib/mockData";

type Props = {
  title: string;
  base?: number;
  variance?: number;
  color?: string;
  unit?: string;
  height?: number;
};

export function LiveChart({ title, base = 45, variance = 10, color = "var(--color-primary)", unit = "%", height = 200 }: Props) {
  const [data, setData] = useState<MetricPoint[]>(() => seedSeries(base, variance));

  useEffect(() => {
    const id = setInterval(() => setData((d) => nextPoint(d, variance)), 2000);
    return () => clearInterval(id);
  }, [variance]);

  const current = data[data.length - 1]?.value ?? 0;
  const id = `grad-${title.replace(/\s+/g, "-")}`;

  return (
    <div className="card-gradient rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="font-mono text-2xl font-semibold" style={{ color }}>
            {current}{unit}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full" style={{ background: color }} />
          live
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} interval="preserveEnd" minTickGap={40} />
          <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--color-muted-foreground)" }}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
