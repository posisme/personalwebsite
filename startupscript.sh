#!/bin/bash

echo "Starting server"
cd /usr/app/server/
npm install
npm start &
echo "Starting client"
cd /usr/app/client/
npm install
npm start