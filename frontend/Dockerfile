FROM node:20 as build

WORKDIR /app

COPY package*.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps

COPY . ./frontend
RUN cd frontend && NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM nginx:alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80