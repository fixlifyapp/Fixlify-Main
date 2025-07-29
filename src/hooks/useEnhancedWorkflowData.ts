import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface JobStatus {
  id: string;
  name: string;
  color: string;
  sequence: number;
  is_default?: boolean;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  business_type: string;
  business_niche: string;
  timezone?: string;
  business_hours: any;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface WorkflowContextData {
  jobTypes: Array<{ id: string; name: string; color?: string }>;
  jobStatuses: JobStatus[];
  tags: Array<{ id: string; name: string; category?: string; color?: string }>;
  teamMembers: TeamMember[];
  companySettings: CompanySettings | null;
  leadSources: Array<{ id: string; name: string }>;
  paymentMethods: Array<{ id: string; name: string; color?: string }>;
}

export const useEnhancedWorkflowData = () => {
  const [contextData, setContextData] = useState<WorkflowContextData>({
    jobTypes: [],
    jobStatuses: [],
    tags: [],
    teamMembers: [],
    companySettings: null,
    leadSources: [],
    paymentMethods: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchJobStatuses = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('job_statuses')
        .select('*')
        .eq('user_id', user.id)
        .order('sequence');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job statuses:', error);
      return [];
    }
  };

  const fetchJobTypes = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('job_types')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job types:', error);
      return [];
    }
  };

  const fetchTags = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('category, name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  };

  const fetchTeamMembers = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .neq('id', user.id)
        .order('name');

      if (error) throw error;
      return data?.map(member => ({
        ...member,
        is_active: true
      })) || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  };

  const fetchCompanySettings = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching company settings:', error);
      return null;
    }
  };

  const fetchLeadSources = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lead sources:', error);
      return [];
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  };

  const loadAllData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    
    try {
      const [
        jobTypes,
        jobStatuses,
        tags,
        teamMembers,
        companySettings,
        leadSources,
        paymentMethods
      ] = await Promise.all([
        fetchJobTypes(),
        fetchJobStatuses(),
        fetchTags(),
        fetchTeamMembers(),
        fetchCompanySettings(),
        fetchLeadSources(),
        fetchPaymentMethods()
      ]);

      setContextData({
        jobTypes,
        jobStatuses,
        tags,
        teamMembers,
        companySettings,
        leadSources,
        paymentMethods
      });
    } catch (error) {
      console.error('Error loading workflow context data:', error);
      toast.error('Failed to load workflow data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user?.id]);

  // Helper functions for workflow building
  const getJobStatusOptions = () => {
    return contextData.jobStatuses.map(status => ({
      value: status.id,
      label: status.name,
      color: status.color
    }));
  };

  const getJobTypeOptions = () => {
    return contextData.jobTypes.map(type => ({
      value: type.id,
      label: type.name,
      color: type.color
    }));
  };

  const getTeamMemberOptions = () => {
    return contextData.teamMembers
      .filter(member => member.is_active)
      .map(member => ({
        value: member.id,
        label: `${member.name} (${member.role})`,
        email: member.email
      }));
  };

  const getTagOptions = () => {
    return contextData.tags.map(tag => ({
      value: tag.id,
      label: tag.name,
      category: tag.category,
      color: tag.color
    }));
  };

  return {
    contextData,
    isLoading,
    refreshData: loadAllData,
    
    // Helper functions
    getJobStatusOptions,
    getJobTypeOptions,
    getTeamMemberOptions,
    getTagOptions,
    
    // Business context helpers
    getBusinessHours: () => contextData.companySettings?.business_hours || {},
    getTimezone: () => contextData.companySettings?.timezone || 'UTC',
    getBusinessType: () => contextData.companySettings?.business_type || 'General Service',
    getCompanyName: () => contextData.companySettings?.company_name || 'Your Company'
  };
};