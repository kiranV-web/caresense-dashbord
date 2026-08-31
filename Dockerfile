# ---- build stage: compile the Vite/React app to static assets ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite inlines these at BUILD time (import.meta.env.*) — they cannot be
# changed later by just restarting the container. Left blank by default so
# every API call resolves as a relative path ("/api/v1/...") and is handled
# by this same image's Nginx reverse proxy at runtime (see nginx.conf.template)
# rather than baking a specific host/IP into the JS bundle.
ARG VITE_API_BASE_URL=
ARG VITE_MAX_UPLOAD_BYTES=209715200
ARG VITE_SHOW_TRANSCRIPT_TONE=true
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_MAX_UPLOAD_BYTES=${VITE_MAX_UPLOAD_BYTES} \
    VITE_SHOW_TRANSCRIPT_TONE=${VITE_SHOW_TRANSCRIPT_TONE}
RUN npm run build

# ---- runtime stage: serve the compiled assets via Nginx ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Resolved into nginx.conf.template via the official nginx image's envsubst
# entrypoint at container start (not at build time) — so the SAME image can
# point at a different backend host/port, domain, and cert per environment
# without a rebuild. Restricted to exactly these vars so envsubst never
# touches nginx's own $uri/$host/$scheme variables in the template.
# SERVER_NAME/CERT_DOMAIN have no default — the template now requires a real
# Let's Encrypt cert at /etc/letsencrypt/live/$CERT_DOMAIN/, so the container
# must be run with both set (see the root docker-compose.yml).
ENV API_HOST=api \
    API_PORT=3000 \
    NGINX_ENVSUBST_FILTER=^(API_HOST|API_PORT|SERVER_NAME|CERT_DOMAIN)$

EXPOSE 80
# 127.0.0.1, not "localhost" — on some Docker hosts "localhost" resolves to
# ::1 first and IPv6 loopback doesn't route cleanly inside the container,
# making wget report "connection refused" even while nginx is healthy and
# actively serving real external requests.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
