FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Accept API URL as build argument for production builds
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN rm -rf node_modules/.vite node_modules/.cache
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]