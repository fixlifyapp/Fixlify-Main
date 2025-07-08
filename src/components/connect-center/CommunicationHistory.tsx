import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, MessageSquare, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunicationService } from '@/services/communication-service';
import { Communication, CommunicationType, CommunicationCategory } from '@/types/communications';
import { toast } from 'sonner';

export function CommunicationHistory() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as CommunicationType | 'all',
    category: 'all' as CommunicationCategory | 'all'
  });

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const data = await CommunicationService.getHistory();
      setCommunications(data);
    } catch (error) {
      console.error('Failed to load communications:', error);
      toast.error('Failed to load communication history');
    } finally {
      setLoading(false);
    }
  };
  const getIcon = (type: CommunicationType) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'internal_message':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'read':
        return <Badge variant="default">Read</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = !filters.search || 
      comm.to.toLowerCase().includes(filters.search.toLowerCase()) ||
      comm.content.toLowerCase().includes(filters.search.toLowerCase()) ||
      (comm.subject && comm.subject.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesType = filters.type === 'all' || comm.type === filters.type;
    const matchesCategory = filters.category === 'all' || comm.category === filters.category;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Loading communications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
        <CardDescription>View all your sent communications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search communications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="internal_message">Internal</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value as any }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="estimate">Estimate</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Subject/Content</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommunications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No communications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIcon(comm.type)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{comm.to}</TableCell>
                    <TableCell className="max-w-[400px]">
                      <div>
                        {comm.subject && (
                          <div className="font-medium">{comm.subject}</div>
                        )}
                        <div className="text-sm text-muted-foreground truncate">
                          {comm.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{comm.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(comm.status)}
                        {getStatusBadge(comm.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {comm.sent_at && format(new Date(comm.sent_at), 'MMM d, h:mm a')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}