"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ManualOperation,
  ManualSection,
  Project,
} from "@/modules/living-docs-externa/schema";
import type { ManualQualityReport } from "@/modules/living-docs-externa/services/manual-quality";
import { ManualHeaderForm } from "@/modules/living-docs-externa/ui/admin/manual-header-form";
import { NewSectionForm } from "@/modules/living-docs-externa/ui/admin/new-section-form";
import { OperationForm } from "@/modules/living-docs-externa/ui/admin/operation-form";
import { PublishToggle } from "@/modules/living-docs-externa/ui/admin/publish-toggle";
import { QualityChecklist } from "@/modules/living-docs-externa/ui/admin/quality-checklist";
import { SectionEditor } from "@/modules/living-docs-externa/ui/admin/section-editor";
import { SlideOver } from "@/modules/living-docs-externa/ui/admin/slide-over";
import { ManualRoteiro } from "@/modules/living-docs-externa/ui/reader/manual-roteiro";
import {
  docsGuideHref,
  docsOperationHref,
} from "@/modules/living-docs-externa/services/docs-routes";

interface ManualEditorProps {
  project: Project;
  sections: ManualSection[];
  report: ManualQualityReport;
}

type Panel =
  | { type: "idle" }
  | { type: "edit-header" }
  | { type: "new-section" }
  | { type: "new-operation" }
  | { type: "edit-operation"; operation: ManualOperation };

function operationKey(operation: ManualOperation): string {
  return `${operation.kind}:${operation.name}`;
}

/**
 * Editor canônico do manual (etapa 6.1/6.2).
 *
 * Renderiza `ManualRoteiro` — o MESMO componente do leitor — injetando controles
 * de edição nos slots. Assim não existe "tela do admin" e "tela do distribuidor"
 * divergindo: há um layout só, com ou sem controles.
 */
export function ManualEditor({ project, sections, report }: ManualEditorProps) {
  const router = useRouter();
  const slug = project.config.slug;

  const [panel, setPanel] = useState<Panel>({ type: "idle" });
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function closePanel() {
    setPanel({ type: "idle" });
  }

  async function handleDeleteSection(section: ManualSection) {
    if (!window.confirm(`Remover a seção "${section.id}"? O arquivo .md será apagado.`)) return;

    setActionError(null);
    setBusyKey(`section:${section.id}`);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/sections/${section.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setActionError(payload.error ?? "Não foi possível remover a seção.");
        return;
      }

      router.refresh();
    } catch {
      setActionError("Erro de rede ao remover a seção.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteOperation(operation: ManualOperation) {
    const key = operationKey(operation);
    if (!window.confirm(`Remover a operação "${key}"?`)) return;

    setActionError(null);
    setBusyKey(`operation:${key}`);

    try {
      const response = await fetch(
        `/api/living-docs/projects/${slug}/operations/${operation.kind}/${operation.name}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setActionError(payload.error ?? "Não foi possível remover a operação.");
        return;
      }

      router.refresh();
    } catch {
      setActionError("Erro de rede ao remover a operação.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <>
      <ManualRoteiro
        project={project}
        sections={sections}
        editor={{
          banner: (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-brand-200 bg-brand-50 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-brand-900">Modo edição</p>
                  <p className="text-xs text-brand-800">
                    Você está editando exatamente a tela que o distribuidor vê.
                  </p>
                </div>
                <PublishToggle
                  slug={slug}
                  published={project.config.published}
                  qualityReport={report}
                />
              </div>

              <QualityChecklist report={report} />

              {actionError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {actionError}
                </p>
              ) : null}
            </div>
          ),
          headerActions: (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPanel({ type: "edit-header" })}
                className="inline-flex items-center rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800"
              >
                Editar cabeçalho
              </button>
              <Link
                href={`/admin/projects/${slug}`}
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Configurações do projeto
              </Link>
              {project.config.published ? (
                <Link
                  href={docsGuideHref(slug)}
                  className="inline-flex items-center rounded-md border border-brand-700 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
                >
                  Ver como distribuidor
                </Link>
              ) : null}
            </div>
          ),
          sectionsToolbar: (
            <button
              type="button"
              onClick={() => setPanel({ type: "new-section" })}
              className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800"
            >
              Nova seção
            </button>
          ),
          renderSectionActions: (section) => (
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() =>
                  setEditingSectionId(editingSectionId === section.id ? null : section.id)
                }
                className="font-medium text-brand-700 hover:underline"
              >
                {editingSectionId === section.id ? "Fechar" : "Editar"}
              </button>
              <button
                type="button"
                disabled={busyKey === `section:${section.id}`}
                onClick={() => handleDeleteSection(section)}
                className="font-medium text-red-700 hover:underline disabled:opacity-60"
              >
                {busyKey === `section:${section.id}` ? "Removendo…" : "Remover"}
              </button>
            </div>
          ),
          renderSectionBody: (section) =>
            editingSectionId === section.id ? (
              <SectionEditor
                slug={slug}
                section={section}
                onSaved={() => {
                  setEditingSectionId(null);
                  router.refresh();
                }}
                onCancel={() => setEditingSectionId(null)}
              />
            ) : null,
          operationsToolbar: (
            <button
              type="button"
              onClick={() => setPanel({ type: "new-operation" })}
              className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800"
            >
              Nova operação
            </button>
          ),
          renderOperationActions: (operation) => (
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPanel({ type: "edit-operation", operation })}
                className="font-medium text-brand-700 hover:underline"
              >
                Editar operação
              </button>
              <Link
                href={docsOperationHref(slug, operation.kind, operation.name)}
                className="font-medium text-slate-600 hover:underline"
              >
                Ver página
              </Link>
              <button
                type="button"
                disabled={busyKey === `operation:${operationKey(operation)}`}
                onClick={() => handleDeleteOperation(operation)}
                className="font-medium text-red-700 hover:underline disabled:opacity-60"
              >
                {busyKey === `operation:${operationKey(operation)}` ? "Removendo…" : "Remover"}
              </button>
            </div>
          ),
        }}
      />

      {panel.type === "edit-header" ? (
        <SlideOver title="Cabeçalho do manual" onClose={closePanel}>
          <ManualHeaderForm
            slug={slug}
            manual={project.manual}
            onDone={() => {
              closePanel();
              router.refresh();
            }}
            onCancel={closePanel}
          />
        </SlideOver>
      ) : null}

      {panel.type === "new-section" ? (
        <SlideOver title="Nova seção de contexto" onClose={closePanel}>
          <NewSectionForm
            slug={slug}
            onDone={() => {
              closePanel();
              router.refresh();
            }}
            onCancel={closePanel}
          />
        </SlideOver>
      ) : null}

      {panel.type === "new-operation" ? (
        <SlideOver title="Nova operação" onClose={closePanel}>
          <OperationForm
            slug={slug}
            mode="create"
            onDone={closePanel}
            onCancel={closePanel}
          />
        </SlideOver>
      ) : null}

      {panel.type === "edit-operation" ? (
        <SlideOver title={`Editar ${operationKey(panel.operation)}`} onClose={closePanel}>
          <OperationForm
            slug={slug}
            mode="edit"
            operation={panel.operation}
            onDone={closePanel}
            onCancel={closePanel}
          />
        </SlideOver>
      ) : null}
    </>
  );
}
