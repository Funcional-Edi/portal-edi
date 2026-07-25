import type { PortalModule } from "@/core/module-registry";

/**
 * Assistente de IA do time: chat com RAG na base de conhecimento e automações
 * de tarefas repetitivas (gerar manual do schema, resumir tickets, detectar
 * breaking changes). Usa a camada `core/ai`. O RAG em escala exige índice
 * vetorial → capacidade "vector-search" (indisponível hoje).
 */
export const assistenteIaModule: PortalModule = {
  id: "assistente-ia",
  title: "Assistente de IA",
  description:
    "Chat com RAG e automações de tarefas repetitivas do time, sobre a camada core/ai.",
  status: "planned",
  basePath: "/assistente",
  access: "admin",
  audience: "interno",
  requiresCapabilities: ["vector-search"],
};
