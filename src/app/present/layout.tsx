import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cloak pitch" };

export default function PresentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
