#!/bin/bash

# Deploy enhanced logs viewer to minikube
# This script pulls the latest image from GitHub Container Registry and deploys it

echo "🚀 Starting deployment of enhanced logs viewer to minikube..."

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Please start minikube first."
    exit 1
fi

# Configure docker to use minikube's docker daemon
echo "📦 Configuring Docker environment..."
eval $(minikube docker-env)

# Pull the latest image from GitHub Container Registry
echo "🔽 Pulling latest image from ghcr.io..."
docker pull ghcr.io/lijomadassery/backstage:latest

# Tag the image for local use
echo "🏷️  Tagging image for local deployment..."
docker tag ghcr.io/lijomadassery/backstage:latest backstage:logs-enhanced

# Update the deployment
echo "🔄 Updating deployment..."
kubectl set image deployment/backstage backstage=backstage:logs-enhanced -n backstage-local

# Wait for rollout to complete
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/backstage -n backstage-local

# Check pod status
echo "✅ Checking pod status..."
kubectl get pods -n backstage-local

# Set up port forwarding
echo "🔗 Setting up port forwarding..."
# Kill any existing port forward
pkill -f "kubectl port-forward.*7001:7000.*backstage-local" || true
sleep 2

# Start new port forward in background
kubectl port-forward service/backstage 7001:7000 -n backstage-local &
PORT_FORWARD_PID=$!

echo "✨ Deployment complete!"
echo "📍 Access Backstage at: http://127.0.0.1:7001"
echo "📝 Port forward PID: $PORT_FORWARD_PID"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/backstage -n backstage-local"
echo ""
echo "To stop port forwarding:"
echo "  kill $PORT_FORWARD_PID"