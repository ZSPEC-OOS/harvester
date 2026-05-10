import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/providers/UserProvider";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DeepScholar — AI Research Platform",
  description: "Autonomous deep research powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <ErrorBoundary><UserProvider>{children}<Toaster richColors position="top-right" /></UserProvider></ErrorBoundary>
      </body>
    </html>
  );
}
