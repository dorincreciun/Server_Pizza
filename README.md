# Pizza Shop API (Express + Prisma)

A complete backend API for a pizza shop, built with Node.js (Express) and Prisma ORM. Features include authentication with email verification, product catalog with search/filter/sort/pagination, cart, orders with pricing and ETA, recommendations, Swagger docs, and secure defaults.

## Quick start

1. Install dependencies

```
npm i
```

2. Generate Prisma client

```
npx prisma generate
```

3. Create and apply initial migration (SQLite by default)

```
npx prisma migrate dev --name init
```

4. Seed database

```
npm run prisma:seed
```

5. Start dev server

```
npm run dev
```

6. Open Swagger UI

- http://localhost:4000/docs (UI)
- http://localhost:4000/docs-json (spec)

## Environment

Copy .env.example to .env and adjust as needed. Safe defaults are provided; no placeholders required.

- DATABASE_URL defaults to SQLite `file:./dev.db`.
- You can switch to Postgres/MySQL by setting DATABASE_URL accordingly; Prisma datasource is env-driven.

## NPM Scripts

- dev, build, start
- prisma:generate, prisma:migrate, prisma:deploy, prisma:seed
- lint, format

## Tech stack

- Node 20+, TypeScript, Express 4, Prisma ORM (SQLite by default)
- JWT (access + refresh) with bcryptjs
- helmet, cors, hpp, express-rate-limit, compression
- morgan (dev) + JSON logger (prod)
- swagger-jsdoc + swagger-ui-express
- nodemailer (Ethereal in dev via createTestAccount)
- dayjs
- zod for validation

## Project structure

See /src for app, config, db, modules, middlewares, utils, and docs folders.

## Notes

- Email verification uses Ethereal test accounts in development; replace transport in production.
- Rate limiting and CORS are configurable via env. Cookies for refresh tokens can be toggled.
