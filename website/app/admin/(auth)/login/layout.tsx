import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Rev. Isaac Mpamaugo CMS",
  description: "Authorized personnel only. Sign in to manage the ministry website.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
