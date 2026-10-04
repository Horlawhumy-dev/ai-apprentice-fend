import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expert Capture",
  description:
    "Share a screen, work as usual, and narrate the judgement calls the UI can't infer. The session streams into a structured capture you can review.",
};

export default function ExpertLayout({ children }: LayoutProps<"/expert">) {
  return children;
}
