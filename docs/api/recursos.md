# API: Recursos

## Criar Recurso

-   **Endpoint:** `POST /recursos`
-   **Autenticação:** Token de Admin.
-   **Corpo da Requisição:**
    ```json
    {
      "nome_recurso": "Projetor Multimídia"
    }
    ```

## Associar Recurso a Sala

-   **Endpoint:** `POST /recursos/associar-sala`
-   **Autenticação:** Token de Admin.
-   **Corpo da Requisição:**
    ```json
    {
      "id_recurso": 1,
      "codigo_sala": "A101",
      "quantidade": 1
    }
    ```