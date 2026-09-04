/* ==========================================
   GeoVision Interactive Map
   Part 1 - Map & Layers
========================================== */

// ===============================
// Create Map
// ===============================

const map = L.map("map", {

    zoomControl: false

}).setView([30.0444, 31.2357], 11);

// ===============================
// Base Layers
// ===============================

// OpenStreetMap
const osm = L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        maxZoom: 19,

        attribution: "&copy; OpenStreetMap"

    }

);


// Esri Satellite
const satellite = L.tileLayer(

    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

    {

        attribution: "&copy; Esri"

    }

);


// Default Layer
osm.addTo(map);
// ==========================
// Satellite Base Map
// ==========================

var analysisSatellite = L.tileLayer(
"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
{
    attribution: "Esri Satellite",
    maxZoom: 19
});

// ==========================
// Land Cover / Vegetation + Urban Tile
// ==========================

var analysisGEE = L.tileLayer(
"https://earthengine.googleapis.com/v1alpha/projects/silken-impulse-500102-a3/maps/d6460282c444bad6aed259a9a91dfc81-316fedfd5d25021e24a284ea46a6e0d5/tiles/{z}/{x}/{y}",
{
    attribution: "Google Earth Engine",
    maxZoom: 18,
    opacity: 0.9
});

// الطبقة الحالية
var currentAnalysisLayer = null;
// ==========================
// Vegetation Button
// ==========================
document.getElementById("vegBtn").onclick = function(){


    if(currentAnalysisLayer){
        analysisMap.removeLayer(currentAnalysisLayer);
    }


    currentAnalysisLayer = analysisGEE;

    analysisGEE.addTo(analysisMap);



    // إزالة Urban Legend
    analysisMap.removeControl(urbanLegend);


    // إضافة NDVI Legend
    ndviLegend.addTo(analysisMap);
    analysisMap.removeControl(cropLegend);
analysisMap.addControl(ndviLegend);

document.getElementById("vegetationInfo").style.display = "block";
document.getElementById("urbanText").style.display = "none";
document.getElementById("cropText").style.display = "none";

};
// ==========================
// Urban Button
// ==========================

document.getElementById("urbanBtn").onclick = function(){


    if(currentAnalysisLayer){
        analysisMap.removeLayer(currentAnalysisLayer);
    }


    currentAnalysisLayer = analysisGEE;


    analysisGEE.addTo(analysisMap);



    // إزالة NDVI Legend
    analysisMap.removeControl(ndviLegend);


    // إضافة Urban Legend
    urbanLegend.addTo(analysisMap);
    analysisMap.removeControl(cropLegend);
analysisMap.addControl(urbanLegend);

document.getElementById("vegetationInfo").style.display = "none";
document.getElementById("urbanText").style.display = "block";
document.getElementById("cropText").style.display = "none";

};
// ===============================
// NDVI Legend
// ===============================

const ndviLegend = L.control({
    position:"bottomright"
});


ndviLegend.onAdd = function(){

    let div = L.DomUtil.create(
        "div",
        "ndvi-legend"
    );


    div.innerHTML = `

    <h4>NDVI</h4>

    <p>
    <span class="legend-box low"></span>
    Low Vegetation
    </p>


    <p>
    <span class="legend-box medium"></span>
    Moderate Vegetation
    </p>


    <p>
    <span class="legend-box high"></span>
    Healthy Vegetation
    </p>

    `;


    return div;

};



// ===============================
// Urban Legend
// ===============================

const urbanLegend = L.control({
    position:"bottomright"
});


urbanLegend.onAdd = function(){

    let div = L.DomUtil.create(
        "div",
        "urban-legend"
    );


    div.innerHTML = `

    <h4>NDBI</h4>


    <p>
    <span class="legend-box urban-low"></span>
    Low Urban
    </p>


    <p>
    <span class="legend-box urban-medium"></span>
    Moderate Urban
    </p>


    <p>
    <span class="legend-box urban-high"></span>
    High Urban
    </p>


    `;


    return div;

};

// ==========================
// Crop Classification Layer
// ==========================

var cropGEE = L.tileLayer(
"https://earthengine.googleapis.com/v1alpha/projects/silken-impulse-500102-a3/maps/14c67daa3af828da811eef3c2959a5a7-9057b0392b5793c8ba2319bc4a1a2f45/tiles/{z}/{x}/{y}",
{
    attribution: "Google Earth Engine",
    maxZoom: 20,
    opacity: 0.9
});

// ===============================
// Crop Legend
// ===============================

const cropLegend = L.control({
    position:"bottomright"
});

