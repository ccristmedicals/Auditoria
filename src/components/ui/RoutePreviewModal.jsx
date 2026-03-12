/* eslint-disable no-unused-vars */
import React from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { X, MapPin, ExternalLink, RefreshCw } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

// Center of Venezuela as default
const defaultCenter = {
  lat: 7.12539,
  lng: -66.16667,
};

export const RoutePreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  clientData = [],
  vendorName = "",
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [, setMap] = React.useState(null);
  const [directionsResponse, setDirectionsResponse] = React.useState(null);
  const [directionsError, setDirectionsError] = React.useState(false); // New state to track failure
  const [isRouting, setIsRouting] = React.useState(false); // Track if we are calculating the route

  const locations = React.useMemo(() => {
    return clientData
      .map((client) => {
        if (!client.coordenadas) return null;
        const parts = client.coordenadas.split(",");
        if (parts.length !== 2) return null;
        return {
          lat: parseFloat(parts[0].trim()),
          lng: parseFloat(parts[1].trim()),
          name: client.nombre,
        };
      })
      .filter(Boolean);
  }, [clientData]);

  const onLoad = React.useCallback(
    (map) => {
      const bounds = new window.google.maps.LatLngBounds();
      if (locations.length > 0) {
        locations.forEach((loc) => bounds.extend(loc));
        map.fitBounds(bounds);
      }
      setMap(map);
    },
    [locations]
  );

  // Calculate route using Directions Service
  React.useEffect(() => {
    if (isLoaded && locations.length >= 2) {
      if (!window.google) {
        console.error("Google Maps not loaded yet.");
        return;
      }
      
      setIsRouting(true);
      const directionsService = new window.google.maps.DirectionsService();

      const origin = locations[0];
      const destination = locations[locations.length - 1];
      const waypoints = locations.slice(1, -1).map((loc) => ({
        location: loc, // { lat: ..., lng: ... } works here
        stopover: true,
      }));

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          setIsRouting(false); // Calculation finished

          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);
            setDirectionsError(false); // Success
          } else {
            // If REQUEST_DENIED (API key restriction) or OVER_QUERY_LIMIT, fallback to nothing (just pins)
            console.warn(`Directions Service failed: ${status}`);
            setDirectionsResponse(null);
            setDirectionsError(true); // Trigger fallback
          }
        }
      );
    } else {
        // Not enough locations to route, or api not loaded
        setIsRouting(false);
    }
  }, [isLoaded, locations]);

  const polylineOptions = React.useMemo(() => {
    return {
      strokeColor: "#3B82F6", // Blue-500
      strokeOpacity: 0.8,
      strokeWeight: 4,
      fillColor: "#3B82F6",
      fillOpacity: 0.35,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      radius: 30000,
      zIndex: 1,
    };
  }, []);

  const markerLabel = React.useCallback((index) => {
    return {
      text: (index + 1).toString(),
      color: "white",
      fontWeight: "bold",
    };
  }, []);

  const handleOpenExternalMap = () => {
    if (locations.length < 2) return;
    const origin = `${locations[0].lat},${locations[0].lng}`;
    const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`;

    const waypoints = locations.slice(1, -1).map((l) => `${l.lat},${l.lng}`);
    const waypointsStr = waypoints.join("|");

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypointsStr}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const mapEmbedUrl = React.useMemo(() => {
    if (locations.length < 2) return null;

    // Use legacy Google Maps embed format to avoid API key requirements/limits
    const saddr = `${locations[0].lat},${locations[0].lng}`;
    
    // Construct daddr with intermediate points +to: final destination
    // Google Maps Embed "daddr" accepts multiple "+to:" separated coordinates as waypoints + final destination
    const daddr = locations
      .slice(1)
      .map((l) => `${l.lat},${l.lng}`)
      .join("+to:");

    return `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&output=embed`;
  }, [locations]);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white dark:bg-[#111827] w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Vista Previa de Ruta: {vendorName}
            </h3>
            <p className="text-slate-500 text-sm">
              {locations.length} paradas seleccionadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Action Bar - The "Free" Method */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between gap-4">
          <div className="flex gap-3 items-center text-blue-800 dark:text-blue-200 text-sm">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-bold">Ver ruta optimizada en Google Maps</p>
              <p className="opacity-80">
                La mejor forma de ver el tráfico y tiempos reales.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenExternalMap}
            disabled={locations.length < 2}
            className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink size={16} />
            Abrir Mapa Externo
          </button>
        </div>

        {/* Map Content */}
        <div className="flex-1 relative bg-gray-100 dark:bg-[#0b1120] min-h-75">
          {isRouting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-[#0b1120]/50 backdrop-blur-sm z-10">
               <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Calculando ruta óptima...</p>
               </div>
            </div>
          ) : null}

          {isLoaded && !loadError && !directionsError ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={locations[0] || defaultCenter}
              zoom={10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullScreenControl: false,
              }}
            >
              {/* Show road directions if available */}
              {directionsResponse && (
                <DirectionsRenderer
                  directions={directionsResponse}
                  options={{
                    suppressMarkers: true, // Use our own custom red markers
                    preserveViewport: true, // Don't re-zoom if we already fitBounds
                    polylineOptions: {
                        strokeColor: "#3B82F6", // Blue road line
                        strokeOpacity: 0.8,
                        strokeWeight: 4
                    }
                  }}
                />
              )}

              {/* Always show our custom markers for consistency */}
              {locations.map((loc, idx) => (
                <Marker
                  key={idx}
                  position={loc}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                  label={{
                    text: `${idx + 1}`,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                />
              ))}
            </GoogleMap>
          ) : mapEmbedUrl ? (
            <iframe
              width="100%"
              height="100%"
              className="absolute inset-0 border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
              title="Google Maps Route Preview"
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 p-8 text-center">
              <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-full">
                <MapPin size={40} className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-lg text-slate-600 dark:text-slate-300">
                  Mapa integrado no disponible
                </p>
                <p className="text-sm">
                  Usa el botón "Abrir Mapa Externo" de arriba para ver la ruta.
                </p>
                {loadError && (
                  <p className="text-xs text-red-400 mt-2">
                    Error API: {loadError.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Confirm Action */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-white dark:bg-[#111827]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <MapPin size={18} />
            Confirmar y Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
};
