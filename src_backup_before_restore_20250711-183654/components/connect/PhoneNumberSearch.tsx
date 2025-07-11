
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface PhoneNumberSearchProps {
  onSearchResults: (results: any[]) => void;
}

export const PhoneNumberSearch = ({ onSearchResults }: PhoneNumberSearchProps) => {
  const [searchType, setSearchType] = useState<'area-code' | 'city'>('city');
  const [searchValue, setSearchValue] = useState('');
  const [country, setCountry] = useState('CA');
  const [isSearching, setIsSearching] = useState(false);

  const canadianCities = [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 
    'Edmonton', 'Quebec City', 'Winnipeg', 'Hamilton', 'London'
  ];

  const usCities = [
    'San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Houston',
    'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'
  ];

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      const searchParams = {
        action: 'search' as const,
        country,
        ...(searchType === 'area-code' ? { areaCode: searchValue } : { contains: searchValue })
      };

      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: searchParams
      });

      if (error) throw error;

      if (data.success) {
        onSearchResults(data.phone_numbers || []);
        if (data.phone_numbers?.length === 0) {
          toast.info(`No phone numbers found for ${searchValue} in ${country === 'CA' ? 'Canada' : 'United States'}`);
        } else {
          toast.success(`Found ${data.phone_numbers.length} available numbers`);
        }
      } else {
        throw new Error(data.error || 'Failed to search phone numbers');
      }
    } catch (error) {
      console.error('Error searching phone numbers:', error);
      toast.error('Failed to search phone numbers');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Phone Numbers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Search Type</label>
            <Select value={searchType} onValueChange={(value: 'area-code' | 'city') => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City Name
                  </div>
                </SelectItem>
                <SelectItem value="area-code">Area Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {searchType === 'area-code' ? 'Area Code (3 digits)' : 'City Name'}
          </label>
          {searchType === 'city' ? (
            <Select value={searchValue} onValueChange={setSearchValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select a city..." />
              </SelectTrigger>
              <SelectContent>
                {(country === 'CA' ? canadianCities : usCities).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="text"
              placeholder="e.g., 416, 514, 604"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.replace(/\D/g, '').slice(0, 3))}
              maxLength={3}
            />
          )}
        </div>

        <Button 
          onClick={handleSearch}
          disabled={isSearching || !searchValue}
          className="w-full"
        >
          {isSearching ? 'Searching...' : 'Search Available Numbers'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Search by city to find local numbers in that area</p>
          <p>• Search by area code for specific number prefixes</p>
          <p>• Pricing: {country === 'CA' ? 'CAD $2.50' : 'USD $2.00'} setup + $1.00/month</p>
        </div>
      </CardContent>
    </Card>
  );
};
