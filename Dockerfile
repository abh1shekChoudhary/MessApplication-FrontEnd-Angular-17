# Stage 1: Build Angular app
# Use Node 20 LTS (Alpine for minimal image size)
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first — leverages Docker layer cache
# Dependencies are only re-downloaded when package.json or package-lock.json changes
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration production

# ─────────────────────────────────────────────────────────────────
# Stage 2: Serve with Nginx
# Only the compiled static files are copied; Node.js is not present
# in the final image, keeping it lean and secure.
FROM nginx:1.27-alpine AS final

# Copy compiled Angular output into Nginx's serve directory
COPY --from=build /app/dist/mess-front-gpt/browser /usr/share/nginx/html

# Copy custom Nginx config (handles Angular routing + API reverse proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
