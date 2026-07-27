FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.14.0 --activate

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack install && pnpm install --frozen-lockfile

FROM deps AS development
COPY . .
COPY scripts/docker-entrypoint.dev.sh /app/docker-entrypoint.dev.sh
RUN chmod +x /app/docker-entrypoint.dev.sh

ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.dev.sh"]

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ARG NEXT_PUBLIC_VK_APP_ID=
ARG NEXT_PUBLIC_VK_REDIRECT_URL=http://localhost

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VK_APP_ID=$NEXT_PUBLIC_VK_APP_ID
ENV NEXT_PUBLIC_VK_REDIRECT_URL=$NEXT_PUBLIC_VK_REDIRECT_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

FROM base AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode < 500 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
