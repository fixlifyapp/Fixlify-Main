// Address Autocomplete Component using Google Places API
// Provides smart address suggestions with structured data

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { useGeocode, type GeocodeResult } from '@/hooks/useGeocode';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  place_id?: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (address: AddressData) => void;
  onSelect?: (address: AddressData) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showGeocodeButton?: boolean;
  autoGeocode?: boolean;
  country?: string; // Restrict to country (e.g., 'ca' for Canada)
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Start typing an address...',
  disabled = false,
  className,
  showGeocodeButton = false,
  autoGeocode = true,
  country = 'ca',
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { geocode, loading: geocoding } = useGeocode();

  // Initialize Google Places services
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    const initServices = () => {
      if (window.google?.maps?.places) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
        sessionToken.current = new google.maps.places.AutocompleteSessionToken();
      }
    };

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      initServices();
    } else {
      // Wait for Google Maps to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          initServices();
          clearInterval(checkInterval);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions from Google Places API
  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);

      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: country ? { country } : undefined,
          sessionToken: sessionToken.current || undefined,
          types: ['address'],
        },
        (results, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.slice(0, 5));
            setIsOpen(true);
          } else {
            setPredictions([]);
          }
        }
      );
    },
    [country]
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  };

  // Get place details and extract address components
  const getPlaceDetails = (placeId: string): Promise<AddressData> => {
    return new Promise((resolve, reject) => {
      if (!placesService.current) {
        reject(new Error('Places service not initialized'));
        return;
      }

      placesService.current.getDetails(
        {
          placeId,
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          sessionToken: sessionToken.current || undefined,
        },
        (place, status) => {
          // Reset session token after place details request
          sessionToken.current = new google.maps.places.AutocompleteSessionToken();

          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const addressData: AddressData = {
              address: '',
              city: '',
              state: '',
              zip: '',
              country: '',
              formatted_address: place.formatted_address,
              place_id: placeId,
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng(),
            };

            // Parse address components
            if (place.address_components) {
              for (const component of place.address_components) {
                const types = component.types;
                if (types.includes('street_number')) {
                  addressData.address = component.long_name + ' ' + (addressData.address || '');
                } else if (types.includes('route')) {
                  addressData.address = (addressData.address || '') + component.long_name;
                } else if (types.includes('locality')) {
                  addressData.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  addressData.state = component.short_name;
                } else if (types.includes('country')) {
                  addressData.country = component.short_name;
                } else if (types.includes('postal_code')) {
                  addressData.zip = component.long_name;
                }
              }
            }

            addressData.address = addressData.address.trim();
            resolve(addressData);
          } else {
            reject(new Error('Failed to get place details'));
          }
        }
      );
    });
  };

  // Handle prediction selection
  const handleSelectPrediction = async (prediction: Prediction) => {
    setIsLoading(true);
    setIsOpen(false);
    setInputValue(prediction.description);

    try {
      const addressData = await getPlaceDetails(prediction.place_id);
      onChange?.(addressData);
      onSelect?.(addressData);
    } catch (error) {
      console.error('Failed to get place details:', error);
      // Fallback: use the description as address
      const fallbackData: AddressData = {
        address: prediction.structured_formatting.main_text,
        city: '',
        state: '',
        zip: '',
        country: '',
        formatted_address: prediction.description,
        place_id: prediction.place_id,
      };
      onChange?.(fallbackData);
      onSelect?.(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handleSelectPrediction(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Manual geocode button handler
  const handleManualGeocode = async () => {
    if (!inputValue) return;

    const result = await geocode({ address: inputValue });
    if (result) {
      const addressData: AddressData = {
        address: result.address_components.street_number
          ? `${result.address_components.street_number} ${result.address_components.route || ''}`
          : inputValue,
        city: result.address_components.city || '',
        state: result.address_components.state || '',
        zip: result.address_components.postal_code || '',
        country: result.address_components.country || '',
        latitude: result.latitude,
        longitude: result.longitude,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
      };
      onChange?.(addressData);
      onSelect?.(addressData);
    }
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading || geocoding ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : inputValue ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          ) : null}
          {showGeocodeButton && inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleManualGeocode}
              disabled={geocoding}
            >
              <Search className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Predictions dropdown */}
      {isOpen && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
        >
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              type="button"
              className={cn(
                'flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm outline-none transition-colors',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => handleSelectPrediction(prediction)}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">
                  {prediction.structured_formatting.main_text}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {prediction.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
          <div className="mt-1 px-2 py-1 text-xs text-muted-foreground border-t">
            Powered by Google
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressAutocomplete;
