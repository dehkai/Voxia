FROM rasa/rasa:3.6.20-full

USER root

# Set the working directory inside the container
WORKDIR /app

# Copy all files from the current directory to /app
COPY . .

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Rasa SDK for custom actions
RUN pip install rasa-sdk

# Train the model
RUN rasa train

# Expose port 5005 for the Rasa API
EXPOSE 5005

# Command to run Rasa with the action server
CMD ["run", "--enable-api", "--cors", "*", "--port", "5005", "--endpoints", "endpoints.yml"]
