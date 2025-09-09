# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

COPY .env .env

# Start the bot
CMD ["node", "dist/index.js"]
