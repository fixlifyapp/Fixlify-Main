
import React from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Settings } from "lucide-react";
import { JobCustomFieldsDisplay } from "../JobCustomFieldsDisplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConditionalCustomFieldsCardProps {
  jobId: string;
}

export const ConditionalCustomFieldsCard = ({ jobId }: ConditionalCustomFieldsCardProps) => {
  const { data: customFields, isLoading } = useQuery({
    queryKey: ['custom-fields', 'job'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('entity_type', 'job');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-3">
          <div className="text-xl font-bold text-gray-900">
            Custom Fields
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  if (!customFields || customFields.length === 0) {
    return null; // Don't render anything if no custom fields
  }

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-3">
        <div className="text-xl font-bold text-gray-900">
          Custom Fields
        </div>
      </ModernCardHeader>
      <ModernCardContent className="pt-0">
        <JobCustomFieldsDisplay jobId={jobId} />
      </ModernCardContent>
    </ModernCard>
  );
};
