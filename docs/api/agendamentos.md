# API: Agendamentos

## Criar Agendamento Único

-   **Endpoint:** `POST /agendamentos`
-   **Autenticação:** Token de qualquer usuário.
-   **Corpo da Requisição:**
    ```json
    {
      "id_usuario": 1,
      "codigo_sala": "B205",
      "data": "2025-10-20",
      "hora_inicio": "14:00",
      "hora_fim": "15:30"
    }
    ```

## Criar Agendamento Recorrente

-   **Endpoint:** `POST /agendamentos/recorrente`
-   **Autenticação:** Token de qualquer usuário.
-   **Corpo da Requisição:**
    ```json
    {
      "id_usuario": 1,
      "codigo_sala": "B205",
      "data": "2025-10-20",
      "hora_inicio": "14:00",
      "hora_fim": "15:00",
      "numero_de_semanas": 4
    }
    ```