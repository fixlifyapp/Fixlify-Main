import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'notification';
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  description?: string;
  marketing_formula?: string;
  use_count?: number;
  last_used_at?: string;
}

export const useMessageTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['message-templates', category],
    queryFn: async () => {
      let query = supabase
        .from('automation_message_templates')
        .select('*')
        .order('use_count', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as MessageTemplate[];
    },
  });
};

export const useUpdateTemplateUsage = () => {
  const updateUsage = async (templateId: string) => {
    const { error } = await supabase
      .from('automation_message_templates')
      .update({ 
        use_count: supabase.sql`use_count + 1`,
        last_used_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) throw error;
  };

  return { updateUsage };
};
