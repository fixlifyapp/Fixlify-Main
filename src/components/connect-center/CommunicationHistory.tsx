
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Phone, Search, Filter, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunicationLog {
  id: string;
  type: 'email' | 'sms' | 'call';
  recipient: string;
  subject: string | null;
  content: string | null;
  status: string | null;
  provider: string;
  direction: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  external_id: string | null;
  metadata: any;
  client_id: string;
  job_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
  from_address: string | null;
  to_address: string | null;
}

const CommunicationHistory = () => {
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform data to match our interface
      const transformedData = (data || []).map(comm => ({
        ...comm,
        type: comm.type as 'email' | 'sms' | 'call'
      }));

      setCommunications(transformedData);
    } catch (error: any) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'error':
        return 'bg-red-500';
      case 'opened':
        return 'bg-blue-500';
      case 'clicked':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = searchTerm === '' || 
      comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comm.subject && comm.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comm.content && comm.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || comm.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <div className="p-6">Loading communication history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication History</h2>
          <p className="text-muted-foreground">
            Track all your email, SMS, and call communications
          </p>
        </div>
        <Button onClick={fetchCommunications} variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="call">Call</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredCommunications.map((comm) => (
          <Card key={comm.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(comm.type)}
                  <div>
                    <CardTitle className="text-lg">
                      {comm.subject || `${comm.type.toUpperCase()} to ${comm.recipient}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      To: {comm.recipient}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(comm.status)}>
                    {comm.status || 'Unknown'}
                  </Badge>
                  <Badge variant="outline">{comm.provider}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comm.content && (
                  <div className="text-sm">
                    <p className="line-clamp-2">{comm.content}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                  <div>
                    <strong>Sent:</strong> {comm.sent_at ? formatDistanceToNow(new Date(comm.sent_at)) + ' ago' : 'Not sent'}
                  </div>
                  {comm.delivered_at && (
                    <div>
                      <strong>Delivered:</strong> {formatDistanceToNow(new Date(comm.delivered_at))} ago
                    </div>
                  )}
                  {comm.opened_at && (
                    <div>
                      <strong>Opened:</strong> {formatDistanceToNow(new Date(comm.opened_at))} ago
                    </div>
                  )}
                  {comm.clicked_at && (
                    <div>
                      <strong>Clicked:</strong> {formatDistanceToNow(new Date(comm.clicked_at))} ago
                    </div>
                  )}
                </div>

                {comm.error_message && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Error:</strong> {comm.error_message}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comm.created_at))} ago
                  </span>
                  {comm.external_id && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCommunications.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No communications match your filters'
                  : 'No communications found'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunicationHistory;
