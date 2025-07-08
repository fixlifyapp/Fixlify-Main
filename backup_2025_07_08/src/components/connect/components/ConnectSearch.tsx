
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

interface SearchResult {
  type: string;
  id: string;
  name: string;
  phone?: string;
  email?: string;
  sourceId: string;
  jobTitle?: string;
  status?: string;
}

interface ConnectSearchProps {
  onSearchResults: (results: SearchResult[]) => void;
  onClientSelect?: (client: { id: string; name: string; phone?: string; email?: string }) => void;
}

export const ConnectSearch = ({ onSearchResults, onClientSelect }: ConnectSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // Use debounced search term to avoid too many queries
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Effect to perform search when debounced term changes
  useEffect(() => {
    if (!debouncedSearchTerm) {
      // If search is cleared, reset results
      setResults([]);
      setShowResults(false);
      onSearchResults([]);
      return;
    }
    
    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Search in clients table for name or phone
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, name, phone, email')
          .or(`name.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
          
        if (clientError) throw clientError;
        
        // Search in conversations by client information
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            client_id,
            clients:client_id(id, name, phone, email)
          `)
          .order('last_message_at', { ascending: false });
        
        if (convError) throw convError;

        // Also search in jobs by id or title
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id, 
            title,
            client_id,
            clients:client_id(id, name, phone, email)
          `)
          .or(`id.ilike.%${debouncedSearchTerm}%,title.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
        
        if (jobError) throw jobError;

        // Search phone numbers in database by area code or partial number
        const { data: phoneData, error: phoneError } = await supabase
          .from('phone_numbers')
          .select('*')
          .or(`phone_number.ilike.%${debouncedSearchTerm}%,region.ilike.%${debouncedSearchTerm}%,locality.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
        
        if (phoneError) throw phoneError;
        
        // Combine and deduplicate results
        const clientResults = clientData.map(client => ({
          type: 'client',
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          sourceId: client.id
        }));
        
        const conversationResults = conversationData
          .filter(conv => 
            conv.clients?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
            (conv.clients?.phone && conv.clients.phone.includes(debouncedSearchTerm))
          )
          .map(conv => ({
            type: 'conversation',
            id: conv.clients?.id,
            name: conv.clients?.name || 'Unknown Client',
            phone: conv.clients?.phone,
            email: conv.clients?.email,
            sourceId: conv.id
          }));
        
        const jobResults = jobData.map(job => ({
          type: 'job',
          id: job.clients?.id,
          name: job.clients?.name || 'Unknown Client',
          phone: job.clients?.phone,
          email: job.clients?.email,
          sourceId: job.id,
          jobTitle: job.title
        }));

        const phoneResults = phoneData.map(phone => ({
          type: 'phone_number',
          id: phone.id,
          name: `${phone.phone_number} (${phone.locality}, ${phone.region})`,
          phone: phone.phone_number,
          sourceId: phone.id,
          status: phone.status
        }));

        // Combine all results
        const allResults = [...clientResults, ...conversationResults, ...jobResults, ...phoneResults];
        
        // Deduplicate by client id (except for phone numbers which have their own results)
        const uniqueResults = allResults.reduce((acc: SearchResult[], current) => {
          if (current.type === 'phone_number') {
            return acc.concat([current]);
          }
          
          const x = acc.find(item => item.id === current.id && item.type !== 'phone_number');
          if (!x) {
            return acc.concat([current]);
          } else {
            // If we already have this client, but this is a conversation result, prioritize it
            if (current.type === 'conversation' && x.type !== 'conversation') {
              // Replace the existing entry with this one
              return acc.map(item => item.id === current.id ? current : item);
            }
            return acc;
          }
        }, []);
        
        setResults(uniqueResults);
        setShowResults(uniqueResults.length > 0);
        onSearchResults(uniqueResults);
      } catch (error) {
        console.error("Error performing search:", error);
        toast.error("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    };
    
    performSearch();
  }, [debouncedSearchTerm, onSearchResults]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type !== 'phone_number' && onClientSelect) {
      onClientSelect({
        id: result.id,
        name: result.name,
        phone: result.phone,
        email: result.email
      });
    }
    setSearchTerm(result.name);
    setShowResults(false);
  };
  
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-secondary" size={18} />
      <Input 
        placeholder="Search clients, phone numbers, or area codes..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(results.length > 0)}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-fixlyfy border-r-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.sourceId}-${index}`}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{result.name}</div>
                  {result.phone && (
                    <div className="text-sm text-gray-500">{result.phone}</div>
                  )}
                  {result.jobTitle && (
                    <div className="text-sm text-blue-600">Job: {result.jobTitle}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {result.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
