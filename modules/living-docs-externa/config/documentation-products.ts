import type {
  DocumentationAction,
  DocumentationConfiguration,
  DocumentationModule,
  DocumentationProduct,
} from "@/modules/living-docs-externa/schema/documentation-navigation";
import { docsGuideHref } from "@/modules/living-docs-externa/services/docs-routes";

const actions: readonly DocumentationAction[] = [
  { id: "documentacao", label: "Documentação", order: 1, enabled: true, visible: true, status: "published", destination: "documentation" },
  { id: "roteiro", label: "Roteiro", order: 2, enabled: true, visible: true, status: "published", destination: "guide" },
  { id: "teste-de-requisicao", label: "Teste de Requisição", order: 3, enabled: true, visible: true, status: "published", destination: "request-test", access: { roles: ["admin"] } },
];

function moduleItem(id: string, label: string, order: number, projectSlug?: string): DocumentationModule {
  return {
    id, label, order, projectSlug,
    enabled: true,
    visible: true,
    status: projectSlug ? "published" : "no-documentation",
    route: projectSlug ? docsGuideHref(projectSlug) : null,
  };
}

function product(
  id: string,
  label: string,
  order: number,
  description: string,
  modules: DocumentationModule[],
): DocumentationProduct {
  return { id, label, order, description, modules, actions, enabled: true, visible: true, status: "no-documentation" };
}

/**
 * Structural registry: IDs, products and modules are added/removed only in code.
 * Future admin configuration can override presentation/access fields by ID in the
 * server loader. It must not replace this registry or expose structural deletion.
 */
export const DOCUMENTATION_CONFIGURATION: DocumentationConfiguration = {
  products: [
    product("credenciado", "Credenciado", 1, "Reúne os fluxos de cadastro, opt-in, venda e PBM direto no caixa para a integração do credenciado.", [
      moduleItem("fluxo-de-cadastro", "Fluxo de Cadastro", 1),
      moduleItem("fluxo-optin", "Fluxo Opt-in", 2),
      moduleItem("fluxo-venda", "Fluxo de Venda", 3),
      moduleItem("fluxo-pbm-caixa", "Fluxo PBM direto no Caixa", 4),
    ]),
    {
      ...product("movimentacao-de-vidas", "Movimentação de Vidas", 2, "Área prevista para os processos de movimentação de vidas, com consultas, alterações e roteiros. Os detalhes de integração ainda serão documentados.", []),
      actions: [
        ...actions,
        { id: "queries", label: "Queries", order: 4, enabled: true, visible: true, status: "no-documentation", destination: null },
        { id: "mutations", label: "Mutations", order: 5, enabled: true, visible: true, status: "no-documentation", destination: null },
      ],
    },
    {
      ...product("trade", "Trade", 3, "Integrações de pedidos e inventário: Canal Autorizador, Wholesaler e IM. A estrutura também prevê EDI Redes, ainda sem documentação.", [
        moduleItem("canal-autorizador", "Canal Autorizador", 1, "canal-autorizador"),
        moduleItem("wholesaler", "Wholesaler", 2, "wholesaler"),
        moduleItem("edi-redes", "EDI Redes", 3),
        moduleItem("im", "IM", 4, "im"),
      ]),
      status: "published",
    },
    {
      ...product("aps", "APS", 4, "Espaço previsto para Delivery. O enquadramento do produto e seu escopo de integração ainda estão sujeitos a confirmação.", [
        moduleItem("delivery", "Delivery", 1),
      ]),
      tag: "A confirmar",
    },
    product("pbm", "PBM", 5, "Área prevista para a integração de Reposição. O roteiro e as regras desse fluxo serão detalhados na documentação do produto.", [
      moduleItem("reposicao", "Reposição", 1),
    ]),
  ],
};
