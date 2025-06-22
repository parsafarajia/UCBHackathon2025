#!/bin/bash

# Health Monitoring System Deployment Script
# Compatible with Google Cloud Platform

echo "🏥 Health Monitoring System Deployment"
echo "======================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    exit 1
fi

# Set project ID
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

echo "📦 Building and deploying to Google Cloud..."

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Submit build to Cloud Build
echo "🏗️ Building containers with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml --substitutions=_PROJECT_ID=$PROJECT_ID

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your services should be available at:"
echo "Backend: https://health-monitoring-backend-[HASH]-uc.a.run.app"
echo "Frontend: https://health-monitoring-frontend-[HASH]-uc.a.run.app"
echo ""
echo "📋 To get the exact URLs, run:"
echo "gcloud run services list --platform managed"