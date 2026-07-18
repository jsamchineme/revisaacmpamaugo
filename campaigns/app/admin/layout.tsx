import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name ?? "Admin",
        email: session.user.email ?? "",
        role: session.user.role ?? "ADMIN",
      }
    : null;

  return <AdminShell user={user}>{children}</AdminShell>;
}
