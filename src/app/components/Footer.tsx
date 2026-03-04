export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white/60 py-4 text-xs text-zinc-500 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-500">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Codaí Voice</p>
          <p>Experimento pessoal © 2026</p>
        </div>
        <p className="hidden max-w-[200px] text-right md:block">
          Design focado em clareza, velocidade e acessibilidade.
        </p>
      </div>
    </footer>
  );
}
