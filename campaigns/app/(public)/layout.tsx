import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns — Events",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-full">{children}</main>;
}