cropLegend.onAdd = function(){

    let div = L.DomUtil.create(
        "div",
        "urban-legend"
    );

    div.innerHTML = `

    <h4>Crop Classification</h4>

    <p>
    <span class="legend-box" style="background:#ffff00"></span>
    Wheat
    </p>

    <p>
    <span class="legend-box" style="background:#00ff00"></span>
    Corn
    </p>

    <p>
    <span class="legend-box" style="background:#00ffff"></span>
    Rice
    </p>

    <p>
    <span class="legend-box" style="background:#008000"></span>
    Clover
    </p>

    <p>
    <span class="legend-box" style="background:#b5651d"></span>
    Potatoes
    </p>

    <p>
    <span class="legend-box" style="background:#ff69b4"></span>
    Suger Beet
    </p>

    <p>
    <span class="legend-box" style="background:#800080"></span>
    Beans
    </p>

    <p>
    <span class="legend-box" style="background:#ff8c00"></span>
    Sun Flower
    </p>

    <p>
    <span class="legend-box" style="background:#808000"></span>
    Orchards
    </p>

    <p>
    <span class="legend-box" style="background:#808080"></span>
    Uncultivated
    </p>

    <p>
    <span class="legend-box" style="background:#ff0000"></span>
    Urpen
    </p>

    <p>
    <span class="legend-box" style="background:#0000ff"></span>
    Irrigated Lands
    </p>

    `;

    return div;

};
// ==========================
// Crop Button
// ==========================

document.getElementById("cropBtn").onclick = function () {

    console.log("Crop button clicked");

    if (currentAnalysisLayer) {
        analysisMap.removeLayer(currentAnalysisLayer);
    }

    currentAnalysisLayer = cropGEE;

    cropGEE.addTo(analysisMap);

    // إزالة جميع المفاتيح
    analysisMap.removeControl(ndviLegend);
    analysisMap.removeControl(urbanLegend);

    // إزالة مفتاح Crop لو كان موجود ثم إضافته
    analysisMap.removeControl(cropLegend);
    cropLegend.addTo(analysisMap);

    document.getElementById("vegetationInfo").style.display = "none";
    document.getElementById("urbanText").style.display = "none";
    document.getElementById("cropText").style.display = "block";
};

// ==========================
// Reset Button
// ==========================

document.getElementById("resetBtn").onclick = function () {

    // إزالة أي طبقة تحليل
    if (currentAnalysisLayer) {
        analysisMap.removeLayer(currentAnalysisLayer);
        currentAnalysisLayer = null;
    }

    // إزالة جميع الـ Legends
    analysisMap.removeControl(ndviLegend);
    analysisMap.removeControl(urbanLegend);
    analysisMap.removeControl(cropLegend);

    // إظهار الخريطة الأساسية
    if (!analysisMap.hasLayer(analysisSatellite)) {
        analysisSatellite.addTo(analysisMap);
    }

    // إعادة مكان الخريطة
    analysisMap.setView([30.5, 31.2], 8);

    console.log("Analysis Reset");

    analysisMap.removeControl(cropLegend);

    document.getElementById("vegetationInfo").style.display = "block";
document.getElementById("urbanText").style.display = "none";
document.getElementById("cropText").style.display = "none";
};
// ===============================
// Buttons Functions
// ===============================

function showStreet() {

    if (map.hasLayer(satellite)) {

        map.removeLayer(satellite);

    }

    if (!map.hasLayer(osm)) {

        osm.addTo(map);

    }

}


function showSatellite() {

    if (map.hasLayer(osm)) {

        map.removeLayer(osm);

    }

    if (!map.hasLayer(satellite)) {

        satellite.addTo(map);

    }

}


// ===============================
// Marker On Click
// ===============================

let clickMarker;

map.on("click", function (e) {

    if (clickMarker) {

        map.removeLayer(clickMarker);

    }

    clickMarker = L.marker(e.latlng)

        .addTo(map)

        .bindPopup(

            "<b>Coordinates</b><br>" +

            "Latitude: " +

            e.latlng.lat.toFixed(6) +

            "<br>Longitude: " +

            e.latlng.lng.toFixed(6)

        )

        .openPopup();

});
/* ==========================================
   GeoVision Interactive Map
   Part 2 - My Location
========================================== */

// ===============================
// My Location
// ===============================

let myLocationMarker;
let accuracyCircle;

function showLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");
        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            // حذف العلامة القديمة
            if (myLocationMarker) {
                map.removeLayer(myLocationMarker);
            }

            // حذف دائرة الدقة القديمة
            if (accuracyCircle) {
                map.removeLayer(accuracyCircle);
            }

            // Marker
            myLocationMarker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup(
                    "<b>📍 My Location</b><br>" +
                    "Latitude: " + lat.toFixed(6) +
                    "<br>" +
                    "Longitude: " + lng.toFixed(6)
                )
                .openPopup();

            // Accuracy Circle
            accuracyCircle = L.circle([lat, lng], {

                radius: accuracy,
                color: "#00bfff",
                fillColor: "#00bfff",
                fillOpacity: 0.15

            }).addTo(map);

            // تحريك الكاميرا
            map.flyTo([lat, lng], 17, {

                animate: true,
                duration: 1.5

            });

        },

        function(error) {

            switch (error.code) {

                case error.PERMISSION_DENIED:
                    alert("تم رفض إذن الوصول للموقع.");
                    break;

                case error.POSITION_UNAVAILABLE:
                    alert("تعذر تحديد الموقع.");
                    break;

                case error.TIMEOUT:
                    alert("انتهى وقت انتظار GPS.");
                    break;

                default:
                    alert("حدث خطأ في تحديد الموقع.");

            }

        },

        {

            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0

        }

    );

}
/* ==========================================
   GeoVision Interactive Map
   Part 3 - Live Tracking
========================================== */

// ===============================
// Live Tracking
// ===============================

let watchID = null;

let liveMarker = null;

let trackLine = L.polyline([], {

    color: "#00d4ff",
    weight: 5

}).addTo(map);


let route = [];

let totalDistance = 0;

let lastPosition = null;



const userIcon = L.divIcon({

    html: "👤",

    className: "user-location",

    iconSize: [32,32]

});



function startLiveLocation(){

    if(!navigator.geolocation){

        alert("GPS غير مدعوم");

        return;

    }


    if(watchID !== null){

        alert("Live Tracking يعمل بالفعل.");

        return;

    }


    watchID = navigator.geolocation.watchPosition(

        function(position){

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            const point = L.latLng(lat,lng);

            route.push(point);

            trackLine.setLatLngs(route);


            if(lastPosition){

                totalDistance += lastPosition.distanceTo(point);

            }

            lastPosition = point;


            if(!liveMarker){

                liveMarker = L.marker(point,{

                    icon:userIcon

                }).addTo(map);

            }

            else{

                liveMarker.setLatLng(point);

            }


            liveMarker.bindPopup(

                "<b>👤 Live Location</b><br>" +

                "Distance : " +

                (totalDistance/1000).toFixed(2) +

                " km"

            );


            map.panTo(point);

        },

        function(error){

            alert(error.message);

        },

        {

            enableHighAccuracy:true,

            maximumAge:0,

            timeout:20000

        }

    );

}



// ===============================
// Stop Tracking
// ===============================

function stopLiveLocation(){

    if(watchID !== null){

        navigator.geolocation.clearWatch(watchID);

        watchID = null;

        alert("Tracking Stopped");

    }

}
/* ==========================================
   GeoVision Interactive Map
   Part 4 - Measure Tool
========================================== */

let measureMode = false;
let measurePoints = [];
let measureLine = null;

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("measureBtn");

    if(btn){

        btn.addEventListener("click", function(){

            measureMode = !measureMode;

            if(measureMode){

                btn.innerHTML = "❌ Stop Measure";

                alert("اضغط على نقطتين داخل الخريطة لحساب المسافة.");

            }else{

                btn.innerHTML = "📏 Measure";

                measurePoints = [];

                if(measureLine){

                    map.removeLayer(measureLine);

                    measureLine = null;

                }

            }

        });

    }

});

map.on("click", function(e){

    if(!measureMode) return;

    measurePoints.push(e.latlng);

    if(measurePoints.length === 2){

        if(measureLine){

            map.removeLayer(measureLine);

        }

        measureLine = L.polyline(measurePoints,{

            color:"red",

            weight:4

        }).addTo(map);

        const distance = measurePoints[0].distanceTo(measurePoints[1]);

        alert(
            "Distance : " +
            (distance/1000).toFixed(2) +
            " km"
        );

        measurePoints = [];

    }

});
/* ==========================================
   Spatial Analysis Map
========================================== */

// إنشاء الخريطة الثانية
const analysisMap = L.map("analysisMap", {
    zoomControl: true
}).setView([30.95, 31.15], 8);

// طبقة OpenStreetMap
const analysisOSM = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom:19,
        attribution:"&copy; OpenStreetMap"
    }
).addTo(analysisMap);

;
// طبقة Satellite
analysisSatellite.addTo(analysisMap);
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution:"&copy; Esri"
    }
;
let vegetationLayer = L.layerGroup().addTo(analysisMap);


