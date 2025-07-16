import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useClientData = (clientId?: string) => {
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    status: "active",
  });
  const [showInsights, setShowInsights] = useState(true);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState("Analyzing client history and data...");

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          console.log("Fetched client data:", data);
          setClient(data);
          // Populate form data
          const nameParts = data.name ? data.name.split(' ') : ['', ''];
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            company: data.company || '',
            email: data.email || '',
            phone: data.phone || '',
            street: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            status: data.status || 'active',
          });
          generateClientInsight(data);
        } else {
          toast.error("The requested client could not be found.");
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast.error("Failed to load client data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClient();
  }, [clientId]);

  const generateClientInsight = async (client: any) => {
    if (!client) return;
    
    setIsGeneratingInsight(true);
    
    try {
      // Generate a personalized insight based on client data
      setTimeout(() => {
        let insight = "This client hasn't had any activity yet. Consider scheduling an introduction call.";
        
        if (client.type === "commercial") {
          insight = "This commercial client has been with you since " + 
            new Date(client.created_at).toLocaleDateString() + 
            ". Consider offering an annual maintenance package.";
        } else if (client.type === "residential") {
          insight = "This residential client may be interested in seasonal maintenance services based on their profile.";
        }
        
        setAiInsight(insight);
        setIsGeneratingInsight(false);
      }, 1000);
    } catch (error) {
      setAiInsight("Unable to generate client insight at this time.");
      setIsGeneratingInsight(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    if (!clientId) return;
    
    setIsSaving(true);
    
    try {
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const updates = {
        name: fullName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        status: formData.status,
        // Convert Date to ISO string for Supabase
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);
        
      if (error) throw error;
      
      // Update local client state
      setClient(prev => ({ ...prev, ...updates }));
      
      toast.success("Client information has been updated successfully.");
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    client,
    isLoading,
    isSaving,
    formData,
    showInsights,
    isGeneratingInsight,
    aiInsight,
    handleInputChange,
    saveChanges,
    setShowInsights,
  };
};
