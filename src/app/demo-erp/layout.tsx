import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo ERP",
  description:
    "A throwaway ERP you can safely instrument. Every click, field change and submit is captured into the active session.",
};

export default function DemoErpLayout({ children }: LayoutProps<"/demo-erp">) {
  return children;
}
