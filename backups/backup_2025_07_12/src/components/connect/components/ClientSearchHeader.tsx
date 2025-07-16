
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ClientSearchHeaderProps {
  onClientSelect: (client: SearchResult) => void;
}

export const ClientSearchHeader = ({ onClientSelect }: ClientSearchHeaderProps) => {
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const searchClients = async () => {
      if (!clientSearchTerm.trim()) {
        setClientSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('id, name, phone, email')
          .or(`name.ilike.%${clientSearchTerm}%,phone.ilike.%${clientSearchTerm}%`)
          .limit(10);

        if (error) throw error;

        const results = clientData?.map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email
        })) || [];

        setClientSearchResults(results);
        setShowSearchResults(results.length > 0);
      } catch (error) {
        console.error('Error searching clients:', error);
        toast.error("Failed to search clients");
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [clientSearchTerm]);

  const handleClientSelect = (client: SearchResult) => {
    onClientSelect(client);
    setClientSearchTerm("");
    setShowSearchResults(false);
    toast.success(`Opening conversation with ${client.name}`);
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search clients to start messaging (e.g., TESTCLIENT2)..."
          value={clientSearchTerm}
          onChange={(e) => setClientSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
        {clientSearchTerm && (
          <button
            onClick={() => {
              setClientSearchTerm("");
              setShowSearchResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {showSearchResults && (
        <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {clientSearchResults.map((client) => (
            <div
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{client.name}</div>
                  {client.phone && (
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  )}
                  {client.email && (
                    <div className="text-sm text-gray-500">{client.email}</div>
                  )}
                </div>
                <Plus className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
