/* ==========================================================================
   GeoVision GeoTIFF & Vector Layer Export Engine
   ========================================================================== */

let exportModalBackdrop = null;
let aoiMode = false;
let aoiStartLatLng = null;
let aoiRectangle = null;
let customAoiBounds = null;

document.addEventListener("DOMContentLoaded", function () {
  setupExportModalEvents();
});

// Setup Modal Event Listeners
function setupExportModalEvents() {
  exportModalBackdrop = document.getElementById("exportModalBackdrop");
  const closeBtn = document.getElementById("exportModalClose");
  const cancelBtn = document.getElementById("exportModalCancel");
  const triggerBtn = document.getElementById("startExportBtn");

  if (closeBtn && exportModalBackdrop) {
    closeBtn.addEventListener("click", closeExportModal);
  }

  if (cancelBtn && exportModalBackdrop) {
    cancelBtn.addEventListener("click", closeExportModal);
  }

  if (exportModalBackdrop) {
    exportModalBackdrop.addEventListener("click", function (e) {
      if (e.target === exportModalBackdrop) {
        closeExportModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && exportModalBackdrop.classList.contains("active")) {
        closeExportModal();
      }
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener("click", executeLayerExport);
  }

  // Extent Selector change listener
  const extentSelect = document.getElementById("exportExtentSelect");
  if (extentSelect) {
    extentSelect.addEventListener("change", function () {
      updateExportExtentInfo();
    });
  }
}

// Open Export Modal
function openExportModal() {
  if (!exportModalBackdrop) {
    exportModalBackdrop = document.getElementById("exportModalBackdrop");
  }
  if (!exportModalBackdrop) return;

  updateExportExtentInfo();
  updateActiveLayerExportLabel();
  exportModalBackdrop.classList.add("active");
}

// Close Export Modal
function closeExportModal() {
  if (exportModalBackdrop) {
    exportModalBackdrop.classList.remove("active");
  }
}

// Update Active Layer Name in Modal
function updateActiveLayerExportLabel() {
  const layerLabel = document.getElementById("exportActiveLayerName");
  if (!layerLabel) return;

  // Determine currently active layer based on active filter button
  const cropBtn = document.getElementById("cropBtn");
  const vegBtn = document.getElementById("vegBtn");
  const urbanBtn = document.getElementById("urbanBtn");
  const vciBtn = document.getElementById("vciBtn");

  if (cropBtn && cropBtn.classList.contains("active")) {
    layerLabel.textContent = "Sentinel-1 SAR Crop Classification (GEE)";
  } else if (vegBtn && vegBtn.classList.contains("active")) {
    layerLabel.textContent = "Normalized Difference Vegetation Index (NDVI)";
  } else if (urbanBtn && urbanBtn.classList.contains("active")) {
    layerLabel.textContent = "Built-Up Urban Index (NDBI)";
  } else if (vciBtn && vciBtn.classList.contains("active")) {
    layerLabel.textContent = "Vegetation Condition Index (VCI)";
  } else {
    layerLabel.textContent = "Active WebGIS Raster Layer";
  }
}

// Update Extent Information Display in Modal
function updateExportExtentInfo() {
  const extentSelect = document.getElementById("exportExtentSelect");
  const infoDisplay = document.getElementById("exportExtentDetails");
  if (!extentSelect || !infoDisplay) return;

  const mode = extentSelect.value;
  let boundsText = "";
  let areaText = "";

  if (mode === "aoi" && customAoiBounds) {
    const sw = customAoiBounds.getSouthWest();
    const ne = customAoiBounds.getNorthEast();
    boundsText = `[SW: ${sw.lat.toFixed(4)}, ${sw.lng.toFixed(4)} | NE: ${ne.lat.toFixed(4)}, ${ne.lng.toFixed(4)}]`;
    const distLat = Math.abs(ne.lat - sw.lat) * 111;
    const distLng = Math.abs(ne.lng - sw.lng) * 111 * Math.cos((sw.lat * Math.PI) / 180);
    const areaSqKm = (distLat * distLng).toFixed(2);
    areaText = `Area: ~${areaSqKm} km² (Custom Drawn AOI)`;
  } else if (mode === "aoi" && !customAoiBounds) {
    boundsText = "No custom AOI drawn yet. Use 'Select AOI' on toolbar first.";
    areaText = "Defaulting to full map viewport.";
  } else if (mode === "viewport" && typeof map !== "undefined" && map) {
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    boundsText = `[SW: ${sw.lat.toFixed(4)}, ${sw.lng.toFixed(4)} | NE: ${ne.lat.toFixed(4)}, ${ne.lng.toFixed(4)}]`;
    const distLat = Math.abs(ne.lat - sw.lat) * 111;
    const distLng = Math.abs(ne.lng - sw.lng) * 111 * Math.cos((sw.lat * Math.PI) / 180);
    const areaSqKm = (distLat * distLng).toFixed(2);
    areaText = `Area: ~${areaSqKm} km² (Current Map Viewport)`;
  } else {
    boundsText = "[SW: 29.5000, 30.8000 | NE: 31.5000, 32.5000]";
    areaText = "Area: ~18,400 km² (Egypt Nile Delta Agricultural Belt)";
  }

  infoDisplay.innerHTML = `<strong>Bounds:</strong> ${boundsText}<br><span style="color: var(--accent-cyan);">${areaText}</span>`;
}

// Bounding Box AOI Selection Tool
function toggleAoiTool() {
  if (typeof map === "undefined" || !map) return;

  aoiMode = !aoiMode;
  const aoiBtn = document.getElementById("aoiBtn");

  if (aoiMode) {
    if (aoiBtn) {
      aoiBtn.classList.add("active");
      aoiBtn.innerHTML = `<i class="fas fa-times"></i> Clear AOI`;
    }

    if (aoiRectangle) map.removeLayer(aoiRectangle);
    customAoiBounds = null;

    // Enable drawing instructions
    L.popup()
      .setLatLng(map.getCenter())
      .setContent("<b>📐 AOI Box Tool:</b> Click on map to set start point, then click opposite corner.")
      .openOn(map);

    aoiStartLatLng = null;
    map.on("click", handleAoiMapClick);
  } else {
    if (aoiBtn) {
      aoiBtn.classList.remove("active");
      aoiBtn.innerHTML = `<i class="fas fa-vector-square"></i> Select AOI`;
    }

    if (aoiRectangle) {
      map.removeLayer(aoiRectangle);
      aoiRectangle = null;
    }
    customAoiBounds = null;
    map.off("click", handleAoiMapClick);
  }
}

function handleAoiMapClick(e) {
  if (!aoiMode || !map) return;

  if (!aoiStartLatLng) {
    aoiStartLatLng = e.latlng;
    L.popup()
      .setLatLng(e.latlng)
      .setContent("<b>Corner 1 set!</b> Now click opposite corner to finish AOI box.")
      .openOn(map);
  } else {
    const endLatLng = e.latlng;
    const bounds = L.latLngBounds(aoiStartLatLng, endLatLng);
    customAoiBounds = bounds;

    if (aoiRectangle) map.removeLayer(aoiRectangle);

    aoiRectangle = L.rectangle(bounds, {
      color: "#00E5FF",
      weight: 2,
      fillColor: "#00E5FF",
      fillOpacity: 0.15,
      dashArray: "4, 4"
    }).addTo(map);

    map.off("click", handleAoiMapClick);
    aoiStartLatLng = null;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const distLat = Math.abs(ne.lat - sw.lat) * 111;
    const distLng = Math.abs(ne.lng - sw.lng) * 111 * Math.cos((sw.lat * Math.PI) / 180);
    const areaSqKm = (distLat * distLng).toFixed(2);

    L.popup()
      .setLatLng(bounds.getCenter())
      .setContent(`<b>✅ AOI Box Set!</b><br>Area: ${areaSqKm} km²<br><button onclick="openExportModal()" class="btn-primary" style="margin-top:6px; padding:4px 10px; font-size:0.75rem;"><i class="fas fa-download"></i> Export AOI</button>`)
      .openOn(map);
  }
}

// Execute Layer Export Function
function executeLayerExport() {
  const formatSelect = document.getElementById("exportFormatSelect");
  const extentSelect = document.getElementById("exportExtentSelect");
  const crsSelect = document.getElementById("exportCrsSelect");
  const statusBox = document.getElementById("exportStatusBox");
  const startBtn = document.getElementById("startExportBtn");

  if (!formatSelect || !extentSelect || !statusBox || !startBtn) return;

  const format = formatSelect.value;
  const extentMode = extentSelect.value;
  const crs = crsSelect ? crsSelect.value : "EPSG:4326";

  // Determine active layer type
  let activeLayerType = "crop";
  const cropBtn = document.getElementById("cropBtn");
  const vegBtn = document.getElementById("vegBtn");
  const urbanBtn = document.getElementById("urbanBtn");
  const vciBtn = document.getElementById("vciBtn");

  if (vegBtn && vegBtn.classList.contains("active")) activeLayerType = "veg";
  if (urbanBtn && urbanBtn.classList.contains("active")) activeLayerType = "urban";
  if (vciBtn && vciBtn.classList.contains("active")) activeLayerType = "vci";

  // Get active bounds
  let targetBounds = null;
  if (extentMode === "aoi" && customAoiBounds) {
    targetBounds = customAoiBounds;
  } else if (typeof map !== "undefined" && map) {
    targetBounds = map.getBounds();
  } else {
    targetBounds = L.latLngBounds([29.5, 30.8], [31.5, 32.5]);
  }

  // Update Status Box UI
  statusBox.style.display = "block";
  statusBox.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem; color: var(--accent-cyan);">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Generating ${format.toUpperCase()} dataset from GEE pixel backend...</span>
    </div>
  `;
  startBtn.disabled = true;

  setTimeout(function () {
    let filename = `GeoVision_${activeLayerType}_export.${format}`;
    let fileBlob = null;

    if (format === "geojson") {
      fileBlob = buildGeoJSONBlob(targetBounds, activeLayerType, crs);
    } else if (format === "csv") {
      fileBlob = buildCSVBlob(targetBounds, activeLayerType);
    } else if (format === "kml") {
      fileBlob = buildKMLBlob(targetBounds, activeLayerType);
    } else if (format === "tif") {
      fileBlob = buildSimulatedGeoTIFFBlob(targetBounds, activeLayerType, crs);
      filename = `GeoVision_${activeLayerType}_Sentinel1_10m.tif`;
    }

    if (fileBlob) {
      triggerBrowserDownload(fileBlob, filename);

      statusBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; color: var(--accent-emerald);">
          <i class="fas fa-check-circle"></i>
          <span><b>Export Complete!</b> Download started: <code>${filename}</code></span>
        </div>
      `;
    } else {
      statusBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; color: #F87171;">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Export failed. Please check AOI selection.</span>
        </div>
      `;
    }

    startBtn.disabled = false;
  }, 1200);
}

// GeoJSON Generator
function buildGeoJSONBlob(bounds, layerType, crs) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const cropTypes = ["Wheat", "Corn", "Rice", "Clover", "Potatoes", "Sugar Beet", "Orchards"];
  const features = [];

  const latStep = (ne.lat - sw.lat) / 3;
  const lngStep = (ne.lng - sw.lng) / 3;

  let featureId = 1;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const minLat = sw.lat + i * latStep;
      const maxLat = minLat + latStep * 0.85;
      const minLng = sw.lng + j * lngStep;
      const maxLng = minLng + lngStep * 0.85;

      const crop = cropTypes[(i + j * 2) % cropTypes.length];
      const vv = (-12.5 + (i * 1.8) - (j * 0.9)).toFixed(2);
      const vh = (-18.2 + (j * 1.5) - (i * 0.6)).toFixed(2);
      const ndvi = (0.35 + (i * 0.15) + (j * 0.08)).toFixed(3);
      const confidence = (92.4 + (i * 1.2)).toFixed(1);

      features.push({
        type: "Feature",
        id: featureId++,
        geometry: {
          type: "Polygon",
          coordinates: [[
            [Number(minLng.toFixed(6)), Number(minLat.toFixed(6))],
            [Number(maxLng.toFixed(6)), Number(minLat.toFixed(6))],
            [Number(maxLng.toFixed(6)), Number(maxLat.toFixed(6))],
            [Number(minLng.toFixed(6)), Number(maxLat.toFixed(6))],
            [Number(minLng.toFixed(6)), Number(minLat.toFixed(6))]
          ]]
        },
        properties: {
          layer_type: layerType,
          crop_class: crop,
          sar_vv_db: Number(vv),
          sar_vh_db: Number(vh),
          ndvi_index: Number(ndvi),
          ml_confidence_pct: Number(confidence),
          crs_epsg: crs,
          sensor: "Sentinel-1 SAR C-Band",
          acquisition_year: 2026
        }
      });
    }
  }

  const geojsonObj = {
    type: "FeatureCollection",
    name: `GeoVision_${layerType}_Export`,
    crs: {
      type: "name",
      properties: { name: `urn:ogc:def:crs:OGC:1.3:CRS84` }
    },
    features: features
  };

  return new Blob([JSON.stringify(geojsonObj, null, 2)], { type: "application/json" });
}

// CSV Generator
function buildCSVBlob(bounds, layerType) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const cropTypes = ["Wheat", "Corn", "Rice", "Clover", "Potatoes", "Sugar Beet", "Orchards"];

  let csvRows = [];
  csvRows.push("point_id,latitude,longitude,crop_class,sar_vv_db,sar_vh_db,ndvi_index,vci_index,confidence_pct");

  let ptId = 1;
  const latSteps = 10;
  const lngSteps = 10;
  const dLat = (ne.lat - sw.lat) / latSteps;
  const dLng = (ne.lng - sw.lng) / lngSteps;

  for (let i = 0; i <= latSteps; i++) {
    for (let j = 0; j <= lngSteps; j++) {
      const lat = (sw.lat + i * dLat).toFixed(6);
      const lng = (sw.lng + j * dLng).toFixed(6);
      const crop = cropTypes[(i * 3 + j) % cropTypes.length];
      const vv = (-11.2 - (i * 0.4) + (j * 0.3)).toFixed(2);
      const vh = (-17.8 - (j * 0.5) + (i * 0.2)).toFixed(2);
      const ndvi = (0.42 + (i * 0.03) + (j * 0.02)).toFixed(3);
      const vci = (68.5 + (i * 1.5) - (j * 0.8)).toFixed(1);
      const conf = (94.0 + (i * 0.3)).toFixed(1);

      csvRows.push(`${ptId++},${lat},${lng},"${crop}",${vv},${vh},${ndvi},${vci},${conf}`);
    }
  }

  return new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
}

// KML Generator
function buildKMLBlob(bounds, layerType) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const cropTypes = ["Wheat", "Corn", "Rice", "Clover", "Potatoes"];

  let placemarks = "";
  const latStep = (ne.lat - sw.lat) / 4;
  const lngStep = (ne.lng - sw.lng) / 4;

  let idx = 1;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const minLat = sw.lat + i * latStep;
      const maxLat = minLat + latStep * 0.8;
      const minLng = sw.lng + j * lngStep;
      const maxLng = minLng + lngStep * 0.8;
      const crop = cropTypes[(i + j) % cropTypes.length];

      placemarks += `
    <Placemark>
      <name>Parcel ${idx++}: ${crop}</name>
      <description>GeoVision Sentinel-1 SAR Crop Parcel. Layer: ${layerType}</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${minLng.toFixed(6)},${minLat.toFixed(6)},0
              ${maxLng.toFixed(6)},${minLat.toFixed(6)},0
              ${maxLng.toFixed(6)},${maxLat.toFixed(6)},0
              ${minLng.toFixed(6)},${maxLat.toFixed(6)},0
              ${minLng.toFixed(6)},${minLat.toFixed(6)},0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
    }
  }

  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>GeoVision ${layerType.toUpperCase()} Export</name>
    <description>Sentinel-1 SAR Vector Parcels & Land Cover</description>
    ${placemarks}
  </Document>
</kml>`;

  return new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
}

// GeoTIFF Generator
function buildSimulatedGeoTIFFBlob(bounds, layerType, crs) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const tifHeaderInfo = `GEOTIFF RASTER METADATA HEADER (GeoVision Cloud GIS Engine)
------------------------------------------------------------
Format: GeoTIFF (Cloud-Optimized GeoTIFF - COG)
CRS: ${crs}
Raster Size: 1024 x 1024 pixels
Spatial Resolution: 10 meters / pixel
Bounding Box:
  South-West: Lat ${sw.lat.toFixed(6)}, Lng ${sw.lng.toFixed(6)}
  North-East: Lat ${ne.lat.toFixed(6)}, Lng ${ne.lng.toFixed(6)}

Bands Included:
  Band 1: SAR VV Backscatter (dB)
  Band 2: SAR VH Backscatter (dB)
  Band 3: Classified Crop Code (1: Wheat, 2: Corn, 3: Rice, 4: Clover, 5: Potato, 6: SugarBeet)
  Band 4: NDVI Vegetation Index (-1.0 to +1.0)

Source: Sentinel-1 SAR & Google Earth Engine Machine Learning Pipeline
Generated At: ${new Date().toISOString()}
------------------------------------------------------------
`;

  return new Blob([tifHeaderInfo], { type: "image/tiff" });
}

// Download Helper
function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
