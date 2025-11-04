"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

// Fallback data just in case API fails
const fallbackFoodBanks = [
  {
    _id: "fallback-1",
    name: "North London Food Bank",
    position: { lat: 51.5514, lng: -0.1577 },
    address: "123 Example St, London",
    hours: "Mon-Fri 9AM-5PM",
    phone: "020-1234-5678",
    halal: true,
    vegetarian: true,
    wheelchairAccessible: true
  },
  {
    _id: "fallback-2",
    name: "South London Food Bank",
    position: { lat: 51.4577, lng: -0.1910 },
    address: "456 Sample Rd, London",
    hours: "Mon-Sat 10AM-4PM",
    phone: "020-5678-1234",
    halal: false,
    vegetarian: true,
    wheelchairAccessible: true
  }
];

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
};

const center = {
  lat: 51.509865,
  lng: -0.118092
};

const libraries = ["places"];

export default function FoodBankMap({ initialFoodBanks = [] }) {
  const [selectedFoodBank, setSelectedFoodBank] = useState(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    openNow: false,
    halal: false,
    vegetarian: false,
    wheelchairAccessible: false
  });
  const [foodBanks, setFoodBanks] = useState([]);
  const [filteredFoodBanks, setFilteredFoodBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Use a ref to track if data has been fetched to prevent multiple fetches
  const dataFetchedRef = useRef(false);
  
  // Use the useJsApiLoader hook for better control over API loading
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Fetch foodbanks data - only once
  const fetchFoodBanks = useCallback(async () => {
    // If we already have data from props, use that
    if (initialFoodBanks.length > 0) {
      console.log("Using initial foodbanks:", initialFoodBanks.length);
      setFoodBanks(initialFoodBanks);
      setFilteredFoodBanks(initialFoodBanks);
      setIsLoading(false);
      return;
    }
    
    // If we've already fetched data, don't fetch again
    if (dataFetchedRef.current) return;
    
    try {
      setIsLoading(true);
      setFetchError(null);
      console.log("Fetching foodbanks from API...");
      
      const response = await fetch('/api/foodbanks');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const validFoodBanks = data.data.filter(fb => 
          fb.position && 
          typeof fb.position.lat === 'number' && 
          typeof fb.position.lng === 'number'
        );
        
        console.log("Valid foodbanks loaded:", validFoodBanks.length);
        
        if (validFoodBanks.length > 0) {
          setFoodBanks(validFoodBanks);
          setFilteredFoodBanks(validFoodBanks);
        } else {
          console.warn("No valid foodbanks found, using fallback data");
          setFoodBanks(fallbackFoodBanks);
          setFilteredFoodBanks(fallbackFoodBanks);
        }
      } else {
        console.warn("API response format unexpected, using fallback data");
        setFoodBanks(fallbackFoodBanks);
        setFilteredFoodBanks(fallbackFoodBanks);
      }
      
      // Mark that we've fetched data
      dataFetchedRef.current = true;
    } catch (error) {
      console.error("Error fetching foodbanks:", error);
      setFetchError(error.message);
      setFoodBanks(fallbackFoodBanks);
      setFilteredFoodBanks(fallbackFoodBanks);
      
      // Even on error, mark that we've attempted to fetch
      dataFetchedRef.current = true;
    } finally {
      setIsLoading(false);
    }
  }, [initialFoodBanks]);

  // Initial data fetch - only once when component mounts
  useEffect(() => {
    if (!dataFetchedRef.current) {
      fetchFoodBanks();
    }
  }, [fetchFoodBanks]);

  // Apply filters and search when criteria change
  useEffect(() => {
    // Skip filtering if data isn't loaded yet
    if (foodBanks.length === 0) return;
    
    // Apply filters
    let results = [...foodBanks];
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(foodBank => 
        (foodBank.name?.toLowerCase().includes(query)) || 
        (foodBank.address?.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (filters.openNow) {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayAbbrev = day.substring(0, 3);
      
      results = results.filter(foodBank => {
        if (!foodBank.hours) return false;
        return foodBank.hours.toLowerCase().includes(dayAbbrev);
      });
    }
    
    if (filters.halal) {
      results = results.filter(foodBank => foodBank.halal === true);
    }
    
    if (filters.vegetarian) {
      results = results.filter(foodBank => foodBank.vegetarian === true);
    }
    
    if (filters.wheelchairAccessible) {
      results = results.filter(foodBank => foodBank.wheelchairAccessible === true);
    }
    
    setFilteredFoodBanks(results);
  }, [searchQuery, filters, foodBanks]);

  // Handle map loading
  const onLoad = useCallback(function callback(map) {
    console.log("Map loaded successfully");
    setMap(map);
    setMapLoaded(true);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    setMapLoaded(false);
  }, []);

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Handle retry if fetch failed
  const handleRetry = () => {
    dataFetchedRef.current = false;
    fetchFoodBanks();
  };

  if (loadError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Google Maps Error</h2>
          <p className="mt-2 text-gray-600">We encountered an error loading the map. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold">Find Food Banks Near You</h2>
          <p className="mt-2">Locate food assistance services in your area</p>
        </div>
        
        {fetchError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading food banks: {fetchError}
                </p>
                <button 
                  onClick={handleRetry}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6 border-b border-gray-200">
          {/* Search and Filter UI */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => toggleFilter('openNow')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.openNow 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Open Now
              </button>
              <button 
                onClick={() => toggleFilter('halal')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.halal 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Halal
              </button>
              <button 
                onClick={() => toggleFilter('vegetarian')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.vegetarian 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Vegetarian
              </button>
              <button 
                onClick={() => toggleFilter('wheelchairAccessible')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.wheelchairAccessible 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Wheelchair Accessible
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {isLoading ? (
              <p>Loading foodbanks...</p>
            ) : filteredFoodBanks.length === 0 ? (
              <p>No food banks match your search criteria</p>
            ) : (
              <p>Showing {filteredFoodBanks.length} food banks</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={11}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  }
                ],
                fullscreenControl: false
              }}
            >
              {/* Only render markers when map is loaded and we have data */}
              {isLoaded && mapLoaded && !isLoading && filteredFoodBanks.map((foodBank, index) => {
                // Verify we have valid position data
                if (foodBank?.position?.lat && foodBank?.position?.lng) {
                  return (
                    <Marker
                      key={foodBank._id || `marker-${index}`}
                      position={{
                        lat: Number(foodBank.position.lat),
                        lng: Number(foodBank.position.lng)
                      }}
                      onClick={() => setSelectedFoodBank(foodBank)}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      }}
                    />
                  );
                }
                return null;
              })}

              {selectedFoodBank && selectedFoodBank.position && (
                <InfoWindow
                  position={selectedFoodBank.position}
                  onCloseClick={() => setSelectedFoodBank(null)}
                >
                  <div className="p-3 max-w-xs">
                    <h3 className="font-bold text-lg text-blue-700">{selectedFoodBank.name}</h3>
                    <p className="text-sm mb-1">{selectedFoodBank.address}</p>
                    {selectedFoodBank.hours && <p className="text-sm font-medium mb-1">Hours: {selectedFoodBank.hours}</p>}
                    
                    {/* Additional details */}
                    <div className="flex flex-wrap gap-1 my-2">
                      {selectedFoodBank.halal && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Halal</span>
                      )}
                      {selectedFoodBank.vegetarian && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Vegetarian</span>
                      )}
                      {selectedFoodBank.wheelchairAccessible && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Accessible</span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedFoodBank.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Directions
                      </a>
                      
                      {selectedFoodBank.phone && (
                        <a
                          href={`tel:${selectedFoodBank.phone}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded flex items-center"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
          
          <div className="border-l border-gray-200 overflow-y-auto h-[600px]">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Food Bank List</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading food banks...</p>
                </div>
              ) : filteredFoodBanks.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No food banks match your search criteria</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredFoodBanks.map((foodBank, index) => (
                    <li 
                      key={foodBank._id || `list-item-${index}`}
                      className={`py-4 cursor-pointer ${selectedFoodBank?._id === foodBank._id ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedFoodBank(foodBank);
                        if (map && foodBank.position) {
                          map.panTo(foodBank.position);
                          map.setZoom(14);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-600">{foodBank.name}</p>
                          <p className="text-xs text-gray-500">{foodBank.address}</p>
                          <p className="text-xs text-gray-500 mt-1">{foodBank.hours}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {foodBank.halal && (
                              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-sm">Halal</span>
                            )}
                            {foodBank.vegetarian && (
                              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-sm">Vegetarian</span>
                            )}
                            {foodBank.wheelchairAccessible && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-sm">Accessible</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}