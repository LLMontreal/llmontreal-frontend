# LLMontreal — Frontend

Frontend do projeto **LLMontreal**, desenvolvido em **Angular 20**. Este README resume o que foi feito, como rodar o projeto e como gerar build para produção.

## 🔎 Visão Geral

Aplicação Angular modular, com componentes, serviços e rotas organizados. Consome APIs externas via HttpClient e utiliza ambientes separados para dev e produção.

## 🛠 Tecnologias

* Angular 20 (CLI 20.0.6)
* TypeScript
* Angular Router
* RxJS
* HttpClient
* Karma + Jasmine (testes)

## 📌 O que já está implementado

* Estrutura padrão Angular CLI
* Módulos e componentes básicos
* Roteamento inicial
* Configuração para build, serve e testes
* Ambientes (dev/prod)
* HttpClient preparado para integração com API externa

(*Adicione aqui seus principais componentes/rotas reais, se quiser.*)

## 📥 Pré-requisitos

* Node.js 18+ ou 20+
* npm ou yarn
* Angular CLI 20.x

## ▶ Como executar (desenvolvimento)

```bash
git clone https://github.com/LLMontreal/llmontreal-frontend.git
cd llmontreal-frontend
npm install
```

Configure o ambiente em `src/environments/`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api'
};
```

Inicie:

```bash
ng serve
# ou
npm start
```

Acesse: [http://localhost:4200/](http://localhost:4200/)

## 📦 Build de produção

```bash
ng build --configuration production
```

Arquivos gerados em: `dist/llmontreal-frontend/`.

## 🧪 Testes

```bash
ng test       # unitários
ng e2e        # se houver testes e2e configurados
```

## 📁 Estrutura (resumo)

```
src/
  app/          componentes, serviços, rotas
  assets/
  environments/
angular.json
package.json
```

## ⚙ Variáveis de ambiente

Arquivos:

* `environment.ts` (dev)
* `environment.prod.ts` (prod)

Principais chaves:

* `apiBaseUrl`
* Outras integrações (Sentry, Maps, etc)

> Evite commitar credenciais.

## 🐳 Deploy com Docker (exemplo)

```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:stable-alpine
COPY --from=build /app/dist/llmontreal-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
```

Build/run:

```bash
docker build -t llmontreal-frontend .
docker run -p 8080:80 llmontreal-frontend
```

## 🛠 Problemas comuns

* **Erro em dependências**: remover `node_modules` e rodar `npm ci`.
* **CORS**: configure no backend ou use `proxy.conf.json`.
* **Porta ocupada**: `ng serve --port 4300`.

## 🤝 Contribuição

1. Abra uma issue
2. Crie um branch (`feature/...` ou `fix/...`)
3. Faça PR explicando a alteração

## 📫 Contato

Equipe LLMontreal — abra uma issue para dúvidas.
