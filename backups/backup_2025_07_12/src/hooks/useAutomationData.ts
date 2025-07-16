import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';

export const useAutomationData = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();

  // Fetch job types from service_types table
  const { data: jobTypes = [], isLoading: loadingJobTypes } = useQuery({
    queryKey: ['job-types', user?.id, organization?.id],
    queryFn: async () => {
      console.log('Fetching job types for user:', user?.id, 'org:', organization?.id);
      
      // First try with organization_id if available
      if (organization?.id) {
        const { data: orgData, error: orgError } = await supabase
          .from('service_types')
          .select('id, name')
          .eq('organization_id', organization.id)
          .eq('is_active', true)
          .order('name');
        
        if (!orgError && orgData?.length > 0) {
          console.log('Found org service types:', orgData);
          return orgData.map(t => t.name);
        }
      }
      
      // Fallback to user_id
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching job types:', error);
        return ['Installation', 'Repair', 'Maintenance', 'Inspection', 'Emergency', 'Consultation'];
      }
      
      console.log('Found user service types:', data);
      return data?.map(t => t.name) || ['Installation', 'Repair', 'Maintenance', 'Inspection', 'Emergency', 'Consultation'];
    },
    enabled: !!user?.id,
  });

  // Fetch job statuses
  const { data: jobStatuses = [], isLoading: loadingJobStatuses } = useQuery({
    queryKey: ['job-statuses', user?.id],
    queryFn: async () => {
      console.log('Fetching job statuses for user:', user?.id);
      const { data, error } = await supabase
        .from('job_statuses')
        .select('id, name, color')
        .eq('user_id', user?.id)
        .order('sequence');
      
      if (error) {
        console.error('Error fetching job statuses:', error);
        return ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
      }
      
      console.log('Found job statuses:', data);
      return data?.map(s => s.name) || ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
    },
    enabled: !!user?.id,
  });

  // Fetch client tags
  const { data: clientTags = [], isLoading: loadingClientTags } = useQuery({
    queryKey: ['client-tags', user?.id],
    queryFn: async () => {
      console.log('Fetching client tags for user:', user?.id);
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, category')
        .eq('user_id', user?.id)
        .or('category.eq.client,category.eq.Client,category.eq.CLIENT')
        .order('name');
      
      if (error) {
        console.error('Error fetching client tags:', error);
        return [];
      }
      
      console.log('Found client tags:', data);
      return data?.map(t => t.name) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch job tags - including Service, Type, Priority categories
  const { data: jobTags = [], isLoading: loadingJobTags } = useQuery({
    queryKey: ['job-tags', user?.id],
    queryFn: async () => {
      console.log('Fetching job tags for user:', user?.id);
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, category')
        .eq('user_id', user?.id)
        .in('category', ['job', 'Job', 'JOB', 'Service', 'Type', 'Priority'])
        .order('name');
      
      if (error) {
        console.error('Error fetching job tags:', error);
        return [];
      }
      
      console.log('Found job tags:', data);
      return data?.map(t => t.name) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch all tags if job/client specific queries return empty
  const { data: allTags = [] } = useQuery({
    queryKey: ['all-tags', user?.id],
    queryFn: async () => {
      console.log('Fetching all tags for user:', user?.id);
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, category')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) {
        console.error('Error fetching all tags:', error);
        return [];
      }
      
      console.log('Found all tags:', data);
      return data || [];
    },
    enabled: !!user?.id && (jobTags.length === 0 || clientTags.length === 0),
  });

  // Fetch team members
  const { data: teamMembers = [], isLoading: loadingTeamMembers } = useQuery({
    queryKey: ['team-members', user?.id, organization?.id],
    queryFn: async () => {
      console.log('Fetching team members for user:', user?.id, 'org:', organization?.id);
      
      // Try organization first
      if (organization?.id) {
        const { data: orgData, error: orgError } = await supabase
          .from('team_members')
          .select('id, name')
          .eq('organization_id', organization.id)
          .eq('status', 'active')
          .order('name');
        
        if (!orgError && orgData?.length > 0) {
          console.log('Found org team members:', orgData);
          return orgData.map(m => m.name);
        }
      }
      
      // Fallback to user_id
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) {
        console.error('Error fetching team members:', error);
        return ['Unassigned'];
      }
      
      console.log('Found user team members:', data);
      return data?.map(m => m.name) || ['Unassigned'];
    },
    enabled: !!user?.id,
  });

  // Fetch service areas
  const { data: serviceAreas = [], isLoading: loadingServiceAreas } = useQuery({
    queryKey: ['service-areas', user?.id, organization?.id],
    queryFn: async () => {
      console.log('Fetching service areas for user:', user?.id, 'org:', organization?.id);
      
      let query = supabase.from('service_areas').select('id, name');
      
      if (organization?.id) {
        query = query.or(`user_id.eq.${user?.id},organization_id.eq.${organization?.id}`);
      } else {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('Error fetching service areas:', error);
        return ['North', 'South', 'East', 'West', 'Downtown'];
      }
      
      console.log('Found service areas:', data);
      return data?.map(a => a.name) || ['North', 'South', 'East', 'West', 'Downtown'];
    },
    enabled: !!user?.id,
  });

  // Fetch lead sources
  const { data: leadSources = [], isLoading: loadingLeadSources } = useQuery({
    queryKey: ['lead-sources', user?.id, organization?.id],
    queryFn: async () => {
      console.log('Fetching lead sources for user:', user?.id, 'org:', organization?.id);
      
      let query = supabase.from('lead_sources').select('id, name');
      
      if (organization?.id) {
        query = query.or(`user_id.eq.${user?.id},organization_id.eq.${organization?.id}`);
      } else {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('Error fetching lead sources:', error);
        return ['Google', 'Facebook', 'Website', 'Referral', 'Yelp'];
      }
      
      console.log('Found lead sources:', data);
      return data?.map(s => s.name) || ['Google', 'Facebook', 'Website', 'Referral', 'Yelp'];
    },
    enabled: !!user?.id,
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ['payment-methods', user?.id, organization?.id],
    queryFn: async () => {
      console.log('Fetching payment methods for user:', user?.id, 'org:', organization?.id);
      
      let query = supabase.from('payment_methods').select('id, name').eq('is_active', true);
      
      if (organization?.id) {
        query = query.or(`user_id.eq.${user?.id},organization_id.eq.${organization?.id}`);
      } else {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('Error fetching payment methods:', error);
        return ['Cash', 'Credit Card', 'Check', 'ACH'];
      }
      
      console.log('Found payment methods:', data);
      return data?.map(m => m.name) || ['Cash', 'Credit Card', 'Check', 'ACH'];
    },
    enabled: !!user?.id,
  });

  // Fetch service tags (for job types)
  const { data: serviceTags = [] } = useQuery({
    queryKey: ['service-tags', user?.id],
    queryFn: async () => {
      console.log('Fetching service tags for user:', user?.id);
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, category')
        .eq('user_id', user?.id)
        .eq('category', 'Service')
        .order('name');
      
      if (error) {
        console.error('Error fetching service tags:', error);
        return [];
      }
      
      console.log('Found service tags:', data);
      return data?.map(t => t.name) || [];
    },
    enabled: !!user?.id,
  });

  // If service tags exist, use them as job types
  const finalJobTypes = serviceTags.length > 0 ? serviceTags : jobTypes;

  // If categories return empty, use all tags as fallback
  const finalJobTags = jobTags.length > 0 ? jobTags : 
    allTags.filter(t => ['job', 'Job', 'Service', 'Type', 'Priority'].includes(t.category)).map(t => t.name);
  const finalClientTags = clientTags.length > 0 ? clientTags : 
    allTags.filter(t => t.category?.toLowerCase() === 'client').map(t => t.name);

  const isLoading = loadingJobTypes || loadingJobStatuses || loadingClientTags || 
                   loadingJobTags || loadingTeamMembers || loadingServiceAreas || 
                   loadingLeadSources || loadingPaymentMethods;

  console.log('useAutomationData returning:', {
    jobTypes: finalJobTypes,
    jobStatuses,
    clientTags: finalClientTags,
    jobTags: finalJobTags,
    teamMembers,
    serviceAreas,
    leadSources,
    paymentMethods,
    isLoading
  });

  return {
    jobTypes: finalJobTypes,
    jobStatuses,
    clientTags: finalClientTags,
    jobTags: finalJobTags,
    teamMembers,
    serviceAreas,
    leadSources,
    paymentMethods,
    isLoading,
  };
};

// Get dynamic value options based on field
export const getFieldValueOptions = (field: string, data: any): string[] => {
  console.log('getFieldValueOptions called with field:', field, 'data:', data);
  
  const defaultOptions: Record<string, string[]> = {
    'priority': ['Low', 'Medium', 'High', 'Urgent', 'Emergency'],
    'client_type': ['Residential', 'Commercial', 'Industrial', 'Government', 'Non-Profit'],
    'payment_status': ['Pending', 'Paid', 'Partial', 'Overdue', 'Refunded'],
    'estimate_status': ['Draft', 'Sent', 'Viewed', 'Approved', 'Rejected', 'Expired'],
    'invoice_status': ['Draft', 'Sent', 'Viewed', 'Paid', 'Partial', 'Overdue', 'Cancelled'],
    'task_type': ['Follow Up', 'Inspection', 'Documentation', 'Call Customer', 'Order Parts', 'Schedule Service'],
    'task_priority': ['Low', 'Normal', 'High', 'Urgent'],
    'completion_time': ['On Time', 'Early', 'Late', 'Same Day', 'Next Day'],
    'recurring': ['Yes', 'No'],
    'tax_exempt': ['Yes', 'No'],
    'discount_applied': ['Yes', 'No'],
  };

  // Map fields to dynamic data
  const dynamicFieldMap: Record<string, string[]> = {
    'job_type': data.jobTypes || [],
    'job_status': data.jobStatuses || [],
    'job_tag': data.jobTags || [],
    'client_tag': data.clientTags || [],
    'technician': data.teamMembers || [],
    'service_area': data.serviceAreas || [],
    'client_source': data.leadSources || [],
    'payment_method': data.paymentMethods || [],
    'tag_name': data.clientTags || [],
  };

  // Return dynamic data if available, otherwise default options
  const dynamicData = dynamicFieldMap[field];
  const defaultData = defaultOptions[field];
  
  console.log(`Field '${field}' - Dynamic data:`, dynamicData, 'Default data:', defaultData);
  
  // Return dynamic data if it has values, otherwise fallback to defaults
  if (dynamicData && dynamicData.length > 0) {
    return dynamicData;
  }
  
  return defaultData || [];
};