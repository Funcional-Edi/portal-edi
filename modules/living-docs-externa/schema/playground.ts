import { z } from "zod";

/**
 * Corpo aceito pelo BFF do playground (Fase 4.3). `variables` é um objeto
 * arbitrário (o schema do gateway de cada projeto é diferente), validado
 * apenas quanto à forma — o conteúdo é responsabilidade do gateway.
 */
export const playgroundRequestInputSchema = z.object({
  query: z.string().min(1, "Query é obrigatória.").max(20_000, "Query excede o tamanho máximo."),
  variables: z.record(z.string(), z.unknown()).optional(),
});

export type PlaygroundRequestInput = z.infer<typeof playgroundRequestInputSchema>;
