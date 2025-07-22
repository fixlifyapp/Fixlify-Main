import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Client } from "@/utils/test-data/types";

interface ClientsListProps {
  onClientSelect: (client: Client) => void;
}

export function ClientsList({ onClientSelect }: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Clients</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
        <Input
          type="search"
          placeholder="Search clients..."
          className="mt-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-4 text-center">No clients found.</div>
        ) : (
          <div className="divide-y divide-fixlyfy-border">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                className="w-full text-left p-4 hover:bg-muted transition-colors flex items-start gap-4"
                onClick={() => onClientSelect(client)}
              >
                <div>
                  <h4 className="font-medium">{client.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {client.phone && (
                      <Badge variant="secondary" className="gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </Badge>
                    )}
                    {client.email && (
                      <Badge variant="secondary" className="gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </Badge>
                    )}
                  </div>
                  {client.address && (
                    <Badge variant="secondary" className="gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {client.address}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
