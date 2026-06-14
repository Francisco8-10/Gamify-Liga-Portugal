# Gamify - Liga Portugal 

Este repositório contém a aplicação Gamify Liga Portugal, estruturada em duas partes principais:

- **[gamify/](./gamify)**: O frontend desenvolvido em Vue.js 3 e Vite, fornecendo a interface de utilizador, catálogo de prémios, e visualização de missões.
- **[gamify-backend/](./gamify-backend)**: O backend headless CMS construído com Strapi v5, gerindo os prémios, missões, utilizadores e redenções em base de dados SQLite.

## Como Executar Localmente

### 1. Iniciar o Backend
Navegue para a pasta `gamify-backend/`:
```bash
cd gamify-backend
npm install
npm run develop
```
O painel de administração do Strapi estará disponível em `http://localhost:1337/admin`.

### 2. Iniciar o Frontend
Navegue para a pasta `gamify/`:
```bash
cd gamify
npm install
npm run dev
```
O frontend da aplicação estará disponível em `http://localhost:5173/` (ou `http://localhost:5174/` caso o porto esteja ocupado).
