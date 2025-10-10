# Guia de Instalação e Execução Local

Este guia descreve o passo a passo para configurar e executar o projeto em um ambiente de desenvolvimento local.
--- **API** disponível em `https://github.com/thiagocalegaro/room-booking-api`

## 1. Pré-requisitos

-   **Node.js** (versão 18.x ou superior)
-   **Docker** e **Docker Compose** (Opção A) OU **PostgreSQL** instalado localmente (Opção B)

---

## 2. Configuração do Banco de Dados

Escolha uma das opções.

### Opção A: Docker (Recomendado)

1.  Na raiz do projeto, crie o arquivo `docker-compose.yml`:

    ```yml
    version: '3.8'
    services:
      postgres-db:
        image: postgres:15
        container_name: agendamento-postgres
        restart: always
        environment:
          POSTGRES_USER: admin
          POSTGRES_PASSWORD: admin
          POSTGRES_DB: agendamento_db
        ports:
          - "5432:5432"
        volumes:
          - agendamento-db-data:/var/lib/postgresql/data

    volumes:
      agendamento-db-data:
    ```

2.  Inicie o banco de dados:

    ```bash
    docker-compose up -d
    ```

### Opção B: Instalação Local do PostgreSQL

1.  Instale o **PostgreSQL** em sua máquina. Durante a instalação, defina uma senha para o usuário `postgres`.
2.  Use o **pgAdmin 4** (instalado junto) para criar um novo banco de dados chamado `agendamento_db`.

---

## 3. Configuração do Backend (API)

1.  Na raiz do projeto, crie o arquivo `.env` e ajuste `DB_PASSWORD` se estiver usando a instalação local:

    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=admin
    DB_PASSWORD=admin
    DB_DATABASE=agendamento_db
    JWT_SECRET=SEGREDO_SUPER_SECRETO_PARA_TESTES
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Inicie a API (deixe este terminal rodando):
    ```bash
    npm run start:dev
    ```

---

## 4. Executando o Frontend

Abra o arquivo `frontend/paginasAuth/cadastro.html`, clonado do repostitório `https://github.com/CTISM-Prof-Henry/trab-final-spi-quarteto-fantastico`, no navegador