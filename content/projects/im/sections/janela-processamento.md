# Janela de processamento

As cargas de inventario devem ser enviadas entre `05:00` e `22:00` (America/Sao_Paulo).

## Regras operacionais

- Retentativa em caso de timeout: aguardar 30 segundos e repetir ate 3 vezes.
- Mensagem de erro com `INVALID_CUSTOMER` exige validacao de cadastro no ERP.
