FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
ADD /dist/muna/browser /usr/share/nginx/html





