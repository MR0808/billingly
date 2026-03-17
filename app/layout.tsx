import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billingly",
  description: "Bill tracking for your business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
