import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const PlacesAutocomplete = ({ value, onChange, onSelect, error, isDisabled, reset }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  
  useEffect(() => {
    
    if (typeof value === 'object' && value !== null) {
      setInputValue(value.address || '');
    } else {
      setInputValue(value || '');
    }
  }, [value]);

  
  useEffect(() => {
    if (reset) {
      
      if (typeof value === 'object' && value !== null) {
        setInputValue(value.address || '');
      } else {
        setInputValue(value || '');
      }
      
      setSuggestions([]);
    }
  }, [reset, value]);

  const handleInput = async (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); 

    if (!newValue || typeof window === 'undefined') {
      setSuggestions([]);
      return;
    }

    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    setIsLoading(true);
    
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      
      const addressResults = await new Promise((resolve) => {
        autocompleteService.getPlacePredictions(
          {
            input: newValue,
            componentRestrictions: { country: 'GB' }, 
            types: ['address']
          },
          (results, status) => {
            if (status === 'OK') {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });

      if (addressResults.length === 0 && /\d/.test(newValue)) {
        const postalResults = await new Promise((resolve) => {
          autocompleteService.getPlacePredictions(
            {
              input: newValue,
              componentRestrictions: { country: 'GB' }, 
              types: ['postal_code']
            },
            (results, status) => {
              if (status === 'OK') {
                resolve(results);
              } else {
                resolve([]);
              }
            }
          );
        });
        setSuggestions(postalResults || []);
      } else {
        setSuggestions(addressResults || []);
      }
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (placeId) => {
    if (typeof window === 'undefined' || !window.google) return;

    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    try {
      const place = await new Promise((resolve, reject) => {
        placesService.getDetails(
          { placeId, fields: ['formatted_address', 'geometry'] },
          (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(status);
            }
          }
        );
      });

      
      setInputValue(place.formatted_address);
      
      
      onSelect({
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      });
      
      setSuggestions([]);
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue} 
          onChange={handleInput}
          placeholder="Enter your address or postcode"
          disabled={isDisabled}
          className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 
            focus:ring-[#3B82C4] focus:border-[#1A5276] transition-all duration-300 
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}
            text-[#1F3A52]`}
        />
        <MapPin className={`absolute left-4 top-3.5 h-5 w-5 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
      </div>

      {isLoading && (
        <div className="absolute w-full bg-white mt-1 rounded-xl shadow-lg border border-gray-200 p-2 z-50">
          <div className="animate-pulse flex space-x-4 p-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute w-full bg-white mt-1 rounded-xl shadow-lg border border-gray-200 
          overflow-y-auto z-50" style={{ maxHeight: '300px' }}> 
          <div className="divide-y divide-gray-100"> 
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion.place_id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200
                  text-gray-900 font-medium flex items-start" 
              >
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                <span>{suggestion.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;