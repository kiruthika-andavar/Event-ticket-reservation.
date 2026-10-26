import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gatherly — Events worth showing up for",
  description: "Discover events, reserve tickets, and bring people together."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
