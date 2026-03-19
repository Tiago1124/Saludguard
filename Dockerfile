# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./

# RUN npm install
RUN npm install --include=dev
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS serve
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]