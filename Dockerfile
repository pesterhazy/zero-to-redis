FROM node:21.6.0-alpine3.18
WORKDIR /src
COPY projects/frontend /src
RUN npm ci
RUN npm run build

FROM node:21.6.0-alpine3.18
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY projects/backend/package.json projects/backend/package-lock.json .
RUN npm ci
COPY projects/backend/lib/ lib/
COPY --from=0 /src/dist/ dist/
EXPOSE 4004
CMD [ "npm", "start"]
