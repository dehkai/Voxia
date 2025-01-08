# Use a node base image
FROM node:21

# Create a non-root user
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

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including devDependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Change to non-root user
USER puppeteer

# Expose the port
EXPOSE 5000

# Use nodemon for development to watch for file changes
CMD ["npx", "nodemon", "index.js"]
