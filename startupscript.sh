#!/bin/bash

echo "Starting server"
cd /usr/app/server/
npm install --silent
screen -dmS "server" bash -c "npm start"
echo "Starting client"
cd /usr/app/client/
npm install --silent
screen -dmS "client" bash -c "npm start"
echo "Starting nginx proxy server"
screen -dmS "nginx" bash -c "nginx -g 'daemon off;' -c /etc/nginx/sites-available/reverse-proxy"