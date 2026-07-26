import { describe, it, expect, beforeEach } from "vitest";
import { subscribe, publish, resetEventBus } from "@/core/events";

describe("barramento de eventos entre módulos", () => {
  beforeEach(() => resetEventBus());

  it("entrega o evento a quem assinou", async () => {
    const recebidos: string[] = [];
    subscribe<{ slug: string }>("homologacao.aprovada", (e) => {
      recebidos.push(e.payload.slug);
    });

    await publish("homologacao.aprovada", { slug: "wholesaler" });

    expect(recebidos).toEqual(["wholesaler"]);
  });

  it("entrega a múltiplos assinantes do mesmo evento", async () => {
    let contador = 0;
    subscribe("x.y", () => void contador++);
    subscribe("x.y", () => void contador++);

    await publish("x.y", null);

    expect(contador).toBe(2);
  });

  it("não falha ao publicar evento sem assinantes", async () => {
    await expect(publish("evento.sem.ouvinte", {})).resolves.toBeUndefined();
  });

  it("cancela a assinatura corretamente", async () => {
    let chamou = false;
    const cancelar = subscribe("a.b", () => void (chamou = true));
    cancelar();

    await publish("a.b", {});

    expect(chamou).toBe(false);
  });

  it("aguarda assinantes assíncronos antes de concluir", async () => {
    let concluido = false;
    subscribe("lento.evento", async () => {
      await new Promise((r) => setTimeout(r, 10));
      concluido = true;
    });

    await publish("lento.evento", {});

    expect(concluido).toBe(true);
  });

  it("preenche type e occurredAt no evento entregue", async () => {
    let tipo = "";
    let quando = "";
    subscribe("meta.evento", (e) => {
      tipo = e.type;
      quando = e.occurredAt;
    });

    await publish("meta.evento", {});

    expect(tipo).toBe("meta.evento");
    expect(Number.isNaN(Date.parse(quando))).toBe(false);
  });
});
