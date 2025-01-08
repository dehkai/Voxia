FROM node:21

# Create a non-root user for Puppeteer
RUN groupadd -r puppeteer && useradd -r -g puppeteer -G audio,video puppeteer \
    && mkdir -p /home/puppeteer/Downloads \
    && chown -R puppeteer:puppeteer /home/puppeteer

# Set the working directory
WORKDIR /app

# Install system dependencies required by Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango1.0-0 \
    libcairo2 \
    libxcomposite1 \
    libxshmfence1 \
    fonts-liberation \
    libappindicator3-1 \
    libxss1 \
    lsb-release \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer cache directory to /home/puppeteer/.cache
ENV PUPPETEER_CACHE_DIR=/home/puppeteer/.cache

# Install Chromium for Puppeteer
RUN npx puppeteer browsers install chrome --path=/home/puppeteer/.cache/puppeteer

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Ensure the application directory is writable by the Puppeteer user
RUN chown -R puppeteer:puppeteer /app

# Change to the non-root user
USER puppeteer

# Expose the port the application will run on
EXPOSE 5000

# Use nodemon for development to watch for file changes
CMD ["npx", "nodemon", "index.js"]
