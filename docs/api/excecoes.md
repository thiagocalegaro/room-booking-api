# API: Exceções

## Criar Exceção (em Lote)

-   **Endpoint:** `POST /excecoes`
-   **Autenticação:** Token de Admin.
-   **Corpo da Requisição:**
    ```json
    {
      "motivo": "Feriado Municipal",
      "tipo": "BLOQUEIO",
      "escopo": "BLOCO",
      "bloco": "B",
      "inicio": "2025-11-15T00:00:00",
      "fim": "2025-11-15T23:59:59"
    }
    ```