import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, User, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CallButton } from './CallButton';

interface Call {
  id: string;
  call_control_id: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  status: string;
  created_at: string;
  answered_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);

  useEffect(() => {
    loadCalls();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [calls, searchTerm]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      
      const { data: callsData, error: callsError } = await supabase
        .from('telnyx_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (callsError) throw callsError;

      // Load client data for each call
      const callsWithClients = await Promise.all(
        (callsData || []).map(async (call) => {
          const phoneToSearch = call.direction === 'inbound' ? call.from_number : call.to_number;
          const client = await findClientByPhone(phoneToSearch);
          return { ...call, client };
        })
      );

      setCalls(callsWithClients);
    } catch (error) {
      console.error('Error loading calls:', error);
      toast.error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const findClientByPhone = async (phoneNumber: string) => {
    if (!phoneNumber) return null;
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`);
      
      if (error) {
        console.error('Error searching for client:', error);
        return null;
      }
      
      return clients && clients.length > 0 ? clients[0] : null;
    } catch (error) {
      console.error('Error finding client by phone:', error);
      return null;
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('call-history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telnyx_calls'
        },
        () => {
          // Reload calls when any change occurs
          loadCalls();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const filterCalls = () => {
    if (!searchTerm) {
      setFilteredCalls(calls);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = calls.filter(call => {
      return (
        call.from_number.includes(search) ||
        call.to_number.includes(search) ||
        call.client?.name.toLowerCase().includes(search) ||
        call.status.toLowerCase().includes(search)
      );
    });

    setFilteredCalls(filtered);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'Unknown';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: Call) => {
    if (call.direction === 'inbound') {
      if (call.status === 'missed' || call.status === 'no-answer') {
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      }
      return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    }
    return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      'completed': { variant: 'default', label: 'Completed' },
      'answered': { variant: 'default', label: 'Answered' },
      'missed': { variant: 'destructive', label: 'Missed' },
      'no-answer': { variant: 'destructive', label: 'No Answer' },
      'busy': { variant: 'secondary', label: 'Busy' },
      'failed': { variant: 'destructive', label: 'Failed' },
      'initiated': { variant: 'secondary', label: 'Initiated' },
      'ringing': { variant: 'secondary', label: 'Ringing' },
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading call history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCalls}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by phone number, name, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No calls found matching your search' : 'No calls yet'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => {
              const phoneNumber = call.direction === 'inbound' ? call.from_number : call.to_number;
              const displayName = call.client?.name || formatPhoneNumber(phoneNumber);
              
              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getCallIcon(call)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{displayName}</span>
                        {call.client && (
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Client
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPhoneNumber(phoneNumber)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>{format(new Date(call.created_at), 'MMM d, h:mm a')}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration_seconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(call.status)}
                    <CallButton
                      phoneNumber={phoneNumber}
                      clientId={call.client?.id}
                      clientName={call.client?.name}
                      size="icon"
                      showText={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 