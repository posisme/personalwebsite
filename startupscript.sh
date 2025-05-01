#!/bin/bash
echo "Starting nginx proxy server"
nginx -g "daemon off;" &
echo "Starting server"
cd /usr/app/server/
npm install --silent
screen -dmS "server" bash -c "npm start"
echo "Starting client"
cd /usr/app/client/
npm install --silent
screen -dmS "client" bash -c "npm start"