# Stage 0, "build-stage", based on Node.js, to build and compile the backend
FROM node:20 AS build-stage

WORKDIR /app

# Copy package.json files
COPY package*.json ./
RUN dir -s    
COPY backend/package*.json ./backend/
COPY prisma/package*.json ./prisma/


# Install root dependencies
RUN npm install

# Copy source code
COPY backend/ ./backend/
COPY prisma/ ./prisma/

# Build the backend
WORKDIR /app/backend
RUN ls -R /app/prisma/generated/prisma
RUN npm run build

# Production stage
FROM node:20

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./

# Copy package.json files for workspace
COPY backend/package*.json ./backend/
COPY prisma/package*.json ./prisma/

# Install all dependencies including workspace links
RUN npm install --production

# Copy built application and prisma files from build stage
COPY --from=build-stage /app/backend/dist/ ./backend/dist/
COPY --from=build-stage /app/prisma/ ./prisma/

# Set working directory to backend for runtime
WORKDIR /app/backend

# Set default port
ENV BACKEND_PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"]
