import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Send, Trash2, Archive, Reply, Forward, Paperclip, Search, Filter, RefreshCw, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { EmailInputPanel } from "./EmailInputPanel";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isArchived: boolean;
  // Database compatibility fields
  client_id?: string;
  created_at?: string;
  updated_at?: string;
  direction?: string;
  email_address?: string;
  is_read?: boolean;
  is_starred?: boolean;
  status?: string;
  thread_id?: string;
}

export function SimpleEmailInterface() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    // Fetch emails from Supabase (replace with your actual data fetching logic)
    const fetchEmails = async () => {
      try {
        // Example query (adjust to your table and columns)
        const { data, error } = await supabase
          .from('email_conversations' as any)
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching emails:", error);
          toast.error("Failed to load emails");
        } else {
          // Transform database format to component format
          const transformedEmails = (data || []).map((email: any) => ({
            id: email.id,
            from: email.email_address || email.from || '',
            to: email.email_address || email.to || '',
            subject: email.subject || '',
            body: email.body || '',
            timestamp: email.created_at || '',
            isRead: email.is_read || false,
            isArchived: email.status === 'archived' || false,
            ...email // Keep all original fields for database operations
          }));
          setEmails(transformedEmails);
        }
      } catch (error) {
        console.error("Unexpected error fetching emails:", error);
        toast.error("Failed to load emails");
      }
    };

    if (user) {
      fetchEmails();
    }
  }, [user]);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompose = () => {
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const handleEmailSend = async (newEmail: Omit<Email, 'id' | 'timestamp' | 'isRead' | 'isArchived'>) => {
    try {
      // Example insert (adjust to your table and columns)
      const { data, error } = await supabase
        .from('emails')
        .insert({
          email_address: newEmail.to,
          subject: newEmail.subject,
          body: newEmail.body,
          direction: 'outbound',
          status: 'sent',
          created_at: new Date().toISOString(),
          is_read: false
        })
        .select('*')
        .single();

      if (error) {
        console.error("Error sending email:", error);
        toast.error("Failed to send email");
      } else {
        const transformedEmail = {
          id: data.id,
          from: data.email_address,
          to: data.email_address,
          subject: data.subject,
          body: data.body,
          timestamp: data.created_at,
          isRead: data.is_read,
          isArchived: data.status === 'archived',
          ...data
        };
        setEmails([transformedEmail, ...emails]);
        setIsComposing(false);
        toast.success("Email sent successfully!");
      }
    } catch (error) {
      console.error("Unexpected error sending email:", error);
      toast.error("Failed to send email");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">Email Interface</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleCompose}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
          <Input
            type="search"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex">
        <div className="w-64 border-r pr-4">
          <ScrollArea className="h-full">
            {filteredEmails.map(email => (
              <div
                key={email.id}
                className={`p-2 rounded-md cursor-pointer hover:bg-secondary ${selectedEmail?.id === email.id ? 'bg-secondary' : ''}`}
                onClick={() => handleEmailSelect(email)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{email.subject}</span>
                  {!email.isRead && <Badge variant="secondary">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{email.body}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(email.timestamp), "MMM dd, yyyy")}</p>
              </div>
            ))}
          </ScrollArea>
        </div>
        <Separator orientation="vertical" className="mx-2" />
        <div className="flex-grow p-4">
          {isComposing ? (
            <EmailInputPanel onSend={(message: string) => {}} onCancel={() => setIsComposing(false)} />
          ) : selectedEmail ? (
            <div>
              <h3 className="text-lg font-medium">{selectedEmail.subject}</h3>
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <span>From: {selectedEmail.from}</span>
                <span>To: {selectedEmail.to}</span>
                <span>{format(new Date(selectedEmail.timestamp), "MMM dd, yyyy hh:mm a")}</span>
              </div>
              <Separator className="my-2" />
              <p>{selectedEmail.body}</p>
            </div>
          ) : (
            <div className="text-muted-foreground text-center">
              Select an email to view or compose a new one.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
