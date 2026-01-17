import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Technician {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export function useTechnicians() {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnicians = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Include all team members who can be assigned to jobs
      // (technicians, managers, and admins)
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, email, role, avatar_url')
        .in('role', ['technician', 'manager', 'admin']);

      if (fetchError) throw fetchError;

      const techList: Technician[] = (profiles || []).map(p => ({
        id: p.id,
        name: p.name || p.email?.split('@')[0] || 'Technician',
        email: p.email || '',
        role: p.role || 'technician',
        avatar_url: p.avatar_url || undefined
      }));

      setTechnicians(techList);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError(err instanceof Error ? err.message : 'Failed to load technicians');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  return {
    technicians,
    isLoading,
    error,
    refetch: fetchTechnicians
  };
}
