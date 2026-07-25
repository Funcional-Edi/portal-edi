import { registerAllModules, listBlockedModules } from "@/modules/registry";

/**
 * Landing = "planta viva" do portal: a lista de módulos é DERIVADA do
 * module-registry (não escrita à mão). Ao adicionar um módulo, ele aparece aqui
 * automaticamente. Módulos bloqueados por falta de banco ficam sinalizados.
 */
export default function HomePage() {
  const modules = registerAllModules();
  const blocked = new Map(
    listBlockedModules().map((entry) => [entry.module.id, entry.missing])
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-medium text-brand-700">Time EDI / Tecnologia</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Portal de Integração
        </h1>
        <p className="mt-3 text-slate-600">
          Fundação modular rodando. Cada módulo abaixo é um contexto isolado,
          registrado na fundação. Esta lista é gerada do código — não desenhada à
          mão.
        </p>
      </header>

      <ul className="space-y-3">
        {modules.map((module) => {
          const missing = blocked.get(module.id);
          return (
            <li
              key={module.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{module.title}</span>
                <span
                  className={
                    module.status === "active"
                      ? "rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                      : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                  }
                >
                  {module.status === "active" ? "ativo" : "planejado"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{module.description}</p>
              {missing && missing.length > 0 ? (
                <p className="mt-2 text-xs text-amber-700">
                  Bloqueado — exige banco: {missing.join(", ")} (ver ADR-0002)
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
