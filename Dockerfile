# Stage 1: Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .


# Stage 2: Production stage

FROM node:18-alpine

WORKDIR /app

copy --from= build /app .

EXPOSE 4040

CMD["npm","start"]