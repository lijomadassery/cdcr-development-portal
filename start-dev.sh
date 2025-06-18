#!/bin/bash

# CDCR Development Portal - Development Startup Script
# This script loads environment variables and starts the Backstage development server

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Warning: .env file not found!"
fi

# Verify required environment variables are set
if [ -z "$AUTH_GITHUB_CLIENT_ID" ]; then
    echo "Error: AUTH_GITHUB_CLIENT_ID not set"
    exit 1
fi

if [ -z "$AUTH_GITHUB_CLIENT_SECRET" ]; then
    echo "Error: AUTH_GITHUB_CLIENT_SECRET not set"
    exit 1
fi

echo "Starting CDCR Development Portal..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:7007"
echo "GitHub OAuth configured with Client ID: ${AUTH_GITHUB_CLIENT_ID}"
echo ""

# Start the Backstage development server
yarn start