#!/bin/bash

# ============================================
# Beth Renz Connect - Script de Instalação
# Ubuntu 24 LTS - Hostinger VPS
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   Beth Renz Connect - Instalação Auto    ║"
echo "║   Ubuntu 24 LTS - Hostinger VPS          ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Variáveis
REPO_URL="https://github.com/gabrielmaisresultadosonline/beth-renz-connect.git"
APP_DIR="/var/www/beth-renz"
DOMAIN=""

# Solicitar domínio (opcional)
read -p "Digite seu domínio (ex: bethrenz.com.br) ou pressione Enter para pular: " DOMAIN

echo -e "\n${YELLOW}[1/7] Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "\n${YELLOW}[2/7] Instalando dependências do sistema...${NC}"
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw

echo -e "\n${YELLOW}[3/7] Instalando Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versões
echo -e "${GREEN}Node.js: $(node -v)${NC}"
echo -e "${GREEN}NPM: $(npm -v)${NC}"

echo -e "\n${YELLOW}[4/7] Clonando repositório...${NC}"
sudo rm -rf $APP_DIR
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

echo -e "\n${YELLOW}[5/7] Instalando dependências do projeto...${NC}"
npm install

echo -e "\n${YELLOW}[6/7] Fazendo build de produção...${NC}"
npm run build

echo -e "\n${YELLOW}[7/7] Configurando Nginx...${NC}"

# Configurar Nginx
if [ -n "$DOMAIN" ]; then
    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
    sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - todas as rotas vão para index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF
    sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
else
    # Configuração padrão sem domínio
    sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root $APP_DIR/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
fi

# Testar e reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar Firewall
echo -e "\n${YELLOW}Configurando firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# SSL com Let's Encrypt (se domínio foi informado)
if [ -n "$DOMAIN" ]; then
    echo -e "\n${YELLOW}Configurando SSL com Let's Encrypt...${NC}"
    read -p "Deseja configurar SSL agora? (s/n): " SETUP_SSL
    if [ "$SETUP_SSL" = "s" ] || [ "$SETUP_SSL" = "S" ]; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
    fi
fi

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!   ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

if [ -n "$DOMAIN" ]; then
    echo -e "🌐 Seu site está disponível em: ${BLUE}https://$DOMAIN${NC}"
else
    IP=$(curl -s ifconfig.me)
    echo -e "🌐 Seu site está disponível em: ${BLUE}http://$IP${NC}"
fi

echo -e "\n${YELLOW}Comandos úteis:${NC}"
echo "  - Atualizar site:  cd $APP_DIR && git pull && npm install && npm run build"
echo "  - Reiniciar nginx: sudo systemctl restart nginx"
echo "  - Ver logs nginx:  sudo tail -f /var/log/nginx/error.log"
echo ""
