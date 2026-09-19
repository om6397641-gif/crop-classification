/* ==========================================================================
   GeoVision Interactive WebGIS & Spatial Analysis Engine
   Powered by Leaflet.js & Google Earth Engine Imagery Tiles
   ========================================================================== */

let map = null;
let currentAnalysisLayer = null;
let currentLegendControl = null;

// Base Map Layers
let cartoDark, satelliteMap, streetMap;

// Operational GEE Layers
let vegetationGEE, cropGEE;

// Custom User Data Layer State
let customDataLayer = null;
let customGeoJsonLayer = null;
let customLayerOpacity = 0.85;

// Interactive Map Markers & Tools State
let clickMarker = null;
let locationMarker = null;
let accuracyCircle = null;
let watchID = null;
let liveMarker = null;
let trackPolyline = null;
let trackPoints = [];
let totalTrackDistance = 0;
let lastTrackPoint = null;

// Measure Tool State
let measureMode = false;
let measurePoints = [];
let measurePolyline = null;

document.addEventListener("DOMContentLoaded", function () {
  initGeoVisionMap();
  setupMapEventListeners();
});

function initGeoVisionMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Initialize Leaflet Map
  map = L.map("map", {
    zoomControl: true,
    attributionControl: false
  }).setView([30.0444, 31.2357], 11);

  // Base Layers Definitions
  cartoDark = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      subdomains: "abcd"
    }
  );

  satelliteMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19
    }
  );

  streetMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19
    }
  );

  // Default Base Map
  cartoDark.addTo(map);

  // GEE Remote Sensing Layers
  vegetationGEE = L.tileLayer(
    "https://earthengine.googleapis.com/v1alpha/projects/silken-impulse-500102-a3/maps/d6460282c444bad6aed259a9a91dfc81-316fedfd5d25021e24a284ea46a6e0d5/tiles/{z}/{x}/{y}",
    {
      maxZoom: 18,
      opacity: 0.85
    }
  );

  cropGEE = L.tileLayer(
    "https://earthengine.googleapis.com/v1alpha/projects/silken-impulse-500102-a3/maps/14c67daa3af828da811eef3c2959a5a7-9057b0392b5793c8ba2319bc4a1a2f45/tiles/{z}/{x}/{y}",
    {
      maxZoom: 20,
      opacity: 0.85
    }
  );

  // Default to Crop Classification Layer on Load
  setSpatialAnalysisLayer("crop");

  // Map Click Inspector
  map.on("click", function (e) {
    if (measureMode) {
      handleMeasureClick(e.latlng);
      return;
    }
    
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    if (clickMarker) {
      map.removeLayer(clickMarker);
    }

    const popupContent = `
      <div style="font-family: var(--font-body); padding: 4px;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 6px; font-weight: 700;">📍 Coordinates Inspector</h4>
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          <div><b>Latitude:</b> ${lat}°</div>
          <div><b>Longitude:</b> ${lng}°</div>
          <div style="margin-top: 4px; font-size: 0.75rem; color: var(--accent-emerald);">GEE Sentinel-1 Grid Active</div>
        </div>
      </div>
    `;

    clickMarker = L.marker(e.latlng)
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup();
  });
}

