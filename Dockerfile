FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código-fonte
COPY . .

# Compilar a aplicação (frontend e backend)
RUN npm run build

# Imagem de produção
FROM node:18-alpine

WORKDIR /app

# Copiar dependências (incluindo devDependencies)
COPY package*.json ./
# Usar npm ci sem a flag --production
RUN npm ci

# Copiar apenas os arquivos compilados
COPY --from=builder /app/dist ./dist

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Expor porta
EXPOSE 5000

# Iniciar aplicação usando o comando de produção
CMD ["node", "dist/index.js"]