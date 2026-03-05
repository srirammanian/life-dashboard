import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Dashboard",
  description: "An AI-driven personal life dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
