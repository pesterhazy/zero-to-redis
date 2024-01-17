FROM node:18.16.0-alpine3.17
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY projects/backend/package.json projects/backend/package-lock.json .
RUN npm install
COPY projects/backend/lib/ lib/
COPY projects/frontend/dist/ dist/
EXPOSE 4004
CMD [ "npm", "start"]