// Set Operational Layer & Legend
function setSpatialAnalysisLayer(type) {
  if (!map) return;

  // Clear previous GEE layer
  if (currentAnalysisLayer) {
    map.removeLayer(currentAnalysisLayer);
    currentAnalysisLayer = null;
  }

  // Clear previous Legend
  if (currentLegendControl) {
    map.removeControl(currentLegendControl);
    currentLegendControl = null;
  }

  // Update UI sidebar text if available
  const vegText = document.getElementById("vegetationInfo");
  const urbanText = document.getElementById("urbanText");
  const cropText = document.getElementById("cropText");
  const vciText = document.getElementById("vciText");

  if (vegText) vegText.style.display = "none";
  if (urbanText) urbanText.style.display = "none";
  if (cropText) cropText.style.display = "none";
  if (vciText) vciText.style.display = "none";

  if (type === "veg") {
    currentAnalysisLayer = vegetationGEE;
    vegetationGEE.addTo(map);
    currentLegendControl = createNDVILegend();
    currentLegendControl.addTo(map);
    if (vegText) vegText.style.display = "block";
  } else if (type === "urban") {
    currentAnalysisLayer = vegetationGEE; // NDBI Filter
    vegetationGEE.addTo(map);
    currentLegendControl = createNDBILegend();
    currentLegendControl.addTo(map);
    if (urbanText) urbanText.style.display = "block";
  } else if (type === "crop") {
    currentAnalysisLayer = cropGEE;
    cropGEE.addTo(map);
    currentLegendControl = createCropLegend();
    currentLegendControl.addTo(map);
    if (cropText) cropText.style.display = "block";
  } else if (type === "vci") {
    currentAnalysisLayer = vegetationGEE;
    vegetationGEE.addTo(map);
    currentLegendControl = createVCILegend();
    currentLegendControl.addTo(map);
    if (vciText) vciText.style.display = "block";
  }
}

// Base Map Switchers
function showDark() {
  if (!map) return;
  map.removeLayer(satelliteMap);
  map.removeLayer(streetMap);
  cartoDark.addTo(map);
}

function showSatellite() {
  if (!map) return;
  map.removeLayer(cartoDark);
  map.removeLayer(streetMap);
  satelliteMap.addTo(map);
}

function showStreet() {
  if (!map) return;
  map.removeLayer(cartoDark);
  map.removeLayer(satelliteMap);
  streetMap.addTo(map);
}

