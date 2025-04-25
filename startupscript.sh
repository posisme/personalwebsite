#!/bin/bash

echo "Starting server"
cd /usr/app/server/
npm start &
echo "Starting client"
cd /usr/app/client/
npm start