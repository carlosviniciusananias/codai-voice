import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="flex flex-col gap-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin DX</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Escolha uma ferramenta de operacao do workflow.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/workflow"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Abrir Dashboard de Workflow
        </Link>
        <Link
          href="/admin/prompts"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Abrir Playground de Prompts
        </Link>
      </div>
    </section>
  );
}
