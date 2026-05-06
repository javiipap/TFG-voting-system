FROM rust:1.95.0-alpine AS rust_builder
# RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY deps .
RUN apk add --no-cache musl-dev gcc make openssl-dev libc6-compat
RUN cargo install wasm-pack

# Install node, npm and yarn
RUN apk add --update nodejs npm
RUN npm i --global corepack && corepack enable

# Install server_lib deps
WORKDIR /app/server_lib
RUN yarn install

# Build dependencies
WORKDIR /app
RUN mkdir /pkg
RUN sh ./build.sh musl /pkg

# Create base container
FROM node:18-alpine AS base

# Create nodejs builder container
FROM base AS builder
RUN apk add --no-cache libc6-compat pnpm
WORKDIR /app
ADD web .
COPY --from=rust_builder /pkg ./src/lib/pkg

RUN if [ -f pnpm-lock.yaml ]; then pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

ENV NEXT_TELEMETRY_DISABLED=1

RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; \
else echo "Lockfile not found." && exit 1; \
fi

FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
