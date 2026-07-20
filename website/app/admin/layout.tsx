import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import AdminProviders from "./providers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: session.user.role ?? "EDITOR",
      }
    : null;

  return (
    <AdminProviders>
      <AdminShell user={user}>{children}</AdminShell>
    </AdminProviders>
  );
}
