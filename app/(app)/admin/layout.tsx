import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const userWithRole = session.user as typeof session.user & {
    role?: string;
  };

  if (userWithRole.role !== "PLATFORM_ADMIN") {
    redirect("/app");
  }

  return <AdminShell user={userWithRole}>{children}</AdminShell>;
}

