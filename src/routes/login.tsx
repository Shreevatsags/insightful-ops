import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TerminalSquare } from "lucide-react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("admin@obsrv.io");
  const [pw, setPw] = useState("demo1234");

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <form
        onSubmit={(e) => { e.preventDefault(); login(email, pw); navigate({ to: "/dashboard" }); }}
        className="card-gradient relative z-10 w-full max-w-sm rounded-2xl border border-border p-8 shadow-[var(--shadow-card)]"
      >
        <div className="mb-6 flex items-center gap-2 font-mono">
          <div className="h-8 w-8 rounded-md bg-primary/15 grid place-items-center text-primary">
            <TerminalSquare className="h-5 w-5" />
          </div>
          <span className="font-semibold text-gradient">obsrv.io</span>
        </div>
        <h1 className="font-mono text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, operator.</p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full glow-primary">Sign in →</Button>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
