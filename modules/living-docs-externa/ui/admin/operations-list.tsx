"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

import { sortOperations, type IntegrationManual, type ManualOperation } from "@/modules/living-docs-externa/schema";
import { OperationForm } from "@/modules/living-docs-externa/ui/admin/operation-form";

interface OperationsListProps {
  slug: string;
  manual: IntegrationManual;
}

type PanelState =
  | { type: "idle" }
  | { type: "create" }
  | { type: "edit"; operation: ManualOperation };

function operationKey(operation: ManualOperation): string {
  return `${operation.kind}:${operation.name}`;
}

export function OperationsList({ slug, manual }: OperationsListProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<PanelState>({ type: "idle" });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const operations = sortOperations(manual);

  async function handleDelete(operation: ManualOperation) {
    const key = operationKey(operation);
    if (!window.confirm(`Remover a operação "${key}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeleteError(null);
    setDeletingKey(key);

    try {
      const response = await fetch(
        `/api/living-docs/projects/${slug}/operations/${operation.kind}/${operation.name}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setDeleteError(payload.error ?? "Não foi possível remover a operação.");
        return;
      }

      router.refresh();
    } catch {
      setDeleteError("Erro de rede ao remover a operação.");
    } finally {
      setDeletingKey(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {operations.length} operaç{operations.length === 1 ? "ão" : "ões"} cadastrada
          {operations.length === 1 ? "" : "s"}.
        </p>
        {panel.type === "idle" ? (
          <button
            type="button"
            onClick={() => setPanel({ type: "create" })}
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            Nova operação
          </button>
        ) : null}
      </div>

      {panel.type === "create" ? (
        <OperationForm
          slug={slug}
          mode="create"
          onDone={() => setPanel({ type: "idle" })}
          onCancel={() => setPanel({ type: "idle" })}
        />
      ) : null}

      {deleteError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {deleteError}
        </p>
      ) : null}

      {operations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
          Nenhuma operação cadastrada neste manual ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Ordem</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operations.map((operation) => {
                const key = operationKey(operation);
                const isEditing = panel.type === "edit" && operationKey(panel.operation) === key;

                return (
                  <Fragment key={key}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{operation.order}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-700">
                          {operation.kind}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-800">{operation.name}</td>
                      <td className="px-4 py-3 text-slate-700">{operation.title ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setPanel(
                                isEditing ? { type: "idle" } : { type: "edit", operation }
                              )
                            }
                            className="font-medium text-brand-700 hover:underline"
                          >
                            {isEditing ? "Fechar" : "Editar"}
                          </button>
                          <button
                            type="button"
                            disabled={deletingKey === key}
                            onClick={() => handleDelete(operation)}
                            className="font-medium text-red-700 hover:underline disabled:opacity-60"
                          >
                            {deletingKey === key ? "Removendo…" : "Remover"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isEditing ? (
                      <tr>
                        <td colSpan={5} className="bg-slate-50 px-4 py-4">
                          <OperationForm
                            slug={slug}
                            mode="edit"
                            operation={operation}
                            onDone={() => setPanel({ type: "idle" })}
                            onCancel={() => setPanel({ type: "idle" })}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
