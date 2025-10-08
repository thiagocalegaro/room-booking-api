# API: Usuários

## Criar Usuário

-   **Endpoint:** `POST /usuarios`
-   **Corpo da Requisição:**
    ```json
    {
      "nome": "Fulano de Tal",
      "email": "fulano@exemplo.com",
      "senha": "uma_senha_forte",
      "confirmar_senha": "uma_senha_forte"
    }
    ```
-   **Resposta de Sucesso (`201 Created`):** Objeto do usuário criado.