
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Technician {
  id: string;
  name: string;
  role: string;
  status: string;
}

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTechnicians = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, status')
        .eq('role', 'technician')
        .eq('status', 'active');

      if (error) throw error;

      const formattedTechnicians = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown Name',
        role: profile.role || 'technician',
        status: profile.status || 'active'
      }));

      setTechnicians(formattedTechnicians);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Failed to load technicians');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  return {
    technicians,
    isLoading,
    refetch: fetchTechnicians
  };
};
