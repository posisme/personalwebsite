#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Detect if running in Docker
if [ -f /.dockerenv ]; then
  APP_ROOT="/usr/app"
  COMMAND="npm start"
else
  APP_ROOT="$SCRIPT_DIR"
  COMMAND="npm run dev"  
fi

echo "Environment detected. Using base path: $APP_ROOT"

# Cleanup old sessions
screen -wipe > /dev/null 2>&1
screen -ls | grep -q "\.server" && screen -X -S "server" quit
screen -ls | grep -q "\.client" && screen -X -S "client" quit

echo "Starting server session..."
cd "$APP_ROOT/server/" || { echo "Failed to enter server directory"; exit 1; }
npm install --silent
screen -dmS "server" bash -c "$COMMAND"

echo "Starting client session..."
cd "$APP_ROOT/client/" || { echo "Failed to enter client directory"; exit 1; }
npm install --silent
screen -dmS "client" bash -c "$COMMAND"

echo "Startup process initiated. Checking sessions:"
screen -list