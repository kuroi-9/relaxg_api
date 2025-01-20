FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder

WORKDIR /
COPY --from=deps node_modules ./node_modules
COPY . .

RUN apk add --update --no-cache openssh sshpass

CMD ["node", "--watch", "bin/www"]