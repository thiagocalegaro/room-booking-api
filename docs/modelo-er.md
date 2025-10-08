# Modelo Entidade-Relacionamento (ER)


    USUARIO {
        int id_usuario PK
        varchar nome
        varchar email
        varchar senha
        varchar tipo
    }

    AGENDAMENTO {
        int id_agendamento PK
        int id_usuario FK
        varchar codigo_sala FK
        date data
        time hora_inicio
        time hora_fim
    }

    SALA {
        varchar codigo PK
        int capacidade
        varchar bloco
        varchar tipo
        time horario_abertura
        time horario_fechamento
        boolean disponivel_sabado
        boolean disponivel_domingo
        boolean ativa
        varchar foto_url
    }

    EXCECAO {
        int id_excecao PK
        varchar codigo_sala FK
        datetime data_hora_inicio
        datetime data_hora_fim
        enum tipo
        varchar motivo
    }

    RECURSO {
        int id_recurso PK
        varchar nome_recurso
    }

    SALA_RECURSO {
        varchar codigo_sala FK
        int id_recurso FK
        int quantidade
    }

    USUARIO ||--o{ AGENDAMENTO : realiza
    SALA ||--o{ AGENDAMENTO : recebe
    SALA ||--o{ EXCECAO : possui
    SALA ||--|{ SALA_RECURSO : possui
    RECURSO ||--|{ SALA_RECURSO : é_atribuído_a
    