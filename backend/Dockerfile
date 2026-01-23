# Use Node.js LTS (Long Term Support) image
FROM node:20-alpine

# Install Python and build dependencies for native modules and interactive execution
RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
