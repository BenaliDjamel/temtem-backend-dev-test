# Temtem Backend API

A NestJS + MongoDB backend for a really simple e‑commerce domain with authentication, stores, and products. Includes JWT auth, role‑based access control, validation, logging, Swagger docs, and S3 image uploads.

## Tech Stack

- **Runtime**: Node.js, TypeScript
- **Framework**: NestJS
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger (available at `/docs`)
- **Logging**: nestjs-pino (pretty in dev)
- **Storage**: AWS S3 (public uploads)
- **Containerization**: Docker & docker-compose

## Features

- **Authentication**: JWT-based login, registration.
- **Authorization**: Global JWT guard with `@Public()` for open routes; `@Roles()` with `RolesGuard` for role checks.
- **Users**: Register and login; roles include `guest` and `store-owner`.
- **Stores**: Store owners can create stores; stores have `owner` relation to users.
- **Products**:
  - Store owners can create/update/delete products for their own stores.
  - Public listing with pagination, ordering, and category filter for guests.
  - Image upload to S3 with content-type validation and size limit (2MB).
- **Validation & Errors**: DTO validation via `class-validator`; centralized HTTP exception filter(basic one, for production level apps it should more advanced like reporting to sentry).
- **Logging**: Structured logging via pino, pretty-printed in development.
- **API Docs**: Swagger available at `/docs` with Bearer auth support.

## API Endpoints (summary)

- **Auth**
  - `POST /auth/login` (public): email, password → `{ access_token }`
  - `POST /auth/register` (public): email, password, role? default guest
- **Stores**
  - `POST /stores` (role: store-owner): create a store
- **Products**
  - `POST /products` (role: store-owner, Bearer, multipart): create product with optional `image`
  - `GET /products` (public): list with `category`, `order`, `orderBy`, `page`, `limit`
  - `GET /products/:slug` (public): get by slug
  - `GET /products/store/:slug` (role: store-owner, Bearer): list products for owned store
  - `PATCH /products/:id` (role: store-owner, Bearer, multipart): update
  - `DELETE /products/:id` (role: store-owner, Bearer): delete

Swagger docs at `/docs` (auth via Bearer token in UI).

## Database Diagram
<img width="232" height="640" alt="image" src="https://github.com/user-attachments/assets/b304577c-ea7e-48d4-88ba-34e286100d00" />


## Environment Variables

The app validates env with Joi (see `app.module.ts`). Required:

- `APP_PORT`
- `MONGO_URL` (compose sets it using `MONGO_CONTAINER`, `MONGO_DB`)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `SALT_OR_ROUNDS`
  Optional for S3 uploads:
- `AWS_REGION`, `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Example `.env` for docker-compose:

```bash
NODE_ENV=development
APP_PORT=3000
MONGO_CONTAINER=temtem-mongo
MONGO_DB=temtem
MONGO_PORT=27017
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1d
SALT_OR_ROUNDS=10
AWS_REGION=eu-west-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Local Development

- Install deps: `npm install`
- Run dev server: `npm run start:dev` (requires local Mongo or `MONGO_URL`)
- Open docs: `http://localhost:${APP_PORT}/docs`

## Docker

- Ensure `.env` is present (see above).
- Start stack: `docker-compose up -d --build`
- API runs at `http://localhost:${APP_PORT}`; Mongo at `mongodb://localhost:${MONGO_PORT}`

## Notes

- Global guards: `AuthGuard` (JWT) + `RolesGuard` (RBAC).
- Public routes use `@Public()`; role-protected use `@Roles(SYSTEM_ROLES.ROLE)`.
- Product image uploads validate mime type and size; files are stored public-read in S3 under `stores/{storeSlug}/products/{productSlug}/...`.
