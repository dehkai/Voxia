# Use a node base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including devDependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the port
EXPOSE 5000

# Use nodemon for development to watch for file changes
CMD ["npx", "nodemon", "index.js"]
