import type { ManualOperation, ManualSection, Project } from "@/modules/living-docs-externa/schema";
import { sortOperations } from "@/modules/living-docs-externa/schema";
import { docsOperationHref, docsPlaygroundHref } from "@/modules/living-docs-externa/services/docs-routes";
import type { OperationSchemaDetail } from "@/modules/living-docs-externa/services/schema-reference";
import { MarkdownBody } from "@/core/ui/markdown-body";
import { CopyableCode } from "@/core/ui/copyable-code";
import { OperationDocumentation } from "@/modules/living-docs-externa/ui/reader/operation-documentation";
import { ProjectExportActions } from "@/modules/living-docs-externa/ui/shared/export-buttons";
import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import { ChevronDown, PencilLine, Search, Send } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roteiroScenarioId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Ícone por tipo de operação — ajuda a escanear o roteiro visualmente. */
function OperationKindIcon({ kind }: { kind: ManualOperation["kind"] }) {
  if (kind === "query") return <Search className="h-4 w-4" aria-hidden="true" />;
  if (kind === "rest") return <Send className="h-4 w-4" aria-hidden="true" />;
  return <PencilLine className="h-4 w-4" aria-hidden="true" />;
}

/**
 * Pontos de extensão do modo admin (etapa 6.1/6.2). Existem para que o editor
 * e a visão do distribuidor compartilhem UM layout só: o admin injeta controles
 * nos mesmos cards que o distribuidor vê, em vez de haver uma segunda tela.
 */
export interface ManualRoteiroEditorSlots {
  /** Substitui o corpo Markdown da seção (editor inline). */
  renderSectionBody?: (section: ManualSection) => ReactNode;
  /** Controles no card da seção (editar, remover). */
  renderSectionActions?: (section: ManualSection) => ReactNode;
  /** Controles no card da operação (abrir slide-over, remover). */
  renderOperationActions?: (operation: ManualOperation) => ReactNode;
  /** Substitui o link de playground no cabeçalho. */
  headerActions?: ReactNode;
  /** Faixa acima do manual (status, checklist de qualidade). */
  banner?: ReactNode;
  /** Ações do bloco "Contexto" (nova seção). */
  sectionsToolbar?: ReactNode;
  /** Ações do bloco "Jornada da Integração" (nova operação). */
  operationsToolbar?: ReactNode;
}

interface ManualRoteiroProps {
  project: Project;
  sections: ManualSection[];
  /** Ausente = visão do distribuidor (somente leitura). */
  editor?: ManualRoteiroEditorSlots;
  /** Links dos fluxogramas publicados na seção Documentação. */
  flowLinks?: Array<{ id: string; title: string; description?: string; href: string }>;
  /** Link para referência GraphQL quando schema sincronizado. */
  schemaReferenceHref?: string;
  /** Playground executa contra gateway real — só perfil admin. */
  canUsePlayground?: boolean;
  /** Campos do schema publicados para exibição junto a cada etapa. */
  schemaDetails?: Record<string, OperationSchemaDetail | null>;
}

