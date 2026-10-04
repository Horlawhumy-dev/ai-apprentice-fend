import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apprentice",
  description:
    "Practise on fresh cases and get coached only by rules the expert actually confirmed.",
};

export default function ApprenticeLayout({ children }: LayoutProps<"/apprentice">) {
  return children;
}
