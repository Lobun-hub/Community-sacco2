import Link from "next/link";
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
        <header className="bg-primary text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3 max-w-[22rem]">
              <div className="flex items-center gap-3">
                <span className="text-accent text-2xl">◆</span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Community SACCO</h1>
                </div>
              </div>
              <div className="overflow-hidden rounded-full border border-white/15 bg-transparent max-w-[22rem]">
                <div className="marquee whitespace-nowrap py-2 text-sm text-green-100 font-medium">
                  <span className="mr-8">Ethical AI • Human Dignity • Financial Growth</span>
                  <span className="mr-8">Ethical AI • Human Dignity • Financial Growth</span>
                </div>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-3 justify-center">
              <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition">
                Home
              </Link>
              <Link href="/dashboard" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition">
                Our Services
              </Link>
              <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition">
                Admin
              </Link>
              <Link href="/login" className="rounded-full bg-white text-primary px-5 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100 transition">
                Login
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-slate-950 text-slate-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-green-300 mb-3">Community SACCO</p>
              <h2 className="text-2xl font-semibold text-white mb-3">Ethical finance for women-led communities.</h2>
              <p className="text-sm text-slate-300 leading-7 max-w-xl">
                We support financial inclusion through transparent lending, local governance, and responsible AI oversight in Wajir County.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-white mb-2">Quick links</p>
                <div className="flex flex-col gap-2 text-sm text-slate-300">
                  <Link href="/" className="hover:text-white">Home</Link>
                  <Link href="/login" className="hover:text-white">Login</Link>
                  <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
                  <Link href="/admin" className="hover:text-white">Admin</Link>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-2">Contact</p>
                <p className="text-sm text-slate-300 leading-7">
                  Nairobi, Kenya<br />
                  support@communitysacco.org<br />
                  +254 700 000 000
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Community SACCO. Built for ethical, community-first financial access.
          </div>
        </footer>
      </body>
    </html>
  );
}

