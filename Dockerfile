FROM node:20
WORKDIR /app
COPY . .
RUN rm -rf node_modules package-lock.json && npm install --legacy-peer-deps
CMD ["npm", "run", "dev", "--", "--host"]