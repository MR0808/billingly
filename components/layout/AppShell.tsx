import Link from "next/link";
import type { WorkspaceWithSettings } from "@/lib/workspace-ensure";
import type { User } from "better-auth/types";

interface AppShellProps {
  workspace: WorkspaceWithSettings;
  user: User;
  children: React.ReactNode;
}

const appNav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/bills", label: "Bills" },
  { href: "/app/bills/new", label: "New bill" },
  { href: "/app/parse", label: "Parse" },
  { href: "/app/inbox", label: "Inbox" },
  { href: "/app/reminders", label: "Reminders" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ workspace, user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-52 flex-col border-r border-border bg-muted/30">
        <div className="flex h-14 items-center border-b border-border px-3">
          <span className="font-semibold">Billingly</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {workspace.name}
          </div>
          {appNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-2 text-xs text-muted-foreground">
          <div className="truncate font-medium">{user.name ?? user.email}</div>
          <form action="/api/auth/sign-out" method="post" className="mt-1">
            <button
              type="submit"
              className="text-primary underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="h-14 shrink-0 border-b border-border px-4 flex items-center" />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