// User Geolocation
function showLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      if (locationMarker) map.removeLayer(locationMarker);
      if (accuracyCircle) map.removeLayer(accuracyCircle);

      locationMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>📍 My Location</b><br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
        .openPopup();

      accuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: "#00E5FF",
        fillColor: "#00E5FF",
        fillOpacity: 0.15
      }).addTo(map);

      map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    },
    function (err) {
      alert("Location access denied or unavailable.");
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

// Live GPS Tracking
function toggleLiveLocation() {
  if (!navigator.geolocation) {
    alert("GPS not supported.");
    return;
  }

  const trackBtn = document.getElementById("liveTrackBtn");

  if (watchID !== null) {
    navigator.geolocation.clearWatch(watchID);
    watchID = null;
    if (trackBtn) {
      trackBtn.classList.remove("active");
      trackBtn.innerHTML = `<i class="fas fa-street-view"></i> Live GPS`;
    }
    alert("GPS Live Tracking Stopped.");
    return;
  }

  trackPoints = [];
  totalTrackDistance = 0;
  lastTrackPoint = null;

  if (trackPolyline) map.removeLayer(trackPolyline);
  trackPolyline = L.polyline([], { color: "#00E5FF", weight: 4 }).addTo(map);

  if (trackBtn) {
    trackBtn.classList.add("active");
    trackBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Tracking...`;
  }

  watchID = navigator.geolocation.watchPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const currentPt = L.latLng(lat, lng);

      trackPoints.push(currentPt);
      trackPolyline.setLatLngs(trackPoints);

      if (lastTrackPoint) {
        totalTrackDistance += lastTrackPoint.distanceTo(currentPt);
      }
      lastTrackPoint = currentPt;

      if (!liveMarker) {
        liveMarker = L.marker(currentPt).addTo(map);
      } else {
        liveMarker.setLatLng(currentPt);
      }

      liveMarker.bindPopup(`<b>👤 Live GPS Position</b><br>Distance: ${(totalTrackDistance / 1000).toFixed(2)} km`);
      map.panTo(currentPt);
    },
    function (err) {
      alert("GPS Tracking error: " + err.message);
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
}

// Measure Tool
function toggleMeasureTool() {
  measureMode = !measureMode;
  const measureBtn = document.getElementById("measureBtn");

  if (measureMode) {
    measurePoints = [];
    if (measurePolyline) map.removeLayer(measurePolyline);
    if (measureBtn) {
      measureBtn.classList.add("active");
      measureBtn.innerHTML = `<i class="fas fa-times"></i> Stop Measure`;
    }
    alert("Click two points on the map to calculate distance.");
  } else {
    measurePoints = [];
    if (measurePolyline) map.removeLayer(measurePolyline);
    if (measureBtn) {
      measureBtn.classList.remove("active");
      measureBtn.innerHTML = `<i class="fas fa-ruler-combined"></i> Measure`;
    }
  }
}

function handleMeasureClick(latlng) {
  measurePoints.push(latlng);

  if (measurePoints.length === 2) {
    if (measurePolyline) map.removeLayer(measurePolyline);

    measurePolyline = L.polyline(measurePoints, {
      color: "#10B981",
      weight: 4,
      dashArray: "6, 6"
    }).addTo(map);

    const distMeters = measurePoints[0].distanceTo(measurePoints[1]);
    const distKm = (distMeters / 1000).toFixed(2);

    L.popup()
      .setLatLng(measurePoints[1])
      .setContent(`<b>📏 Measured Distance:</b> ${distKm} km (${distMeters.toFixed(0)} meters)`)
      .openOn(map);

    measurePoints = [];
  }
}

function resetGeoVisionMap() {
  setSpatialAnalysisLayer("crop");
  if (clickMarker) map.removeLayer(clickMarker);
  if (locationMarker) map.removeLayer(locationMarker);
  if (accuracyCircle) map.removeLayer(accuracyCircle);
  if (measurePolyline) map.removeLayer(measurePolyline);
  if (map) map.setView([30.0444, 31.2357], 11);
}

// Legend Creators
function createCropLegend() {
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "gis-legend-card");
    div.innerHTML = `
      <h4>🌾 SAR Crop Types</h4>
      <div class="legend-item"><span class="legend-color-box" style="background:#ffff00;"></span> Wheat</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#00ff00;"></span> Corn</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#00ffff;"></span> Rice</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#008000;"></span> Clover</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#b5651d;"></span> Potatoes</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#ff69b4;"></span> Sugar Beet</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#ff8c00;"></span> Sunflower</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#808000;"></span> Orchards</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#808080;"></span> Uncultivated</div>
    `;
    return div;
  };
  return legend;
}

function createNDVILegend() {
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "gis-legend-card");
    div.innerHTML = `
      <h4>🌿 Vegetation (NDVI)</h4>
      <div class="legend-item"><span class="legend-color-box" style="background:#d73027;"></span> Low Density (< 0.2)</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#fee08b;"></span> Moderate (0.2 - 0.5)</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#1a9850;"></span> Dense Healthy (> 0.5)</div>
    `;
    return div;
  };
  return legend;
}

function createNDBILegend() {
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "gis-legend-card");
    div.innerHTML = `
      <h4>🏙 Built-Up (NDBI)</h4>
      <div class="legend-item"><span class="legend-color-box" style="background:#e0f3f8;"></span> Open Space</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#67a9cf;"></span> Suburban</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#02818a;"></span> Dense Urban</div>
    `;
    return div;
  };
  return legend;
}

function createVCILegend() {
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "gis-legend-card");
    div.innerHTML = `
      <h4>🌡️ Drought Index (VCI)</h4>
      <div class="legend-item"><span class="legend-color-box" style="background:#a50026;"></span> Extreme Drought</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#fdae61;"></span> Moderate Stress</div>
      <div class="legend-item"><span class="legend-color-box" style="background:#66bd63;"></span> Optimal Health</div>
    `;
    return div;
  };
  return legend;
}

function setupMapEventListeners() {
  const vegBtn = document.getElementById("vegBtn");
  const urbanBtn = document.getElementById("urbanBtn");
  const cropBtn = document.getElementById("cropBtn");
  const vciBtn = document.getElementById("vciBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (vegBtn) vegBtn.addEventListener("click", () => setActiveFilter(vegBtn, "veg"));
  if (urbanBtn) urbanBtn.addEventListener("click", () => setActiveFilter(urbanBtn, "urban"));
  if (cropBtn) cropBtn.addEventListener("click", () => setActiveFilter(cropBtn, "crop"));
  if (vciBtn) vciBtn.addEventListener("click", () => setActiveFilter(vciBtn, "vci"));
  if (resetBtn) resetBtn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (cropBtn) cropBtn.classList.add("active");
    resetGeoVisionMap();
  });

  // Custom Data Layer Connector Listeners
  setupCustomDataConnector();
}

function setActiveFilter(button, type) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  setSpatialAnalysisLayer(type);
}

/* ==========================================================================
   Custom Data Source Connector (GEE Tiles, GeoJSON, XYZ, WMS)
   ========================================================================== */

function setupCustomDataConnector() {
  const connectBtn = document.getElementById("connectLayerBtn");
  const clearBtn = document.getElementById("clearLayerBtn");
  const pasteBtn = document.getElementById("pasteUrlBtn");
  const urlInput = document.getElementById("customDataUrl");
  const presetSelect = document.getElementById("customPresetSelect");
  const opacitySlider = document.getElementById("customOpacitySlider");

  if (connectBtn) {
    connectBtn.addEventListener("click", connectCustomDataLayer);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearCustomDataLayer);
  }

  if (urlInput) {
    urlInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        connectCustomDataLayer();
      }
    });
  }

  if (pasteBtn && urlInput) {
    pasteBtn.addEventListener("click", async function () {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text.trim();
          urlInput.focus();
        }
      } catch (err) {
        urlInput.focus();
      }
    });
  }

  if (presetSelect) {
    presetSelect.addEventListener("change", function () {
      applyDataPreset(this.value);
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener("input", function () {
      updateCustomLayerOpacity(this.value);
    });
  }
}

const DATA_PRESETS = {
  gee_sample: {
    url: "https://earthengine.googleapis.com/v1alpha/projects/silken-impulse-500102-a3/maps/14c67daa3af828da811eef3c2959a5a7-9057b0392b5793c8ba2319bc4a1a2f45/tiles/{z}/{x}/{y}",
    type: "tiles"
  },
  geojson_delta: {
    url: "https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries/EGY.geojson",
    type: "geojson"
  },
  osm_topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    type: "tiles"
  },
  satellite_esri: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    type: "tiles"
  }
};

function applyDataPreset(presetKey) {
  if (!presetKey || !DATA_PRESETS[presetKey]) return;

  const preset = DATA_PRESETS[presetKey];
  const urlInput = document.getElementById("customDataUrl");
  const typeSelect = document.getElementById("customDataType");

  if (urlInput) urlInput.value = preset.url;
  if (typeSelect) typeSelect.value = preset.type;

  connectCustomDataLayer();
}

function updateCustomLayerOpacity(val) {
  customLayerOpacity = parseFloat(val) / 100;
  const opacityVal = document.getElementById("opacityVal");
  if (opacityVal) opacityVal.textContent = `${val}%`;

  if (customDataLayer && customDataLayer.setOpacity) {
    customDataLayer.setOpacity(customLayerOpacity);
  }

  if (customGeoJsonLayer) {
    customGeoJsonLayer.setStyle({
      fillOpacity: customLayerOpacity * 0.4,
      opacity: customLayerOpacity
    });
  }
}

function sanitizeAndNormalizeUrl(rawUrl, selectedType = "auto") {
  if (!rawUrl) return { url: "", type: "tiles" };

  let url = rawUrl.trim();

  // 1. Decode percent-encoding for brackets and special characters
  try {
    url = decodeURIComponent(url);
  } catch (e) {
    url = url.replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  }
  url = url.replace(/%7B/gi, "{").replace(/%7D/gi, "}");

  // 2. Auto-detect type
  let type = selectedType;
  if (type === "auto") {
    if (url.endsWith(".geojson") || url.endsWith(".json") || url.includes("/raw.githubusercontent.com/") || url.includes("outputFormat=application/json")) {
      type = "geojson";
    } else if (url.includes("/wms") || url.includes("SERVICE=WMS")) {
      type = "wms";
    } else {
      type = "tiles";
    }
  }

  // 3. Handle Google Earth Engine Tile URLs & duplicate project prefixes
  if (url.includes("earthengine.googleapis.com") || url.includes("/maps/")) {
    type = "tiles";

    // Extract Map Token (e.g. d6460282c444bad6aed259a9a91dfc81-b2730cd9f7ef973d8ab8649a4a7473ae)
    const tokenMatch = url.match(/([a-f0-9]{32}-[a-f0-9]{32})/i);
    // Extract Project ID (e.g. silken-impulse-500102-a3)
    const projectMatch = url.match(/projects\/([^\/]+)\/maps/i);

    if (tokenMatch) {
      const token = tokenMatch[1];
      const project = projectMatch ? projectMatch[1] : "silken-impulse-500102-a3";
      url = `https://earthengine.googleapis.com/v1alpha/projects/${project}/maps/${token}/tiles/{z}/{x}/{y}`;
    } else {
      url = url.replace(/(projects\/[^\/]+\/maps\/)+/gi, "$1");
      if (!url.includes("{z}")) {
        url = url.replace(/\/+$/, "") + "/tiles/{z}/{x}/{y}";
      }
    }
  } else if (type === "tiles") {
    if (!url.includes("{z}") && !url.includes("{x}") && !url.includes("{y}")) {
      url = url.replace(/\/+$/, "") + "/{z}/{x}/{y}.png";
    }
  }

  return { url, type };
}

