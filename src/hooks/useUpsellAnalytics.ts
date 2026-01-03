import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// Types for upsell analytics
export type UpsellEventType = 'shown' | 'accepted' | 'rejected' | 'auto_added' | 'removed';
export type DocumentType = 'estimate' | 'invoice';

export interface UpsellEvent {
  documentType: DocumentType;
  documentId: string;
  productId: string;
  productName: string;
  productPrice: number;
  eventType: UpsellEventType;
  jobType?: string;
  technicianId?: string;
  clientId?: string;
}

export interface UpsellDailyStats {
  date: string;
  productId: string;
  documentType: DocumentType;
  shownCount: number;
  acceptedCount: number;
  rejectedCount: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  totalShown: number;
  totalAccepted: number;
  totalRejected: number;
  conversionRate: number;
  totalRevenue: number;
}

export interface TechnicianStats {
  technicianId: string;
  technicianName: string;
  totalOffered: number;
  totalAccepted: number;
  conversionRate: number;
  totalRevenue: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const useUpsellAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Track an upsell event
  const trackEventMutation = useMutation({
    mutationFn: async (event: UpsellEvent) => {
      // Get company_id from user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile?.company_id) {
        console.error('Error fetching company_id:', profileError);
        return null; // Silently fail - don't block the user flow
      }

      const { error } = await supabase
        .from('upsell_events')
        .insert({
          company_id: profile.company_id,
          document_type: event.documentType,
          document_id: event.documentId,
          product_id: event.productId,
          product_name: event.productName,
          product_price: event.productPrice,
          event_type: event.eventType,
          job_type: event.jobType,
          technician_id: event.technicianId || user?.id,
          client_id: event.clientId
        });

      if (error) {
        console.error('Error tracking upsell event:', error);
        return null; // Silently fail
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate analytics queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['upsell-analytics'] });
    }
  });

  // Get daily stats for a date range
  const useDailyStats = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: ['upsell-analytics', 'daily-stats', dateRange],
      queryFn: async (): Promise<UpsellDailyStats[]> => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!profile?.company_id) return [];

        let query = supabase
          .from('upsell_daily_stats')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('date', { ascending: false });

        if (dateRange) {
          query = query
            .gte('date', dateRange.from.toISOString().split('T')[0])
            .lte('date', dateRange.to.toISOString().split('T')[0]);
        }

        const { data, error } = await query.limit(90); // Last 90 days max

        if (error) {
          console.error('Error fetching daily stats:', error);
          return [];
        }

        return (data || []).map(stat => ({
          date: stat.date,
          productId: stat.product_id,
          documentType: stat.document_type as DocumentType,
          shownCount: stat.shown_count,
          acceptedCount: stat.accepted_count,
          rejectedCount: stat.rejected_count,
          totalRevenue: parseFloat(stat.total_revenue) || 0,
          conversionRate: stat.shown_count > 0
            ? (stat.accepted_count / stat.shown_count) * 100
            : 0
        }));
      },
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5 // 5 minutes
    });
  };

  // Get top performing products
  const useTopPerformers = (limit = 10, dateRange?: DateRange) => {
    return useQuery({
      queryKey: ['upsell-analytics', 'top-performers', limit, dateRange],
      queryFn: async (): Promise<ProductPerformance[]> => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!profile?.company_id) return [];

        // Get aggregated stats per product
        let query = supabase
          .from('upsell_daily_stats')
          .select('product_id, shown_count, accepted_count, rejected_count, total_revenue')
          .eq('company_id', profile.company_id);

        if (dateRange) {
          query = query
            .gte('date', dateRange.from.toISOString().split('T')[0])
            .lte('date', dateRange.to.toISOString().split('T')[0]);
        }

        const { data: statsData, error: statsError } = await query;

        if (statsError) {
          console.error('Error fetching stats:', statsError);
          return [];
        }

        // Aggregate by product
        const productStats = new Map<string, {
          shown: number;
          accepted: number;
          rejected: number;
          revenue: number;
        }>();

        (statsData || []).forEach(stat => {
          const existing = productStats.get(stat.product_id) || {
            shown: 0, accepted: 0, rejected: 0, revenue: 0
          };
          productStats.set(stat.product_id, {
            shown: existing.shown + stat.shown_count,
            accepted: existing.accepted + stat.accepted_count,
            rejected: existing.rejected + stat.rejected_count,
            revenue: existing.revenue + (parseFloat(stat.total_revenue) || 0)
          });
        });

        // Get product names
        const productIds = Array.from(productStats.keys()).filter(Boolean);
        if (productIds.length === 0) return [];

        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);

        const productNameMap = new Map((products || []).map(p => [p.id, p.name]));

        // Build performance array
        const performances: ProductPerformance[] = [];
        productStats.forEach((stats, productId) => {
          performances.push({
            productId,
            productName: productNameMap.get(productId) || 'Unknown Product',
            totalShown: stats.shown,
            totalAccepted: stats.accepted,
            totalRejected: stats.rejected,
            conversionRate: stats.shown > 0 ? (stats.accepted / stats.shown) * 100 : 0,
            totalRevenue: stats.revenue
          });
        });

        // Sort by revenue and limit
        return performances
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, limit);
      },
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5
    });
  };

  // Get overall conversion rate
  const useOverallStats = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: ['upsell-analytics', 'overall', dateRange],
      queryFn: async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!profile?.company_id) return null;

        let query = supabase
          .from('upsell_daily_stats')
          .select('shown_count, accepted_count, rejected_count, total_revenue')
          .eq('company_id', profile.company_id);

        if (dateRange) {
          query = query
            .gte('date', dateRange.from.toISOString().split('T')[0])
            .lte('date', dateRange.to.toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching overall stats:', error);
          return null;
        }

        const totals = (data || []).reduce(
          (acc, stat) => ({
            shown: acc.shown + stat.shown_count,
            accepted: acc.accepted + stat.accepted_count,
            rejected: acc.rejected + stat.rejected_count,
            revenue: acc.revenue + (parseFloat(stat.total_revenue) || 0)
          }),
          { shown: 0, accepted: 0, rejected: 0, revenue: 0 }
        );

        return {
          totalShown: totals.shown,
          totalAccepted: totals.accepted,
          totalRejected: totals.rejected,
          totalRevenue: totals.revenue,
          conversionRate: totals.shown > 0
            ? (totals.accepted / totals.shown) * 100
            : 0
        };
      },
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5
    });
  };

  // Get technician performance stats
  const useTechnicianStats = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: ['upsell-analytics', 'technician-stats', dateRange],
      queryFn: async (): Promise<TechnicianStats[]> => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!profile?.company_id) return [];

        let query = supabase
          .from('upsell_events')
          .select('technician_id, event_type, product_price')
          .eq('company_id', profile.company_id)
          .in('event_type', ['shown', 'accepted', 'auto_added']);

        if (dateRange) {
          query = query
            .gte('created_at', dateRange.from.toISOString())
            .lte('created_at', dateRange.to.toISOString());
        }

        const { data: events, error } = await query;

        if (error) {
          console.error('Error fetching technician stats:', error);
          return [];
        }

        // Aggregate by technician
        const techStats = new Map<string, {
          offered: number;
          accepted: number;
          revenue: number;
        }>();

        (events || []).forEach(event => {
          if (!event.technician_id) return;
          const existing = techStats.get(event.technician_id) || {
            offered: 0, accepted: 0, revenue: 0
          };
          techStats.set(event.technician_id, {
            offered: existing.offered + (event.event_type === 'shown' ? 1 : 0),
            accepted: existing.accepted + (event.event_type === 'accepted' || event.event_type === 'auto_added' ? 1 : 0),
            revenue: existing.revenue + (event.event_type === 'accepted' || event.event_type === 'auto_added'
              ? (parseFloat(event.product_price) || 0)
              : 0)
          });
        });

        // Get technician names
        const techIds = Array.from(techStats.keys());
        if (techIds.length === 0) return [];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', techIds);

        const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name || 'Unknown']));

        // Build stats array
        const stats: TechnicianStats[] = [];
        techStats.forEach((s, techId) => {
          stats.push({
            technicianId: techId,
            technicianName: nameMap.get(techId) || 'Unknown',
            totalOffered: s.offered,
            totalAccepted: s.accepted,
            conversionRate: s.offered > 0 ? (s.accepted / s.offered) * 100 : 0,
            totalRevenue: s.revenue
          });
        });

        return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
      },
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5
    });
  };

  // Helper function to track multiple events at once (for "shown" events)
  const trackShownEvents = async (
    documentType: DocumentType,
    documentId: string,
    products: Array<{ id: string; name: string; price: number }>,
    jobType?: string,
    clientId?: string
  ) => {
    for (const product of products) {
      await trackEventMutation.mutateAsync({
        documentType,
        documentId,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        eventType: 'shown',
        jobType,
        clientId
      });
    }
  };

  return {
    // Event tracking
    trackEvent: trackEventMutation.mutate,
    trackEventAsync: trackEventMutation.mutateAsync,
    trackShownEvents,
    isTracking: trackEventMutation.isPending,

    // Query hooks (call these in components)
    useDailyStats,
    useTopPerformers,
    useOverallStats,
    useTechnicianStats
  };
};

// Standalone function for tracking without hook (for use in non-component contexts)
export const trackUpsellEvent = async (event: UpsellEvent, userId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.company_id) {
      console.error('Error fetching company_id:', profileError);
      return false;
    }

    const { error } = await supabase
      .from('upsell_events')
      .insert({
        company_id: profile.company_id,
        document_type: event.documentType,
        document_id: event.documentId,
        product_id: event.productId,
        product_name: event.productName,
        product_price: event.productPrice,
        event_type: event.eventType,
        job_type: event.jobType,
        technician_id: event.technicianId || userId,
        client_id: event.clientId
      });

    if (error) {
      console.error('Error tracking upsell event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in trackUpsellEvent:', error);
    return false;
  }
};
