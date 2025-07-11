
import { supabase } from "@/integrations/supabase/client";

export const useJobHistoryLogger = () => {
  const logJobHistoryEvent = async (
    jobId: string,
    type: string,
    title: string,
    description: string,
    entityId?: string,
    entityType?: string,
    oldValue?: any,
    newValue?: any
  ) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .single();

      const { error } = await supabase
        .from('job_history')
        .insert({
          job_id: jobId,
          entity_id: entityId,
          entity_type: entityType,
          type,
          title,
          description,
          user_name: profile?.name || 'System',
          old_value: oldValue ? JSON.stringify(oldValue) : null,
          new_value: newValue ? JSON.stringify(newValue) : null
        });

      if (error) {
        console.error('Error logging job history:', error);
      }
    } catch (error) {
      console.error('Error logging job history:', error);
    }
  };

  return { logJobHistoryEvent };
};