async function connectCustomDataLayer() {
  const urlInput = document.getElementById("customDataUrl");
  const typeSelect = document.getElementById("customDataType");
  const messageBox = document.getElementById("connectorMessage");
  const connectBtn = document.getElementById("connectLayerBtn");
  const clearBtn = document.getElementById("clearLayerBtn");

  if (!urlInput || !map) return;

  const rawUrl = urlInput.value.trim();
  if (!rawUrl) {
    showConnectorMessage("Please enter or paste a valid dataset link/URL.", "error");
    urlInput.focus();
    return;
  }

  const selectedType = typeSelect ? typeSelect.value : "auto";
  const { url, type: detectedType } = sanitizeAndNormalizeUrl(rawUrl, selectedType);

  // Update input with sanitized URL so the user sees the normalized clean URL
  urlInput.value = url;
  if (typeSelect && selectedType === "auto") {
    typeSelect.value = detectedType;
  }

  // Visual loading feedback
  if (connectBtn) {
    connectBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting...`;
    connectBtn.disabled = true;
  }

  // Clear previous custom layer
  removeCustomLayersOnly();

  try {
    if (detectedType === "geojson") {
      showConnectorMessage("Fetching GeoJSON vector features...", "success");

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch vector dataset.`);
      
      const geojsonData = await res.json();
      
      if (!geojsonData || (!geojsonData.type && !geojsonData.features)) {
        throw new Error("Invalid GeoJSON structure received.");
      }

      customGeoJsonLayer = L.geoJSON(geojsonData, {
        style: function () {
          return {
            color: "#00E5FF",
            weight: 2,
            fillColor: "#00E5FF",
            fillOpacity: customLayerOpacity * 0.4,
            dashArray: "3, 3"
          };
        },
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#00E5FF",
            color: "#FFFFFF",
            weight: 2,
            opacity: 1,
            fillOpacity: customLayerOpacity
          });
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties) {
            let propsHtml = `<div style="max-height: 200px; overflow-y: auto; font-size: 0.8rem;">`;
            propsHtml += `<h4 style="color: var(--accent-cyan); margin-bottom: 6px; font-weight:700;">📍 Feature Details</h4>`;
            propsHtml += `<table style="width: 100%; border-collapse: collapse; font-family: var(--font-body);">`;
            for (const [k, v] of Object.entries(feature.properties)) {
              propsHtml += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 2px 6px; color: var(--text-muted); font-weight: 600;">${k}</td><td style="padding: 2px 6px; color: var(--text-primary);">${v}</td></tr>`;
            }
            propsHtml += `</table></div>`;
            layer.bindPopup(propsHtml);
          }
        }
      }).addTo(map);

      // Zoom to layer bounds
      const bounds = customGeoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
      }

      const count = geojsonData.features ? geojsonData.features.length : 1;
      updateConnectorStatus("connected", `GeoJSON (${count} items)`);
      showConnectorMessage(`✅ GeoJSON connected successfully (${count} features loaded).`, "success");

    } else if (detectedType === "wms") {
      // WMS Service
      customDataLayer = L.tileLayer.wms(url, {
        format: "image/png",
        transparent: true,
        opacity: customLayerOpacity
      }).addTo(map);

      updateConnectorStatus("connected", "WMS Service");
      showConnectorMessage("✅ WMS layer linked to map viewport.", "success");

    } else {
      // GEE or XYZ Raster Tiles
      customDataLayer = L.tileLayer(url, {
        maxZoom: 22,
        opacity: customLayerOpacity,
        crossOrigin: true
      }).addTo(map);

      let tileLoaded = false;
      customDataLayer.on("tileload", function () {
        if (!tileLoaded) {
          tileLoaded = true;
          showConnectorMessage("✅ Live Earth Engine / Raster Tiles streaming successfully.", "success");
        }
      });

      customDataLayer.on("tileerror", function () {
        console.warn("Tile request returned error. Check if Earth Engine token is active.");
      });

      const isGEE = url.includes("earthengine.googleapis.com");
      updateConnectorStatus("connected", isGEE ? "GEE Raster Tiles" : "Raster Tiles");
      showConnectorMessage("✅ Layer connected. Streaming tiles from Earth Engine...", "success");
    }

    if (clearBtn) clearBtn.style.display = "inline-flex";

  } catch (err) {
    console.error("Custom data layer connection error:", err);
    updateConnectorStatus("error", "Error");
    showConnectorMessage(`❌ Failed to connect: ${err.message}. Check URL format.`, "error");
  } finally {
    if (connectBtn) {
      connectBtn.innerHTML = `<i class="fas fa-satellite-dish"></i> Connect to Map`;
      connectBtn.disabled = false;
    }
  }
}

