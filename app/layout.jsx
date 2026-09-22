export const metadata = {
  title: "Odd Hours — depth work for curious people",
  description:
    "Experiential psychology group workshops exploring the unconscious through conversation, symbols, drawing, intuition, imagination, play and other people.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
