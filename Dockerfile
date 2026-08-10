# Portal de Integração — imagem de produção/homolog (Node 20, porta 3002)
# Build: docker build -t portal-integracao .
# Run:   docker run -p 3002:3002 --env-file .env.local portal-integracao

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV AUTH_SECRET=build-placeholder-not-used-at-runtime
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/content ./content
COPY --from=builder /app/data/permissions.example.json ./data/permissions.example.json

USER nextjs
EXPOSE 3002
CMD ["sh", "-c", "if [ -f data/permissions.json ]; then export PERMISSIONS_CONFIG_JSON=$(cat data/permissions.json); fi; exec node server.js"]
