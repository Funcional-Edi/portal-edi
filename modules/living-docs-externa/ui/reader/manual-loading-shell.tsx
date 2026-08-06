/**
 * Skeleton exibido por `loading.tsx` enquanto o Server Component da rota
 * carrega. Melhora a percepção de velocidade — o usuário vê feedback imediato
 * no clique, mesmo quando o dev ainda compila a rota.
 */
export function ManualLoadingShell({ variant = "content" }: { variant?: "catalog" | "content" }) {
  return (
    <div className="min-h-screen animate-pulse bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-8 w-20 rounded bg-slate-100" />
        </div>
      </div>

      <main
        className={`mx-auto px-6 py-10 ${variant === "catalog" ? "max-w-4xl" : "max-w-7xl"}`}
      >
        {variant === "catalog" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-72 max-w-full rounded bg-slate-200" />
              <div className="h-4 w-full max-w-lg rounded bg-slate-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-xl border border-slate-200 bg-white" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="hidden space-y-4 lg:block">
              <div className="h-48 rounded-lg border border-slate-200 bg-white" />
              <div className="h-64 rounded-lg border border-slate-200 bg-white" />
            </aside>
            <div className="space-y-4">
              <div className="h-8 w-2/3 max-w-md rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
              <div className="mt-6 h-56 rounded-lg border border-slate-200 bg-white" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
