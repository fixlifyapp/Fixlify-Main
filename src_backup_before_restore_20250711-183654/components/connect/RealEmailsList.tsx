
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, Star, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Email {
  id: string;
  subject: string;
  body?: string;
  email_address: string;
  direction: "inbound" | "outbound";
  status: string;
  is_read: boolean;
  is_starred: boolean;
  created_at: string;
  client_id?: string;
  client?: {
    name: string;
    email: string;
  };
}

export const RealEmailsList = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
    
    // Set up real-time subscription for new emails
    const channel = supabase
      .channel('emails-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails'
        },
        () => {
          loadEmails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          clients:client_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const transformedEmails = (data || []).map(email => ({
        ...email,
        direction: email.direction as "inbound" | "outbound",
        client: email.clients ? {
          name: email.clients.name,
          email: email.clients.email
        } : undefined
      }));
      
      setEmails(transformedEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);
      
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, is_read: true } : email
      ));
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const toggleStar = async (emailId: string, isStarred: boolean) => {
    try {
      await supabase
        .from('emails')
        .update({ is_starred: !isStarred })
        .eq('id', emailId);
      
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, is_starred: !isStarred } : email
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
          <p className="text-gray-500">
            Email communications will appear here when available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Emails ({emails.length})</h3>
      </div>
      
      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
              !email.is_read ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => !email.is_read && markAsRead(email.id)}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className={`p-2 rounded-full ${
                email.direction === 'inbound' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {email.is_read ? (
                  <MailOpen className={`h-4 w-4 ${
                    email.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                ) : (
                  <Mail className={`h-4 w-4 ${
                    email.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${!email.is_read ? 'font-bold' : ''}`}>
                    {email.client?.name || email.email_address}
                  </span>
                  <Badge variant={email.direction === 'inbound' ? 'default' : 'secondary'}>
                    {email.direction === 'inbound' ? 'Received' : 'Sent'}
                  </Badge>
                  <Badge variant={email.status === 'delivered' ? 'success' : 'secondary'}>
                    {email.status}
                  </Badge>
                </div>
                <div className={`text-sm truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                  {email.subject}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>{email.email_address}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(email.created_at).toLocaleString()}
                  </span>
                </div>
                {email.body && (
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {email.body.length > 100 ? email.body.substring(0, 100) + "..." : email.body}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(email.id, email.is_starred);
                }}
              >
                <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
