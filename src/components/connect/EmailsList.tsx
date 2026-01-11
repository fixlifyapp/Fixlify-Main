import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Star, Loader2, ArrowRight, Bot, Sparkles, Lock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useEmailAI } from "./hooks/useEmailAI";
import { useOrganization } from "@/hooks/use-organization";
import { useAuth } from "@/hooks/use-auth";
import { useRBAC } from "@/components/auth/RBACProvider";

interface Email {
  id: string;
  client_id: string | null;
  email_address: string;
  subject: string;
  body?: string | null;
  status?: string | null;
  is_read?: boolean | null;
  is_starred?: boolean | null;
  thread_id?: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  last_message_preview?: string;
  unread_count?: number;
  is_archived?: boolean;
  user_id?: string;
  organization_id?: string;
  assigned_to?: string;
  clients?: {
    id: string;
    name: string;
  } | null;
}

export const EmailsList = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [replyText, setReplyText] = useState("");
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);

  // Hooks for organization-scoped and RBAC access
  const { organization, loading: orgLoading } = useOrganization();
  const { user } = useAuth();
  const { hasPermission, hasRole } = useRBAC();

  // Determine email access level
  const canViewAllEmails = hasPermission('emails.view.all') || hasRole('admin');
  const canViewAssignedEmails = hasPermission('emails.view.assigned');
  const canSendEmails = hasPermission('emails.send');
  const hasAnyEmailAccess = canViewAllEmails || canViewAssignedEmails;

  const handleUseSuggestion = (content: string) => {
    setReplyText(content);
  };

  const { isAILoading, handleSuggestResponse } = useEmailAI({
    email: selectedEmail ? {
      id: selectedEmail.id,
      subject: selectedEmail.subject || '',
      body: selectedEmail.body || '',
      email_address: selectedEmail.email_address,
      clients: selectedEmail.clients ? { name: selectedEmail.clients.name } : undefined
    } : null,
    onUseSuggestion: handleUseSuggestion
  });

  // Fetch client IDs assigned to current user (for assigned-only access)
  useEffect(() => {
    const fetchAssignedClientIds = async () => {
      if (!user?.id || canViewAllEmails) return;

      try {
        // Get clients from jobs assigned to this user
        const { data: jobs } = await supabase
          .from('jobs')
          .select('client_id')
          .eq('assigned_technician_id', user.id)
          .not('client_id', 'is', null);

        if (jobs) {
          const clientIds = [...new Set(jobs.map(j => j.client_id).filter(Boolean))] as string[];
          setAssignedClientIds(clientIds);
        }
      } catch (error) {
        console.error('Error fetching assigned clients:', error);
      }
    };

    fetchAssignedClientIds();
  }, [user?.id, canViewAllEmails]);

  const fetchEmails = async () => {
    // Wait for organization to load
    if (orgLoading || !organization?.id) {
      return;
    }

    // No access - don't fetch
    if (!hasAnyEmailAccess) {
      setEmails([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Build base query with organization filter
      let query = supabase
        .from('email_conversations')
        .select(`
          *,
          clients:client_id(id, name)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply RBAC filtering
      if (!canViewAllEmails && canViewAssignedEmails && user?.id) {
        // User can only see assigned emails
        // Build OR filter for: assigned_to = user OR client_id in assignedClientIds
        if (assignedClientIds.length > 0) {
          query = query.or(`assigned_to.eq.${user.id},client_id.in.(${assignedClientIds.join(',')})`);
        } else {
          // Only emails directly assigned to user
          query = query.eq('assigned_to', user.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map email conversations to Email interface
      const typedEmails = (data || []).map(email => ({
        ...email,
        body: email.last_message_preview || 'No preview available',
        status: 'active'
      }));

      setEmails(typedEmails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [organization?.id, orgLoading, hasAnyEmailAccess, assignedClientIds]);

  // Set up real-time sync for emails
  useRealtimeSync({
    tables: ['emails'],
    onUpdate: fetchEmails,
    enabled: true
  });

  const handleMarkAsRead = async (email: Email) => {
    if (email.unread_count && email.unread_count > 0) {
      try {
        const { error } = await supabase
          .from('email_conversations')
          .update({ unread_count: 0 })
          .eq('id', email.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error marking email as read:", error);
        toast.error("Failed to mark email as read");
      }
    }
    setSelectedEmail(email);
  };

  const handleStarEmail = async (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    try {
      const { error } = await supabase
        .from('email_conversations')
        .update({ is_starred: !email.is_starred })
        .eq('id', emailId);

      if (error) throw error;
      
      // Update local state optimistically
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, is_starred: !e.is_starred } : e
      ));
    } catch (error) {
      console.error("Error updating email star status:", error);
      toast.error("Failed to update email");
    }
  };

  const handleReplyEmail = (email: Email) => {
    toast.info(`Replying to ${email.clients?.name || "Unknown"}...`);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // No email access - show permission denied
  if (!hasAnyEmailAccess && !isLoading) {
    return (
      <Card className="border-fixlyfy-border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-fixlyfy-text-secondary">
            <Lock className="h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Email Access Restricted</h3>
            <p className="text-center max-w-md text-sm">
              You don't have permission to view emails. Contact your administrator
              to request email access for your role.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-fixlyfy-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Inbox</CardTitle>
            {!canViewAllEmails && canViewAssignedEmails && (
              <Badge variant="outline" className="text-xs">
                Assigned Only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || orgLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-fixlyfy" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-fixlyfy-text-secondary">
              <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">No emails found</p>
              <p className="text-sm mt-1">
                {canViewAllEmails
                  ? "No emails have been received yet."
                  : "No emails are assigned to you."}
              </p>
            </div>
          ) : (
            <div className="h-[500px] overflow-y-auto">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className={`flex items-start p-4 border-b border-fixlyfy-border hover:bg-fixlyfy-bg-hover cursor-pointer ${(email.unread_count || 0) > 0 ? 'bg-fixlyfy-bg-hover' : ''}`}
                  onClick={() => handleMarkAsRead(email)}
                >
                  <div className="mr-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {email.clients?.name ? 
                          email.clients.name.substring(0, 2).toUpperCase() : 
                          email.email_address.substring(0, 2).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${(email.unread_count || 0) > 0 ? 'font-semibold' : ''}`}>
                        {email.clients?.name || email.email_address}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-xs text-fixlyfy-text-secondary mr-2">
                          {new Date(email.created_at).toLocaleDateString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleStarEmail(email.id, e)}
                        >
                          <Star 
                            size={16} 
                            className={email.is_starred ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} 
                          />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{email.subject}</p>
                    <p className="text-sm text-fixlyfy-text-secondary truncate">
                      {email.body ? email.body.substring(0, 60) + '...' : 'No preview available'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-fixlyfy-border">
        <CardContent className="p-6 h-[560px] flex flex-col">
          {selectedEmail ? (
            <>
              <div className="mb-4 pb-4 border-b border-fixlyfy-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleSuggestResponse}
                      disabled={isAILoading}
                      className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      {isAILoading ? (
                        <>
                          <Bot className="h-4 w-4 animate-pulse" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          AI Response
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReplyEmail(selectedEmail)}
                      className="flex items-center gap-1"
                    >
                      Reply <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-fixlyfy-text-secondary">
                  <span className="font-medium text-foreground mr-2">
                    From: {selectedEmail.clients?.name || selectedEmail.email_address}
                  </span> 
                  <span className="mr-2">{`<${selectedEmail.email_address}>`}</span>
                  <Clock size={14} className="mr-1" /> 
                  <span>{formatTimestamp(selectedEmail.created_at)}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.body || 'No email content available.'}
                </p>
              </div>
              {replyText && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AI Suggested Response:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyText("")}
                    >
                      Clear
                    </Button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    rows={4}
                    placeholder="AI suggested response will appear here..."
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={() => handleReplyEmail(selectedEmail)}>
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-fixlyfy-text-secondary">
              <Mail className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Email Selected</h3>
              <p className="text-center max-w-sm">
                Select an email from the inbox to view its contents.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
