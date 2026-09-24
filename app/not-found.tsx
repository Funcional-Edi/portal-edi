import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Página não encontrada
        </h1>
        <p className="mt-3 text-slate-600">
          O conteúdo que você tentou acessar não está disponível ou foi movido.
        </p>
        <Link
          href="/docs"
          className="mt-6 inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Voltar à documentação
        </Link>
      </div>
    </main>
  );
}
