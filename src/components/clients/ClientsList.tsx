
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, Phone, Mail } from "lucide-react";
import { ClientContactActions } from "./ClientContactActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  total_jobs?: number;
  created_at: string;
}

export const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
          *,
          jobs(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClients: Client[] = clientsData?.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status || 'active',
        total_jobs: client.jobs?.length || 0,
        created_at: client.created_at
      })) || [];

      setClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.phone && client.phone.includes(searchQuery)) ||
        (client.address && client.address.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredClients(filtered);
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleNewClient = () => {
    navigate('/clients/new');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clients ({filteredClients.length})
            </CardTitle>
            <Button onClick={handleNewClient} className="gap-2">
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients by name, email, phone, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No clients found matching your search' : 'No clients yet'}
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 
                          className="font-medium cursor-pointer hover:text-blue-600"
                          onClick={() => handleClientClick(client.id)}
                        >
                          {client.name}
                        </h3>
                        <Badge 
                          variant={client.status === 'active' ? 'default' : 'secondary'}
                        >
                          {client.status}
                        </Badge>
                        {client.total_jobs > 0 && (
                          <Badge variant="outline">
                            {client.total_jobs} jobs
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {client.phone}
                          </div>
                        )}
                        {client.address && (
                          <div className="text-gray-500">
                            📍 {client.address}
                          </div>
                        )}
                        <div className="text-gray-400">
                          Created: {new Date(client.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClientClick(client.id)}
                      >
                        View Details
                      </Button>
                      <ClientContactActions 
                        client={client} 
                        variant="compact"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
