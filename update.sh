#!/bin/bash

# Script rápido de atualização
# Rode: bash update.sh

set -e

APP_DIR="/var/www/beth-renz"

echo "🔄 Atualizando Beth Renz Connect..."

cd $APP_DIR
git pull origin main
npm install
npm run build

sudo systemctl restart nginx

echo "✅ Atualização concluída!"
