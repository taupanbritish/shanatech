import { Suspense, type ReactNode } from "react";
import { AdminShell, AdminShellSkeleton } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth";

async function AuthenticatedShell({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
