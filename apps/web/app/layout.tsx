import type { Metadata } from "next";
import { AuthInitializer } from "@/components/AuthInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureOS",
  description: "VentureOS — validate your startup with AI before you build a single line of code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
