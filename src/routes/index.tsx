import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, GitBranch } from "lucide-react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-mono">
          <div className="h-7 w-7 rounded-md bg-primary/15 grid place-items-center text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gradient">obsrv.io</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/register"><Button size="sm">Get started</Button></Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs text-primary">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            v2.14.0 · live
          </span>
          <h1 className="mt-6 font-mono text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Observability for <span className="text-gradient">infrastructure</span><br />that never sleeps.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Real-time metrics, container health, cloud instances, alerts and incidents — unified into one
            terminal-grade dashboard your on-call engineers will actually love.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg" className="glow-primary">Start monitoring →</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Live demo</Button></Link>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "Sub-second alerts", desc: "Streaming metrics over WebSocket. Detect anomalies before users do." },
            { icon: ShieldCheck, title: "Enterprise security", desc: "JWT, RBAC, audit logs, encrypted secrets. SOC2-ready architecture." },
            { icon: GitBranch, title: "Cloud-native", desc: "Docker, Kubernetes, AWS EC2, CloudWatch, Prometheus & Grafana." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="card-gradient rounded-xl border border-border p-6 text-left"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
