FROM nginx:alpine AS final
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- --spider http://localhost/ || exit 1
