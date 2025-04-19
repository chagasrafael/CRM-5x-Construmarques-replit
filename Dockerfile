FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código-fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Imagem de produção
FROM node:18-alpine

WORKDIR /app

# Copiar dependências de produção
COPY package*.json ./
RUN npm ci --production

# Copiar arquivos compilados e server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Expor porta
EXPOSE 5000

# Iniciar aplicação
CMD ["node", "server/index.js"]