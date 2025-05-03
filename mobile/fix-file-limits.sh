#!/bin/bash

# Set higher limits for the current session
ulimit -n 4096

# Create a temporary app.json with minimal watch patterns
cp app.json app.json.backup
cat > app.json << EOL
{
  "expo": {
    "name": "FoodSaver",
    "slug": "foodsaver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "assets/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "packagerOpts": {
      "config": "metro.config.js"
    }
  }
}
EOL

# Run Expo with minimal settings
echo "Starting Expo with increased file limits..."
EXPO_MAX_WORKERS=2 npx expo start --no-dev --minify

# Restore the original app.json when done
trap "mv app.json.backup app.json" EXIT
