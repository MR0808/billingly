import Link from "next/link";
import type { User } from "better-auth/types";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/workspaces", label: "Workspaces" },
  { href: "/admin/bills", label: "Bills" },
  { href: "/admin/parse-jobs", label: "Parse jobs" },
  { href: "/admin/reminders", label: "Reminders" },
];

export function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-60 flex-col border-r border-border bg-muted/30">
        <div className="flex h-14 items-center border-b border-border px-3">
          <span className="font-semibold tracking-tight">Billingly Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          {user.email}
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}

