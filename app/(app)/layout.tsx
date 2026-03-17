import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { ensureWorkspaceForUser } from "@/lib/workspace-ensure";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const workspace = await ensureWorkspaceForUser(
    session.user.id,
    session.user.name ?? "User"
  );

  return (
    <AppShell workspace={workspace} user={session.user}>
      {children}
    </AppShell>
  );
}
