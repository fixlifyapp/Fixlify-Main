import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface JobType {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_default?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
}

export interface Technician {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export const useUnifiedJobData = () => {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchJobTypes = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('job_types')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setJobTypes(data || []);
    } catch (error) {
      console.error('Error fetching job types:', error);
      toast.error('Failed to load job types');
    }
  };

  const fetchTags = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('category, name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    }
  };

  const fetchTechnicians = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('role', 'technician')
        .order('name');

      if (error) throw error;
      setTechnicians(data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Failed to load technicians');
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchJobTypes(),
      fetchTags(),
      fetchTechnicians()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id]);

  return {
    jobTypes,
    tags,
    technicians,
    isLoading,
    refreshData,
    fetchJobTypes,
    fetchTags,
    fetchTechnicians
  };
};