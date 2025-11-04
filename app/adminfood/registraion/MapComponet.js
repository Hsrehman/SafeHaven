"use client";
import { useEffect, useState } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';

const MapComponent = ({ onLocationSelect, initialLocation }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(initialLocation);
  const [searchBox, setSearchBox] = useState(null);
  
  const defaultCenter = { lat: 51.5074, lng: -0.1278 }; 

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        onLocationSelect({
          lat,
          lng,
          address: results[0].formatted_address
        });
      }
    });
  };

  const handlePlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMarker({ lat, lng });
        map.panTo({ lat, lng });
        map.setZoom(15);
        
        onLocationSelect({
          lat,
          lng,
          address: place.formatted_address
        });
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="relative">
      <StandaloneSearchBox
        onLoad={ref => setSearchBox(ref)}
        onPlacesChanged={handlePlacesChanged} >
        <input
          type="text"
          placeholder="Search by postcode or address..."
          className="w-full p-2 border border-gray-300 rounded mb-2 text-black placeholder-gray-500"
          style={{ color: 'black' }}/>
      </StandaloneSearchBox>
      
      <GoogleMap
        mapContainerStyle={{ height: "400px", width: "100%" }}
        center={marker || defaultCenter}
        zoom={marker ? 15 : 5}
        onClick={handleMapClick}
        onLoad={map => setMap(map)}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
        }}>
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;