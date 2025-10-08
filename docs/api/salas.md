# API: Salas

## Criar Sala

-   **Endpoint:** `POST /salas`
-   **Autenticação:** Token de Admin.
-   **Corpo da Requisição:**
    ```json
    {
      "codigo": "B205",
      "capacidade": 8,
      "bloco": "B",
      "tipo": "Videoconferência",
      "horario_abertura": "09:00:00",
      "horario_fechamento": "18:00:00",
      "disponivel_sabado": false,
      "disponivel_domingo": false,
      "ativa": true,
      "foto_url": "[https://exemplo.com/foto.jpg](https://exemplo.com/foto.jpg)"
    }
    ```

## Listar Salas

-   **Endpoint:** `GET /salas`
-   **Autenticação:** Token de qualquer usuário.