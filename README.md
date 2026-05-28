# Sistema de Agendamentos Web

## Intuito do projeto

Este projeto foi desenvolvido para melhorar a organizacao operacional de um salao, com foco em:

- controle de clientes
- organizacao da agenda
- gerenciamento de tempo
- previsibilidade de estoque
- reducao de trabalho manual no processo de agendamento

## Evolucao por semestre

### 1º semestre - Base de agendamentos

No primeiro semestre, foi elaborada a base do sistema de agendamentos.

Objetivo principal:

- ter melhor controle de clientes
- melhorar o gerenciamento de horarios
- reduzir conflitos e falhas no controle manual de agenda

### 2º semestre - Controle de estoque

No segundo semestre, foi implementado o modulo de estoque de produtos.

Objetivo principal:

- melhorar o gerenciamento de materiais
- prevenir falta de insumos
- dar mais previsibilidade para compras e operacao do salao

### 3º semestre - Responsividade para celular

No terceiro semestre, o sistema foi adaptado para uso em dispositivos moveis.

Objetivo principal:

- permitir uso do app no celular
- disponibilizar interface responsiva
- facilitar operacao no dia a dia, em diferentes telas

### 4ºsemestre - Acesso de clientes e pre-agendamento (planejado)

No quarto semestre, sera implementado o acesso dos clientes do salao para:

- visualizar horarios disponiveis
- realizar pre-agendamento pelo software
- reduzir a necessidade de contato direto com a dona do salao para marcar horarios

Objetivo principal:

- otimizar tempo gasto no agendamento
- melhorar a visualizacao de disponibilidade para os clientes
- reduzir retrabalho de comunicacao

## Stack atual

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript + Prisma
- Banco de dados: PostgreSQL
- Containers: Docker + Docker Compose

## Arquitetura

Servicos isolados:

- `frontend` (Nginx + build Vite) em `http://localhost:5173`
- `backend` (API Express) em `http://localhost:3000`
- `postgres` em `localhost:5432`

O frontend encaminha chamadas `/api/*` para o backend via proxy interno.

## Estrutura de pastas

```txt
backend/
  src/
  prisma/
  Dockerfile
  .env.example
  .env.docker
frontend/
  src/
  nginx/default.conf
  Dockerfile
docker-compose.yml
```

## Execucao com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Para parar:

```bash
docker compose down
```

Para remover volume do banco:

```bash
docker compose down -v
```

## Variaveis de ambiente

Docker usa `backend/.env.docker`.

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agendamento"
PORT=3000
JWT_SECRET="troque-esta-chave-em-producao"
```

## CI de release (SemVer)

Workflow:

- `.github/workflows/semver-release-draft.yml`

Regras:

- executa apenas em PR mergeado
- cria tag e draft release apenas no fluxo `develop -> main`
- bump SemVer definido por uma das labels abaixo:
- `major` ou `semver:major` ou `release:major`
- `minor` ou `semver:minor` ou `release:minor`
- `patch` ou `semver:patch` ou `release:patch`
