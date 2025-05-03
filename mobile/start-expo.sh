#!/bin/bash

# Increase file limit for this session
ulimit -n 10240

# Run Expo with reduced workers and in production mode to minimize file watching
EXPO_MAX_WORKERS=2 npx expo start --no-dev --minify
