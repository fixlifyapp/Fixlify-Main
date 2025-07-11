import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Phone, 
  Bot, 
  Settings, 
  MapPin, 
  DollarSign, 
  Zap,
  Loader2,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumber } from "@/types/database";
import { toast } from "@/components/ui/sonner";
import { AIDispatcherSettings } from "./AIDispatcherSettings";

export const PhoneNumbersList = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiToggleLoading, setAiToggleLoading] = useState<string | null>(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching phone numbers from telnyx-phone-numbers function...');
      
      // Use the telnyx-phone-numbers function to get all numbers
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Error from telnyx-phone-numbers function:', error);
        throw error;
      }
      
      console.log('Phone numbers received:', data);
      
      // Transform the data to match our PhoneNumber type
      const transformedData = data?.phone_numbers?.map((item: any) => ({
        ...item,
        capabilities: typeof item.capabilities === 'string' 
          ? JSON.parse(item.capabilities) 
          : item.capabilities || { voice: true, sms: true, mms: false },
        ai_dispatcher_enabled: item.ai_dispatcher_enabled || item.configured_for_ai || !!item.configured_at,
        // Handle both user_id and purchased_by fields
        purchased_by: item.user_id || item.purchased_by
      })) || [];
      
      console.log('Transformed phone numbers:', transformedData);
      setPhoneNumbers(transformedData);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error("We couldn't load your phone numbers. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAIDispatcher = async (phoneNumber: PhoneNumber) => {
    setAiToggleLoading(phoneNumber.id);
    try {
      const newStatus = !phoneNumber.ai_dispatcher_enabled;
      
      console.log(`Toggling AI dispatcher for ${phoneNumber.phone_number} to ${newStatus}`);
      
      if (newStatus) {
        // Configure the number for AI
        const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
          body: {
            action: 'configure',
            phone_number: phoneNumber.phone_number
          }
        });

        if (error) throw error;
        console.log('Configure response:', data);
      } else {
        // Call the manage-ai-dispatcher function to disable
        const { error } = await supabase.functions.invoke('manage-ai-dispatcher', {
          body: {
            action: 'disable',
            phoneNumberId: phoneNumber.id
          }
        });

        if (error) throw error;
      }

      // Update local state
      setPhoneNumbers(prev => prev.map(pn => 
        pn.id === phoneNumber.id 
          ? { 
              ...pn, 
              ai_dispatcher_enabled: newStatus, 
              configured_for_ai: newStatus, 
              configured_at: newStatus ? new Date().toISOString() : undefined
            }
          : pn
      ));

      if (newStatus) {
        toast.success(`AI is now handling calls for ${formatPhoneNumber(phoneNumber.phone_number)}`);
      } else {
        toast.success(`AI dispatcher has been disabled for ${formatPhoneNumber(phoneNumber.phone_number)}`);
      }

      // If enabling AI for the first time, open settings dialog
      if (newStatus) {
        setSelectedPhoneNumber({ ...phoneNumber, ai_dispatcher_enabled: newStatus });
        setShowAISettings(true);
      }

    } catch (error) {
      console.error('Error toggling AI dispatcher:', error);
      toast.error("Failed to update AI Dispatcher settings. Please check your connection and try again.");
    } finally {
      setAiToggleLoading(null);
    }
  };

  const openAISettings = (phoneNumber: PhoneNumber) => {
    setSelectedPhoneNumber(phoneNumber);
    setShowAISettings(true);
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (isLoading) {
    return (
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-blue-100 rounded animate-pulse" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-gray-900">Your Phone Numbers</span>
              <span className="ml-2 text-sm font-normal text-blue-600">({phoneNumbers.length})</span>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Manage your purchased phone numbers and enable AI dispatcher for automated call handling</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No phone numbers found</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Your phone numbers should appear here. Try refreshing the page or check the console for errors.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((phoneNumber) => {
                const isConfigured = phoneNumber.ai_dispatcher_enabled || phoneNumber.configured_for_ai || !!phoneNumber.configured_at;
                const isTelnyx = phoneNumber.source === 'telnyx_table' || phoneNumber.phone_number === '+14375249932';
                
                return (
                  <div key={phoneNumber.id || phoneNumber.phone_number} className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full transition-all duration-200 ${
                        isConfigured 
                          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isConfigured ? (
                          <div className="relative">
                            <Bot className="h-6 w-6" />
                            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-blue-400" />
                          </div>
                        ) : (
                          <Phone className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-900 text-lg">
                            {formatPhoneNumber(phoneNumber.phone_number)}
                          </span>
                          {isConfigured ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                              <Bot className="h-3 w-3 mr-1" />
                              AI Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 border-gray-300">
                              Standard
                            </Badge>
                          )}
                          {isTelnyx && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <Zap className="h-3 w-3 mr-1" />
                              Telnyx
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{phoneNumber.locality || 'Toronto'}, {phoneNumber.region || 'ON'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${phoneNumber.monthly_price || phoneNumber.monthly_cost || 1.00}/month</span>
                          </div>
                          {phoneNumber.configured_at && (
                            <span>Configured: {new Date(phoneNumber.configured_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* AI Settings Button */}
                      {isConfigured && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAISettings(phoneNumber)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              AI Settings
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure AI behavior, pricing, and voice settings</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* AI Dispatcher Toggle */}
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-white border">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">AI</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enable AI to automatically handle incoming calls</p>
                          </TooltipContent>
                        </Tooltip>
                        {aiToggleLoading === phoneNumber.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : (
                          <Switch
                            checked={isConfigured}
                            onCheckedChange={() => toggleAIDispatcher(phoneNumber)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Settings Dialog */}
      {selectedPhoneNumber && (
        <AIDispatcherSettings
          open={showAISettings}
          onOpenChange={setShowAISettings}
          phoneNumberId={selectedPhoneNumber.id}
          phoneNumber={formatPhoneNumber(selectedPhoneNumber.phone_number)}
        />
      )}
    </TooltipProvider>
  );
};
