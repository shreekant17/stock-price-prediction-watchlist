# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

# Install any needed dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the API port
EXPOSE 7860

# Command to run the FastAPI app 
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
