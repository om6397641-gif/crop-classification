# 🌍 GeoVision Platform
### Machine Learning Sentinel-1 SAR Crop Classification & WebGIS Platform

GeoVision is a modern cloud-based geospatial platform for Machine Learning crop classification using multi-temporal Sentinel-1 Synthetic Aperture Radar (SAR) imagery and Google Earth Engine (GEE).

---

## 🚀 How to Run on Any Laptop / Operating System

### Option 1: One-Click Launchers (Easiest)
- **Windows**: Double-click [`start.bat`](file:///d:/University/New%20Folder/New%20folder/start.bat)
- **macOS / Linux**: Double-click or run `./start.sh` in terminal (`chmod +x start.sh`)

### Option 2: Using Node.js
If Node.js is installed on your laptop, open a terminal in this project directory and run:
```bash
npm start
```
or
```bash
node server.js
```
The server will start at `http://localhost:8080` and open your default web browser automatically.

### Option 3: Double-Click `index.html` (No Installation Required)
You can open [`index.html`](file:///d:/University/New%20Folder/New%20folder/index.html) directly in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari, Opera).

---

## 🛠️ Features Included
- **3D Earth Globe**: Powered by Three.js with polar Sentinel-1 satellite orbit animation & procedural fallback textures.
- **Interactive WebGIS Map**: Leaflet.js map with GEE raster tiles (Crop Classification, NDVI Vegetation Index, NDBI Urban Footprint, VCI Drought Index).
- **GeoTIFF & Vector Exporter**: Export GeoTIFF rasters (`.tif`), GeoJSON features (`.geojson`), Google Earth KML (`.kml`), and CSV datasets (`.csv`).
- **Interactive Bounding Box (AOI)**: Draw custom region boundaries on the map and calculate surface area in $\text{km}^2$.
- **Live GPS Tracking & Measurement Tools**: Real-time geolocation, track polyline recording, and distance measurement.
- **High-Res Layout Gallery**: Interactive lightbox viewer for portfolio cartography maps.
- **QR Code Modal**: Scan mobile preview QR codes for instant smartphone access.

---

## 📁 Directory Structure
```
├── index.html        # Main application HTML entry point
├── server.js         # Zero-dependency Node.js HTTP server
├── start.bat         # Windows launcher
├── start.sh          # macOS / Linux launcher
├── package.json      # NPM project metadata & scripts
├── CSS/
│   ├── style.css     # Core obsidian theme & design system
│   └── projects.css  # Portfolio grid layout styling
├── JS/
│   ├── app.js        # UI interactions, QR modal, lightbox
│   ├── map.js        # Leaflet WebGIS layer engine & measure tools
│   ├── earth.js      # Three.js 3D Globe & satellite orbit
│   └── export.js     # GeoTIFF, GeoJSON, KML, CSV export engine
├── image/            # Portfolio layout images
└── images/           # Earth textures, QR codes, & brand logos
```
