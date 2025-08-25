FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY prisma prisma

RUN corepack enable pnpm
RUN pnpm i --frozen-lockfile

COPY eslint.config.mjs .   
COPY next-env.d.ts . 
COPY next.config.js .
COPY postcss.config.cjs .
COPY tsconfig.json .

COPY public public
COPY src src

RUN pnpm run build

#  Runner:
FROM node:22-alpine AS runner
LABEL org.opencontainers.image.source="https://github.com/pkitazos/spa"
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN corepack enable pnpm

ENV NODE_ENV=production \ 
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir logs
RUN chown nextjs:nodejs /app/logs


COPY --from=builder /app/node_modules/ ./node_modules
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml  .
COPY --from=builder /app/prisma ./prisma


COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs

CMD ["pnpm", "run", "start:prod"] 
