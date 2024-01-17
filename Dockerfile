FROM node:21.6.0-alpine3.18
WORKDIR /src
COPY projects/frontend /src
RUN npm ci
RUN npm run build
# RUN mkdir -p /opt/app
# WORKDIR /opt/app
# COPY projects/backend/package.json projects/backend/package-lock.json .
# RUN npm ci
# COPY projects/backend/lib/ lib/
# COPY projects/frontend/dist/ dist/
# EXPOSE 4004
# CMD [ "npm", "start"]
