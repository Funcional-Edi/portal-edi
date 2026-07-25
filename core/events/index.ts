/**
 * Barramento de eventos da fundação.
 *
 * Bounded contexts NÃO se importam entre si — comunicam-se por eventos (ex.:
 * "homologacao.aprovada" → módulo de doc viva publica manual). Começa simples
 * (in-memory, síncrono). Se um dia precisar durabilidade/entre-processos,
 * troca-se a implementação sem mudar quem publica/assina.
 */

export interface DomainEvent<TPayload = unknown> {
  /** Nome no formato "<modulo>.<fato>" (ex.: "homologacao.aprovada"). */
  type: string;
  payload: TPayload;
  occurredAt: string;
}

type Handler<TPayload> = (event: DomainEvent<TPayload>) => void | Promise<void>;

const handlers = new Map<string, Set<Handler<unknown>>>();

/** Assina um tipo de evento. Retorna função para cancelar a assinatura. */
export function subscribe<TPayload>(
  type: string,
  handler: Handler<TPayload>
): () => void {
  const set = handlers.get(type) ?? new Set<Handler<unknown>>();
  set.add(handler as Handler<unknown>);
  handlers.set(type, set);
  return () => set.delete(handler as Handler<unknown>);
}

/** Publica um evento para todos os assinantes. */
export async function publish<TPayload>(
  type: string,
  payload: TPayload
): Promise<void> {
  const event: DomainEvent<TPayload> = {
    type,
    payload,
    occurredAt: new Date().toISOString(),
  };
  const set = handlers.get(type);
  if (!set) return;
  await Promise.all(Array.from(set).map((h) => h(event as DomainEvent<unknown>)));
}

/** Limpa assinaturas (uso em testes). */
export function resetEventBus(): void {
  handlers.clear();
}
