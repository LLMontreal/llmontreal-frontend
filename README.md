# LLMontreal - Frontend Angular

Aplicação web desenvolvida durante a Sprint Surpresa do programa Acelera Maker, oferecido pela Montreal.

---

## Índice

* Sobre o Projeto
* Arquitetura e Fluxo da Aplicação
* Tecnologias Utilizadas
* Funcionalidades
* Estrutura do Projeto
* Pré-requisitos
* Configuração do Ambiente
* Executando a Aplicação
* Comunicação com a API
* Testes (TDD com Jasmine)
* Responsividade
* Tema Claro e Escuro
* Logs e Monitoramento
* Contribuindo
* Licença

---

## Sobre o Projeto

O LLMontreal Frontend é uma interface moderna desenvolvida em Angular 17 para interação com o backend da plataforma LLMontreal.
O sistema permite upload de documentos, visualização do processamento, leitura do resumo gerado e interação via chat baseado no conteúdo extraído.

### O que o frontend faz?

* Upload de documentos com barra de progresso
* Exibição do status de processamento do documento
* Visualização do texto resumido pela IA
* Chat com perguntas e respostas contextualizadas
* Feedback visual claro para erros e operações
* Alternância entre tema claro e escuro
* Layout totalmente responsivo

---

## Arquitetura e Fluxo da Aplicação

Fluxo de interação com usuário e API:

```
┌─────────────────────────────────────────────┐
│                  INTERFACE                  │
│        LLMontreal Angular Frontend          │
└───────────────────────────┬─────────────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │  UploadDocumentComponent │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │  DocumentService         │
              │  POST /documents         │
              └───────────┬──────────────┘
                          │
                          ▼
              Exibição de progresso e status
                          │
                          ▼
              ┌──────────────────────────┐
              │ DashboardComponent        │
              │ - Status do documento    │
              │ - Resumo                 │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │ DocSummaryChatComponent  │
              │ POST /chat/{documentId} │
              └───────────┬──────────────┘
                          │
                          ▼
                Interface de conversação
```

O frontend isola responsabilidades por meio de serviços, componentes e modelos tipados, mantendo uma arquitetura modular, reativa e escalável.

---

## Tecnologias Utilizadas

### Framework e Linguagem

* Angular 17
* TypeScript

### Testes

* Jasmine
* Karma

---

## Funcionalidades

### Upload e Processamento

* Upload de arquivos individuais até 25MB
* Barra de progresso e validações por tipo
* Exibição de status: pendente, processando, concluído ou erro
* Atualização automática de status após processamento

### Interação com IA

* Exibição do resumo gerado pela IA local
* Chat de perguntas e respostas baseado no documento
* Histórico simples de mensagens

### Interface

* Layout responsivo para desktop, tablet e mobile
* Tema claro e escuro com persistência local
* Feedback visual consistente para erros e operações

### Desenvolvimento e Testes

* Testes unitários em todos os componentes e serviços
* Desenvolvimento orientado a testes (TDD)

---

## Estrutura do Projeto

```
src/
 ├── app/
 │    ├── components/
 │    │    ├── dashboard/               # Tela principal
 │    │    ├── doc-summary-chat/        # Chat + resumo
 │    │    ├── upload-document/         # Upload e validação
 │    │    ├── header/                  # Cabeçalho e troca de tema
 │    │    └── footer/                  # Rodapé
 │    │
 │    ├── services/
 │    │    ├── document.service.ts      # Comunicação com API de documentos
 │    │    ├── chat.service.ts          # Comunicação com API de chat
 │    │    ├── theme.service.ts         # Controle de tema
 │    │    └── logs.service.ts          # Registro simples de logs no frontend
 │    │
 │    ├── models/
 │    │    ├── document.model.ts
 │    │    └── document-upload-response.model.ts
 │    │
 │    ├── shared/                       # Estruturas reutilizáveis
 │
 │    ├── app.component.ts
 │    ├── app.routes.ts
 │    ├── app.config.ts
 │    └── app.spec.ts
 │
 ├── assets/
 ├── environments/
 └── styles.scss
```

---

## Pré-requisitos

Certifique-se de ter instalado:

* Node.js 18 ou superior
* Angular CLI 17 ou superior
* Navegador moderno

---

## Configuração do Ambiente

### 1. Clone o Repositório

```
git clone git@github.com:ro77en/llmontreal-frontend.git
cd llmontreal-frontend
```

### 2. Instale as Dependências

```
npm install
```

### 3. Configure a URL da API

No arquivo:

```
src/environments/environment.ts
```

Ajuste:

```ts
apiUrl: 'http://localhost:8080'
```

---

## Executando a Aplicação

### Desenvolvimento

```
ng serve
```

Acesse:

```
http://localhost:4200
```

### Build de Produção

```
ng build
```

---

## Comunicação com a API

O frontend consome os seguintes endpoints:

### Documentos

* POST /documents
* GET /documents/{id}/summary
* GET /documents/{id}/content

### Chat

* POST /chat/{documentId}

Os serviços `DocumentService` e `ChatService` encapsulam todas as chamadas HTTP.

---

## Testes (TDD com Jasmine)

### Executar todos os testes

```
npm test
```

### Estrutura de testes

* Cada componente possui seu arquivo `.spec.ts`
* Testes com mocks de HttpClient
* Testes de template, serviços e modelos
* TDD aplicado durante o desenvolvimento dos componentes principais

---

## Responsividade

A aplicação utiliza:

* Layouts baseados em grid para páginas principais
* Flexbox para elementos internos
* Breakpoints otimizados para mobile, tablet e desktop
* Tipografia fluida com unidades relativas

Todos os componentes se ajustam automaticamente mantendo usabilidade em qualquer resolução.

---

## Tema Claro e Escuro

O tema é controlado por:

* `ThemeService`
* CSS custom properties
* Persistência via `localStorage`
* Alternância direta pelo `HeaderComponent`

O layout inteiro se adapta sem recarregar a página.

---

## Logs e Monitoramento

O frontend inclui:

* Logs básicos de ações do usuário (via `LogsService`)
* Console warnings para erros HTTP
* Feedback visual de falhas de upload e comunicação

---

## Contribuindo

1. Faça um fork do projeto
2. Crie sua branch (feature/nome-da-feature)
3. Commit suas mudanças
4. Envie para o repositório remoto
5. Abra um Pull Request

---

## Licença

Este projeto foi desenvolvido durante o programa Acelera Maker da Montreal.
