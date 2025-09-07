
# Base deps for building
FROM node:22-alpine AS base
WORKDIR /usr/src/app

# Install dependencies separately for better caching
COPY package*.json ./
RUN npm ci --ignore-scripts

# --- Development image ---
FROM base AS development
WORKDIR /usr/src/app
COPY . .
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

# --- Build stage ---
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build

# --- Production runtime ---
FROM node:22-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Only copy prod deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built files
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]


