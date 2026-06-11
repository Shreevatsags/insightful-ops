import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { useTheme, type Theme } from "@/store/theme";
import { Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
];

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader title="settings" description="Workspace, notifications and integrations." />

      <Section title="Appearance">
        <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">Theme</span>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  theme === opt.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Profile">
        <Field label="Name"><Input defaultValue={user?.name} /></Field>
        <Field label="Email"><Input defaultValue={user?.email} /></Field>
        <Field label="Role"><Input defaultValue={user?.role} disabled /></Field>
      </Section>

      <Section title="Notifications">
        <Toggle label="Email alerts for critical incidents" defaultChecked />
        <Toggle label="Slack webhook notifications" defaultChecked />
        <Toggle label="PagerDuty integration" />
        <Toggle label="Daily digest report" defaultChecked />
      </Section>

      <Section title="Integrations">
        <Field label="Slack webhook URL"><Input placeholder="https://hooks.slack.com/services/..." /></Field>
        <Field label="AWS access key ID"><Input placeholder="AKIA..." /></Field>
        <Field label="Prometheus endpoint"><Input defaultValue="http://prometheus:9090" /></Field>
      </Section>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-gradient mb-4 rounded-xl border border-border p-6">
      <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
