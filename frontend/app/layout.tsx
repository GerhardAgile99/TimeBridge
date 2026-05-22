import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowTrack AI — AI-powered work logging",
  description: "AI agent automatically detects work, drafts timesheets, and keeps your team aligned.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="h-full overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
