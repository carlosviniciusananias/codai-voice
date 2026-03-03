import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codai Voice",
  description: "Converta voz em código React/Next via Groq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
          <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  cv
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    codaí voice
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Fale. Gere componentes. Refine.
                  </p>
                </div>
              </div>

              <nav
                aria-label="Navegação principal"
                className="hidden items-center gap-3 text-xs font-medium text-zinc-600 md:flex dark:text-zinc-300"
              >
                <Link
                  href="/"
                  aria-current="page"
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-50 shadow-sm dark:bg-zinc-50 dark:text-zinc-900"
                >
                  Studio
                </Link>
                <span className="rounded-full px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  Histórico
                </span>
                <span className="rounded-full px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  Configurações
                </span>
                <span className="rounded-full px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  Ajuda
                </span>
              </nav>
            </div>
          </header>

          <main className="mx-auto flex max-w-6xl flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>

          <footer className="border-t border-zinc-200/80 bg-white/60 py-3 text-xs text-zinc-500 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-500">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6">
              <p>Codaí Voice • Experimento pessoal</p>
              <p className="hidden md:block">
                Design focado em clareza, velocidade e acessibilidade.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
