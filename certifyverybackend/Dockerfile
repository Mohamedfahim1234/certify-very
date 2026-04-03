FROM node:20-slim

# Install build tools for native dependencies (Transformers.js, bcrypt, etc.)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set environment variables for Transformers.js model caching
ENV TRANSFORMERS_CACHE=/app/.cache
ENV XENOVA_TRANSFORMERS_CACHE=/app/.cache
ENV HF_HOME=/app/.cache

# Create cache directory
RUN mkdir -p /app/.cache && chmod 777 /app/.cache

# Copy package files and install dependencies
COPY package*.json ./
# Use npm ci for production, or npm install if package-lock.json is not perfect
RUN npm install

# Copy the rest of the application
COPY . .

# Expose backend port
EXPOSE 8000

# Start the application using tsx as the project uses TypeScript directly
CMD ["npx", "tsx", "src/index.ts"]
