# API: Autenticação

## Realizar Login

-   **Endpoint:** `POST /auth/login`
-   **Corpo da Requisição:**
    ```json
    {
      "email": "admin@exemplo.com",
      "senha": "admin123"
    }
    ```
-   **Resposta de Sucesso (`200 OK`):**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```