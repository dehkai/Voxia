FROM node:16

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Serve the app
CMD ["npm", "start"]