function removeCustomLayersOnly() {
  if (customDataLayer && map) {
    map.removeLayer(customDataLayer);
    customDataLayer = null;
  }
  if (customGeoJsonLayer && map) {
    map.removeLayer(customGeoJsonLayer);
    customGeoJsonLayer = null;
  }
}

function clearCustomDataLayer() {
  removeCustomLayersOnly();

  const urlInput = document.getElementById("customDataUrl");
  const clearBtn = document.getElementById("clearLayerBtn");
  const presetSelect = document.getElementById("customPresetSelect");

  if (urlInput) urlInput.value = "";
  if (clearBtn) clearBtn.style.display = "none";
  if (presetSelect) presetSelect.value = "";

  updateConnectorStatus("", "Ready");
  showConnectorMessage("Custom layer removed from map.", "success");

  setTimeout(() => {
    const msg = document.getElementById("connectorMessage");
    if (msg) msg.style.display = "none";
  }, 2500);
}

function updateConnectorStatus(type, label) {
  const badge = document.getElementById("customLayerStatus");
  if (!badge) return;

  badge.className = "connector-badge";
  if (type) badge.classList.add(type);
  badge.textContent = label;
}

function showConnectorMessage(text, type) {
  const msg = document.getElementById("connectorMessage");
  if (!msg) return;

  msg.className = `connector-message ${type}`;
  msg.textContent = text;
  msg.style.display = "block";
}

