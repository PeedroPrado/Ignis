# 🔥 Projeto Ignis

O **Ignis** é uma aplicação full stack voltada à visualização e análise de dados relacionados a queimadas no Brasil. Ele integra dados geoespaciais em um mapa interativo e gráficos dinâmicos, oferecendo filtros por estado, bioma e período de tempo. A visualização é alimentada por um backend com PostgreSQL e PostGIS, e um frontend construído com React e Leaflet.

---

## 🧱 Estrutura do Projeto

O projeto segue a arquitetura monorepo com a seguinte estrutura:

```
Projeto-Ignis/
├── backend/      # API Node.js + Express + PostgreSQL
├── frontend/     # Aplicação React + TypeScript + Leaflet
├── public/       # Arquivos GeoJSON estáticos
└── package.json  # Scripts raiz e controle de workspaces
```

---

## 🚀 Tecnologias Utilizadas

- **Frontend**
  - React + TypeScript
  - React Leaflet e MarkerCluster
  - Styled Components
  - React Google Charts

- **Backend**
  - Node.js + Express
  - PostgreSQL + PostGIS
  - TypeORM (ou queries manuais)
  - GeoJSON APIs

- **Outros**
  - concurrently (para dev em paralelo)
  - ts-node / tsconfig
  - dotenv para variáveis sensíveis

---

## ⚙️ Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/Projeto-Ignis.git
cd Projeto-Ignis
```

### 2. Instalar as dependências

```bash
npm install            # na raiz (instala dependências dos workspaces)
npm run dev # na raiz (inicia o backend e o frontend)
```

### 3. Configurar o banco de dados

Crie um arquivo `.env` dentro da pasta `backend` com os seguintes dados:

```env
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=123
PGDATABASE=postgres
PGPORT=5432
```

Em seguida, execute a criação e inserção das tabelas:

```bash
npm run init-db
```

---

## ▶️ Execução do Projeto

Inicie o servidor e o frontend simultaneamente:

```bash
npm run dev
```

A aplicação será acessível em:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

---

## 🗺️ Funcionalidades

- Visualização de dados geográficos (foco de calor, risco de fogo, área queimada)
- Filtros por Estado, Bioma e Período
- Clustering e agregações de dados geoespaciais
- Integração com arquivos GeoJSON estáticos (área queimada)
- Gráficos comparativos com base nas médias de risco e foco de calor

---

## 📁 Dados Estáticos

Os arquivos GeoJSON de área queimada por mês estão disponíveis em:

```
backend/public/geojson/area_queimada/{MM}.geojson
```

E são servidos automaticamente via:

```
/geojson/area_queimada/04.geojson
```

---

## 📌 Contribuição

Sinta-se à vontade para contribuir com melhorias, novos filtros ou refatorações! Para isso:

1. Fork este repositório
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'Minha feature'`
4. Push para a branch: `git push origin minha-feature`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença de CAPYDEV
