import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community SACCO | Ethical AI Lending",
  description: "Empowering women in rural Kenya through ethical AI-powered financial services.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-dark`}>
        <nav className="bg-primary text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-accent">◆</span> Community SACCO
            </h1>
            <div className="text-sm">Ethical AI • Human Dignity • Financial Growth</div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}