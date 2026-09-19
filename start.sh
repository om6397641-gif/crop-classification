#!/usr/bin/env bash
echo "============================================================"
echo "  Starting GeoVision WebGIS Platform..."
echo "============================================================"

if command -v node &> /dev/null
then
    echo "[OK] Node.js detected. Launching local web server..."
    node server.js
else
    echo "[NOTICE] Node.js not found. Opening index.html directly in browser..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open index.html
    else
        xdg-open index.html
    fi
fi
