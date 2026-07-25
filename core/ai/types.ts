/**
 * Contratos da camada de IA. Provedor é abstrato: começamos com um só
 * (Princípio 8) e medimos custo. Trocar OpenAI ↔ Anthropic ↔ outro não muda
 * quem consome — só a implementação da porta.
 */

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiGenerateOptions {
  /** Identificador do caso de uso (ex.: "gerar-manual") — usado em custo/logs. */
  feature: string;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
}

export interface AiGenerateResult {
  text: string;
  usage: AiUsage;
  provider: string;
  model: string;
}

/** Porta que todo provedor de IA implementa. */
export interface AiProvider {
  readonly name: string;
  readonly model: string;
  generate(options: AiGenerateOptions): Promise<AiGenerateResult>;
}

/** Porta de recuperação p/ RAG (base de conhecimento). Implementada quando houver índice. */
export interface Retriever {
  retrieve(query: string, topK?: number): Promise<Array<{ text: string; score: number; source?: string }>>;
}
