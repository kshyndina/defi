import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Odd Hours — depth work for curious people",
  description:
    "Experiential psychology group workshops exploring the unconscious through conversation, symbols, drawing, intuition, imagination, play and other people.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
