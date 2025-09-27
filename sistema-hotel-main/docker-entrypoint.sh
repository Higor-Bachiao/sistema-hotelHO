#!/bin/sh

# Iniciar API em background
cd /app/api && npm start &

# Iniciar frontend
cd /app && npm start