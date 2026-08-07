import { FlowCatalog } from "@/modules/fluxogramas/ui/flow-catalog";
import { FlowShell } from "@/modules/fluxogramas/ui/flow-shell";
import { listPublishedFlows } from "@/modules/fluxogramas/services/list-published-flows";

export default async function FluxogramasPage() {
  const flows = await listPublishedFlows();

  return (
    <FlowShell>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fluxogramas</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Diagramas de fluxo de integração curados a partir dos manuais publicados.
        </p>
      </header>
      <FlowCatalog flows={flows} />
    </FlowShell>
  );
}
