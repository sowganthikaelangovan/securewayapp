import React, { useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: "user" | "destination" | "sos" | "safe_corridor";
}

export interface MapboxMapViewProps {
  userLat?: number;
  userLng?: number;
  zoom?: number;
  routeCoordinates?: [number, number][]; // [lng, lat][] in GeoJSON order
  markers?: MapMarker[];
  style?: any;
  interactive?: boolean;
}

const MAPBOX_PUBLIC_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  "";

export function MapboxMapView({
  userLat = 12.9716,
  userLng = 77.5946,
  zoom = 14,
  routeCoordinates,
  markers = [],
  style,
  interactive = true,
}: MapboxMapViewProps) {
  const webViewRef = useRef<WebView>(null);

  // Generate self-contained HTML running Mapbox GL JS with the dark theme
  const htmlContent = useMemo(() => {
    const routeGeoJson = routeCoordinates && routeCoordinates.length > 0
      ? JSON.stringify({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        })
      : "null";

    const markersJson = JSON.stringify(markers);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>SecureWay Mapbox</title>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css" rel="stylesheet" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js"></script>
  <style>
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #090d16;
      overflow: hidden;
    }
    .user-pulse-marker {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #0284c7;
      border: 3px solid #ffffff;
      box-shadow: 0 0 12px #38bdf8;
      position: relative;
    }
    .user-pulse-ring {
      position: absolute;
      top: -10px;
      left: -10px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid rgba(56, 189, 248, 0.6);
      animation: pulse 2s infinite ease-out;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .dest-marker {
      background: #ef4444;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
    }
    .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left {
      transform: scale(0.85);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      mapboxgl.accessToken = "${MAPBOX_PUBLIC_TOKEN}";
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/dark-v11",
        center: [${userLng}, ${userLat}],
        zoom: ${zoom},
        interactive: ${interactive},
        attributionControl: false
      });

      // User pulsating marker
      const el = document.createElement("div");
      el.className = "user-pulse-marker";
      const ring = document.createElement("div");
      ring.className = "user-pulse-ring";
      el.appendChild(ring);
      new mapboxgl.Marker(el)
        .setLngLat([${userLng}, ${userLat}])
        .addTo(map);

      // Custom markers
      const customMarkers = ${markersJson};
      customMarkers.forEach(m => {
        const markerDiv = document.createElement("div");
        markerDiv.className = m.type === "destination" ? "dest-marker" : "user-pulse-marker";
        new mapboxgl.Marker(markerDiv)
          .setLngLat([m.lng, m.lat])
          .setPopup(new mapboxgl.Popup({ offset: 15 }).setText(m.title))
          .addTo(map);
      });

      map.on("load", () => {
        const routeData = ${routeGeoJson};
        if (routeData) {
          // Glow casing
          map.addSource("safe-route", {
            type: "geojson",
            data: routeData
          });

          map.addLayer({
            id: "safe-route-glow",
            type: "line",
            source: "safe-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#38bdf8",
              "line-width": 8,
              "line-opacity": 0.45,
              "line-blur": 3
            }
          });

          map.addLayer({
            id: "safe-route-core",
            type: "line",
            source: "safe-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#0284c7",
              "line-width": 4,
              "line-opacity": 1.0
            }
          });

          // Fit bounds to route
          const coords = routeData.geometry.coordinates;
          if (coords.length > 0) {
            const bounds = coords.reduce((acc, coord) => {
              return acc.extend(coord);
            }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
            map.fitBounds(bounds, { padding: 40, duration: 1000 });
          }
        }
      });
    } catch (err) {
      console.error("Mapbox init error:", err);
    }
  </script>
</body>
</html>
    `;
  }, [userLat, userLng, zoom, routeCoordinates, markers, interactive]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.loaderText}>Loading Mapbox...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0d1322",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  webView: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0d1322",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loaderText: {
    color: "#64748b",
    fontSize: 12,
  },
});
