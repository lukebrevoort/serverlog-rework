#!/bin/bash

# SecureLog Fly.io Deployment Script
# This script guides you through deploying SecureLog to Fly.io

set -e  # Exit on error

echo "🚀 SecureLog Fly.io Deployment Script"
echo "======================================"
echo ""

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly.io CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  brew install flyctl"
    echo "  OR"
    echo "  curl -L https://fly.io/install.sh | sh"
    echo ""
    exit 1
fi

echo "✅ Fly.io CLI found"
echo ""

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Please log in to Fly.io..."
    fly auth login
fi

echo "✅ Authenticated with Fly.io"
echo ""

# Step 1: Database
echo "📦 Step 1: Database Setup"
echo "------------------------"
echo ""
read -p "Create Postgres database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating database..."
    fly postgres create --name securelog-db --region iad
    echo ""
    echo "⚠️  IMPORTANT: Save the connection details shown above!"
    echo ""
fi

# Step 2: API
echo "🔧 Step 2: API Backend"
echo "----------------------"
echo ""
read -p "Deploy API backend? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating API app..."
    fly apps create securelog-api || echo "App may already exist"
    
    echo "Attaching database..."
    fly postgres attach securelog-db --app securelog-api || echo "Database may already be attached"
    
    echo "Deploying API..."
    fly deploy
    
    echo ""
    echo "✅ API deployed!"
    fly info --app securelog-api
    echo ""
fi

# Step 3: Web Frontend
echo "🌐 Step 3: Web Frontend"
echo "-----------------------"
echo ""
read -p "Deploy web frontend? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating web app..."
    fly apps create securelog-web || echo "App may already exist"
    
    echo "Deploying web frontend..."
    fly deploy -c fly-web.toml
    
    echo ""
    echo "✅ Web frontend deployed!"
    fly info --app securelog-web
    echo ""
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "Your app is live at:"
echo "  Frontend: https://securelog-web.fly.dev"
echo "  API: https://securelog-api.fly.dev"
echo ""
echo "Useful commands:"
echo "  fly logs --app securelog-api"
echo "  fly logs --app securelog-web"
echo "  fly status --app securelog-api"
echo "  fly dashboard"
echo ""
echo "📖 Full documentation: see DEPLOYMENT.md"
echo ""