export function ManualRoteiro({
  project,
  sections,
  editor,
  flowLinks = [],
  schemaReferenceHref,
  canUsePlayground = false,
  schemaDetails = {},
}: ManualRoteiroProps) {
  const { config, manual } = project;
  const operations = sortOperations(manual);
  const businessRulesSection = sections.find((section) => section.id === "regras-de-negocios");
  const documentationSections = sections.filter(
    (section) => section.id !== "fluxo-do-pedido" && section.id !== "regras-de-negocios",
  );
  const isEditing = editor != null;
  const showContext = documentationSections.length > 0 || isEditing;
  const hasGatewayAuthentication = config.productId === "credenciado";
  const isGraphql = config.protocol !== "rest";
  const gatewayConnected = Boolean(isGraphql ? config.graphqlUrl : config.apiBaseUrl);
  const renderDocumentationSection = (section: ManualSection) => (
    <div
      key={section.id}
      id={`section-${section.id}`}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      {editor?.renderSectionActions ? (
        <div className="mb-3 flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <span className="font-mono text-xs text-slate-500">{section.id}.md</span>
          {editor.renderSectionActions(section)}
        </div>
      ) : null}
      {editor?.renderSectionBody?.(section) ?? (
        <MarkdownBody source={section.body} importanceNotices={config.productId === "credenciado"} />
      )}
    </div>
  );

  return (
    <article>
      {editor?.banner ? <div className="mb-6">{editor.banner}</div> : null}

      <header id="documentacao" data-documentation-area="documentacao" className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-brand-700">Manual de integração</p>
        <h1 id="documentacao-titulo" className="mt-1 text-3xl font-bold tracking-tight">{manual.title}</h1>
        {manual.productName ? (
          <p id="documentacao-subtitulo" className="mt-1 text-lg text-slate-700">{manual.productName}</p>
        ) : null}
        {config.description ? (
          <p className="mt-3 text-slate-600">{config.description}</p>
        ) : null}
        {manual.manualVersion ? (
          <p className="mt-2 text-xs text-slate-500">Versão {manual.manualVersion}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {config.environment ? (
            <Badge tone={environmentBadgeTone(config.environment)}>{config.environment}</Badge>
          ) : null}
          <Badge tone="brand">{isGraphql ? "GraphQL" : "REST"}</Badge>
          <Badge tone="neutral">
            {operations.length} {operations.length === 1 ? "operação" : "operações"}
          </Badge>
          {manual.referenceTables && manual.referenceTables.length > 0 ? (
            <Badge tone="neutral">
              {manual.referenceTables.length}{" "}
              {manual.referenceTables.length === 1 ? "tabela de referência" : "tabelas de referência"}
            </Badge>
          ) : null}
          <span className="text-xs text-slate-500">
            Atualizado {formatUpdatedAt(config.updatedAt)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {editor?.headerActions ?? (
            <>
              {isGraphql && canUsePlayground ? (
                <Link
                  href={docsPlaygroundHref(config.slug)}
                  className="inline-flex items-center rounded-md border border-brand-700 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Teste de Requisição
                </Link>
              ) : null}
              {schemaReferenceHref ? (
                <Link
                  href={schemaReferenceHref}
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver referência GraphQL
                </Link>
              ) : null}
              <ProjectExportActions slug={config.slug} gatewayConnected={gatewayConnected} />
            </>
          )}
        </div>
      </header>

      {showContext ? (
        <section data-documentation-area="documentacao" className="mb-10 space-y-8 scroll-mt-24">
          {editor?.sectionsToolbar ? (
            <div className="flex items-center justify-between gap-4">
              {editor.sectionsToolbar}
            </div>
          ) : null}

          {documentationSections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
              Nenhuma seção de contexto ainda. O distribuidor abriria o manual direto no
              conteúdo da Jornada da Integração.
            </p>
          ) : null}

          {documentationSections.map(renderDocumentationSection)}
        </section>
      ) : null}

      {flowLinks.length > 0 ? (
        <section id="fluxogramas" data-documentation-area="documentacao" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold">Fluxogramas</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            Consulte a visão geral do processo e abra cada fluxo para entender as decisões,
            operações e resultados esperados da integração.
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {flowLinks.map((flow) => {
              const details = manual.flowDetails?.find((item) => item.flowId === flow.id);
              return (
                <li key={flow.id}>
                  <Link
                    href={flow.href}
                    className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-600 hover:bg-brand-50"
                  >
                    <h3 className="font-semibold text-slate-900">{flow.title}</h3>
                    {flow.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{flow.description}</p>
                    ) : null}
                    {details ? (
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                        {details.requiredOperations.map((operation) => (
                          <li key={operation.name}>
                            <code className="font-medium text-slate-800">{operation.name}</code>
                            <span>: {operation.description}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <span className="mt-3 block text-sm font-medium text-brand-700">
                      Ver explicação e fluxograma →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {manual.flowSelectionNote ? (
            <p className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-brand-900">
              <strong>Importante:</strong> {manual.flowSelectionNote}
            </p>
          ) : null}
        </section>
      ) : null}

      {businessRulesSection ? (
        <section data-documentation-area="documentacao" className="mt-10 scroll-mt-24">
          {renderDocumentationSection(businessRulesSection)}
        </section>
      ) : null}

      <section id="jornada-integracao" data-documentation-area="jornada-integracao" className="scroll-mt-24">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Jornada da Integração</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
              Siga as etapas na ordem e expanda cada uma para consultar observações, campos,
              tabelas de referência e exemplos sem sair da Jornada.
            </p>
          </div>
          {editor?.operationsToolbar}
        </div>

        {operations.length === 0 && isEditing ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Nenhuma operação cadastrada neste manual ainda.
          </p>
        ) : null}

        <ol className="space-y-3">
          {hasGatewayAuthentication ? (
            <li id="jornada-autenticacao-token">
              <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                    1
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                      Etapa inicial · Autenticação obrigatória
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900">
                      Gerar token do Gateway com <code className="font-mono">createToken</code>
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-700">
                      Antes das operações do fluxo, gere um token com as credenciais fornecidas
                      pelo time de EDI. O token deve ser enviado em todas as requisições.
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Requisição</p>
                        <CopyableCode
                          className="mt-1 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100"
                          code={`mutation {
  createToken(
    login: "<usuario>"
    password: "<senha>"
  ) {
    token
  }
}`}
                        />
                        <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Resposta</p>
                        <CopyableCode
                          className="mt-1 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100"
                          code={`{
  "data": {
    "createToken": {
      "token": "<token>"
    }
  }
}`}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Header das requisições
                        </p>
                        <p className="mt-1 rounded-md bg-white px-3 py-2 font-mono text-sm text-brand-800">
                          Authorization: Bearer &lt;token&gt;
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          O mesmo token pode ser reutilizado em várias chamadas, inclusive em
                          diferentes fluxos de venda. A validade padrão é de 24 horas; se expirar,
                          a API retornará um erro e será necessário gerar outro token.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="https://developer.funcionalmais.com/docs/gateway-credenciados/autenticacao#autentica%C3%A7%C3%A3o"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
                    >
                      Consultar documentação oficial de autenticação →
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ) : null}
          {operations.map((op, index) => {
            const operationId = `jornada-operacao-${index + 1}`;
            const referenceTables = (manual.referenceTables ?? []).filter((table) =>
              op.referenceTableIds?.includes(table.id)
            );

            return (
              <li key={`${op.kind}-${op.name}`}>
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <details id={operationId} className="group">
                    <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                        {index + (hasGatewayAuthentication ? 2 : 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase text-brand-700">
                          <OperationKindIcon kind={op.kind} />
                          {op.kind === "rest" ? op.method ?? "rest" : op.kind}
                        </span>
                        <h3 className="mt-1 font-semibold text-slate-900">
                          {op.title ?? `${op.kind} ${op.name}`}
                        </h3>
                        {op.description ? (
                          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{op.description}</p>
                        ) : null}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700">
                        Detalhes técnicos
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                      </span>
                    </summary>
                    <div className="border-t border-slate-100 p-4 sm:p-5">
                      <OperationDocumentation
                        slug={config.slug}
                        operation={op}
                        schemaDetail={schemaDetails[`${op.kind}:${op.name}`]}
                        referenceTables={referenceTables}
                        canUsePlayground={canUsePlayground}
                        idPrefix={operationId}
                        importanceNotices={config.productId === "credenciado"}
                      />
                    </div>
                  </details>
                  {isEditing && editor?.renderOperationActions ? (
                    <div className="border-t border-slate-100 px-4 py-3">
                      {editor.renderOperationActions(op)}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="roteiro-integracao" data-documentation-area="roteiro-integracao" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold">Cenários de Testes e Validações</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          {config.productId === "credenciado"
            ? "Valide os cenários deste fluxo em homologação, registrando as requisições, respostas, decisões de negócio e evidências."
            : "Valide os dois fluxos do Canal Autorizador em homologação, registrando as requisições, respostas, decisões de negócio e evidências de cada cenário."}
        </p>

        {manual.homologationFlows?.length ? (
          <div className="mt-6 space-y-6">
              {manual.homologationFlows.map((flow) => (
                <section
                  key={flow.title}
                  id={`roteiro-cenario-${roteiroScenarioId(flow.title)}`}
                >
                  <h3 className="text-lg font-semibold text-slate-900">{flow.title}</h3>
                  <ol className="mt-3 space-y-3">
                    {flow.scenarios.map((scenario, index) => (
                      <li
                        key={scenario.title}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="flex gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-semibold text-slate-900">{scenario.title}</h5>
                            <dl className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                              <div>
                                <dt className="font-medium text-slate-800">Pré-condições</dt>
                                <dd>
                                  <ul className="mt-1 list-disc space-y-1 pl-5">
                                    {scenario.preconditions.map((item) => <li key={item}>{item}</li>)}
                                  </ul>
                                </dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-800">Operações</dt>
                                <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                  {scenario.operations.map((name) => {
                                    const operation = operations.find((candidate) => candidate.name === name);
                                    return operation ? (
                                      <Link
                                        key={name}
                                        href={docsOperationHref(config.slug, operation.kind, operation.name)}
                                        className="font-mono text-brand-700 underline hover:text-brand-900"
                                      >
                                        {name}
                                      </Link>
                                    ) : (
                                      <code key={name}>{name}</code>
                                    );
                                  })}
                                </dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-800">Resultado esperado</dt>
                                <dd className="mt-1">{scenario.expectedResult}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-800">Evidências</dt>
                                <dd>
                                  <ul className="mt-1 list-disc space-y-1 pl-5">
                                    {scenario.evidence.map((item) => <li key={item}>{item}</li>)}
                                  </ul>
                                </dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-800">Aprovação</dt>
                                <dd className="mt-1">{scenario.approval}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
          </div>
        ) : null}

        {manual.homologationValidations?.length ? (
          <section id="roteiro-validacoes" className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Validações
            </h3>
            <ul className="mt-3 list-disc space-y-2 rounded-lg border border-slate-200 bg-white p-5 pl-10 text-sm leading-relaxed text-slate-700">
              {manual.homologationValidations.map((validation) => <li key={validation}>{validation}</li>)}
            </ul>
          </section>
        ) : null}

      </section>

      <section id="versao-subproduto" data-documentation-area="documentacao" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold">Histórico de Alterações</h2>
          {manual.manualVersion ? (
            <p className="mt-1 text-sm text-slate-600">
              Versão atual: <span className="font-medium text-slate-900">{manual.manualVersion}</span>
            </p>
          ) : <p className="mt-1 text-sm text-slate-600">Versão atual não informada.</p>}
          {manual.versionHistory?.length ? (
            <ol className="mt-4 space-y-3">
              {manual.versionHistory.map((entry) => (
                <li key={`${entry.version}-${entry.date}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">Versão {entry.version}</h3>
                    <time className="text-xs text-slate-500">{entry.date}</time>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{entry.details}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
    </article>
  );
}
