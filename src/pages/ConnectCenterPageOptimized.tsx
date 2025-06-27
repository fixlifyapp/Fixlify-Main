import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DispatcherMessagesView } from "@/components/connect/DispatcherMessagesView";
import { EmailManagement } from "@/components/connect/EmailManagement";
import { CallMonitoring } from "@/components/connect/CallMonitoring";
import { EmailComposer } from "@/components/connect/EmailComposer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageSquare, Phone, Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { useMessageContext } from "@/contexts/MessageContext";
import { useConnectCenterData } from "@/components/connect/hooks/useConnectCenterData";
import { toast } from "sonner";
import { TelnyxCallsView } from "@/components/telnyx/TelnyxCallsView";

const ConnectCenterPageOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openMessageDialog } = useMessageContext();
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");

  const { unreadCounts, ownedNumbers, isLoading, refreshData } = useConnectCenterData();

  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const clientEmail = searchParams.get("clientEmail");
  const tabParam = searchParams.get("tab") || "messages";
  const autoOpen = searchParams.get("autoOpen") === "true";
  
  useEffect(() => {
    if (tabParam && ["messages", "calls", "emails"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  useEffect(() => {
    const handleClientActions = async () => {
      if (!clientId || !clientName) return;

      console.log('Connect Center: Handling client actions', {
        clientId,
        clientName,
        clientPhone,
        clientEmail,
        activeTab,
        autoOpen
      });

      // Auto-trigger actions based on the active tab and autoOpen parameter
      if (activeTab === "messages" && clientPhone && autoOpen) {
        console.log('Connect Center: Auto-opening message dialog for client:', clientName);
        try {
          await openMessageDialog({
            id: clientId,
            name: clientName,
            phone: clientPhone || '',
            email: clientEmail || ''
          });
          
          // Clear the autoOpen parameter from URL to prevent re-triggering
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.delete("autoOpen");
          const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
          navigate(newUrl, { replace: true });
          
        } catch (error) {
          console.error('Connect Center: Error opening message dialog:', error);
          toast.error('Failed to open message dialog');
        }
      } else if (activeTab === "calls" && clientPhone) {
        // Open dialer with client info
        toast.info('Phone dialer feature coming soon!');
      } else if (activeTab === "emails" && clientEmail && autoOpen) {
        // Email tab auto-open is handled by EmailManagement component
        console.log('Connect Center: Email auto-open will be handled by EmailManagement component');
      }
    };

    // Only trigger if we have the required parameters and the tab is set
    if (clientId && clientName && activeTab && autoOpen) {
      // Add a small delay to ensure components are mounted
      const timer = setTimeout(handleClientActions, 500);
      return () => clearTimeout(timer);
    }
  }, [clientId, clientName, clientPhone, clientEmail, activeTab, autoOpen, openMessageDialog, navigate, location]);

  const handleNewCommunication = () => {
    switch (activeTab) {
      case "messages":
        openMessageDialog({ 
          id: "new-client", 
          name: "New Client", 
          phone: "" 
        });
        break;
      case "calls":
        toast.info('Phone dialer feature coming soon!');
        break;
      case "emails":
        // Email new conversation is handled by EmailManagement component
        toast.info("Use the 'New' button in the email conversations list");
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "messages": return "New Message";
      case "calls": return "New Call";
      case "emails": return "New Email";
      default: return "New Action";
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Connect Center"
        subtitle={clientName ? `Communication with ${clientName}` : "Unified communication hub for messages, calls, and emails"}
        icon={MessageSquare}
        badges={[
          { text: "Messages", icon: MessageSquare, variant: "fixlyfy" as const },
          { text: "Calls", icon: Phone, variant: "success" as const },
          { text: "Emails", icon: Mail, variant: "info" as const }
        ]}
        actionButton={{
          text: getActionButtonText(),
          icon: Plus,
          onClick: handleNewCommunication
        }}
      />
      
      {isLoading ? (
        <LoadingSkeleton type="connect-tabs" />
      ) : (
        <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Messages</span>
              {unreadCounts.messages > 0 && (
                <Badge className="ml-1 bg-fixlyfy">{unreadCounts.messages}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone size={16} />
              <span className="hidden sm:inline">Calls</span>
              {unreadCounts.calls > 0 && (
                <Badge className="ml-1 bg-fixlyfy">{unreadCounts.calls}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail size={16} />
              <span className="hidden sm:inline">Emails</span>
              {unreadCounts.emails > 0 && (
                <Badge className="ml-1 bg-fixlyfy">{unreadCounts.emails}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="mt-0">
            <DispatcherMessagesView searchResults={[]} />
          </TabsContent>
          
          <TabsContent value="calls" className="mt-0">
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Phone dialer and call history features are coming soon.
                </p>
                <Button 
                  onClick={() => toast.info('Phone dialer feature coming soon!')}
                  className="gap-2"
                  disabled
                >
                  <Phone className="h-4 w-4" />
                  Dialer Coming Soon
                </Button>
              </div>
              <TelnyxCallsView />
            </div>
          </TabsContent>
          
          <TabsContent value="emails" className="mt-0">
            <EmailManagement />
          </TabsContent>
        </Tabs>
      )}

      {/* Email Composer Dialog */}
      <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
        <DialogContent className="max-w-3xl">
          <EmailComposer 
            recipient={clientId && clientName && clientEmail ? {
              id: clientId,
              name: clientName,
              email: clientEmail
            } : undefined}
            onClose={() => setShowEmailComposer(false)}
            onSent={() => {
              refreshData();
              setShowEmailComposer(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ConnectCenterPageOptimized;
