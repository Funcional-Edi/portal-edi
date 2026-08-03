# Visao geral

Este manual descreve a integracao IM para envio de inventario ao gateway EDI.

## Fluxo resumido

1. Obter token via `createToken`.
2. Enviar lotes de estoque via `saveInventories`.
3. Registrar `loadId` para auditoria de suporte.
