#!/bin/bash

echo "Starting server"
cd /usr/app/server/
npm install
screen -dmS "server" bash -c "npm start"
echo "Starting client"
cd /usr/app/client/
npm install
screen -dmS "client" bash -c "npm start"