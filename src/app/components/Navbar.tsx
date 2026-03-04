import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
            cv
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              codaí voice
            </p>
            <p className="hidden text-xs text-zinc-500 md:block dark:text-zinc-400">
              Fale. Gere componentes. Refine.
            </p>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300"
        >
          <Link href="/">
            <Button variant="default" size="sm" className="h-8 px-3">
              Studio
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-zinc-400 dark:text-zinc-500 cursor-not-allowed">
            Histórico
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-zinc-400 dark:text-zinc-500 cursor-not-allowed">
            Configurações
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-zinc-400 dark:text-zinc-500 cursor-not-allowed">
            Ajuda
          </Button>
        </nav>
      </div>
    </header>
  );
}
