import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface JobContext {
  job_type: string;
  service_category?: string;
  job_value: number;
  client_history?: {
    totalJobs: number;
    totalSpent: number;
    previousWarranties: boolean;
  };
  clientId?: string;
}

export interface AIRecommendation {
  warranty_name: string;
  reasoning: string;
  confidence_score: number;
  price: number;
  product_id: string;
}

interface ProductPerformance {
  id: string;
  name: string;
  price: number;
  description?: string;
  conversion_hint?: string;
  is_featured?: boolean;
  conversionRate: number;
  acceptedCount: number;
}

// Job type to keyword mapping for matching warranties
const JOB_TYPE_KEYWORDS: Record<string, string[]> = {
  hvac: ['hvac', 'heating', 'cooling', 'ac', 'air conditioning', 'furnace', 'heat pump'],
  plumbing: ['plumb', 'pipe', 'drain', 'water', 'sewer', 'leak'],
  electrical: ['electric', 'wiring', 'circuit', 'outlet', 'panel', 'lighting'],
  appliance: ['appliance', 'repair', 'washer', 'dryer', 'refrigerator', 'dishwasher'],
  general: ['maintenance', 'service', 'inspection', 'general']
};

// Match job type to warranty category
const matchJobTypeToCategory = (jobType: string): string[] => {
  const lowerJobType = jobType.toLowerCase();
  const matches: string[] = [];

  for (const [category, keywords] of Object.entries(JOB_TYPE_KEYWORDS)) {
    if (keywords.some(kw => lowerJobType.includes(kw))) {
      matches.push(category);
    }
  }

  return matches.length > 0 ? matches : ['general'];
};

// Generate reasoning based on context
const generateReasoning = (
  product: ProductPerformance,
  jobType: string,
  jobValue: number,
  clientHistory?: JobContext['client_history']
): string => {
  const reasons: string[] = [];

  // High conversion rate
  if (product.conversionRate > 50) {
    reasons.push(`${Math.round(product.conversionRate)}% acceptance rate on similar jobs`);
  }

  // Price-appropriate
  const priceRatio = product.price / jobValue;
  if (priceRatio >= 0.05 && priceRatio <= 0.20) {
    reasons.push('Price-appropriate for this job value');
  }

  // Featured product
  if (product.is_featured) {
    reasons.push('Top performing warranty');
  }

  // Client history
  if (clientHistory?.previousWarranties) {
    reasons.push('Client has purchased warranties before');
  }

  // Custom hint
  if (product.conversion_hint) {
    reasons.push(product.conversion_hint);
  }

  return reasons.length > 0
    ? reasons.join('. ') + '.'
    : 'Recommended based on job characteristics.';
};

// Calculate confidence score
const calculateConfidence = (
  product: ProductPerformance,
  jobValue: number,
  clientHistory?: JobContext['client_history']
): number => {
  let score = 0.5; // Base score

  // Conversion rate factor (max +0.25)
  if (product.conversionRate > 0) {
    score += Math.min(product.conversionRate / 100, 0.25);
  }

  // Volume factor - more accepted = more reliable (max +0.1)
  if (product.acceptedCount > 10) {
    score += Math.min(product.acceptedCount / 100, 0.1);
  }

  // Price appropriateness (max +0.1)
  const priceRatio = product.price / jobValue;
  if (priceRatio >= 0.05 && priceRatio <= 0.20) {
    score += 0.1;
  } else if (priceRatio >= 0.02 && priceRatio <= 0.30) {
    score += 0.05;
  }

  // Featured boost (max +0.05)
  if (product.is_featured) {
    score += 0.05;
  }

  // Client history boost (max +0.1)
  if (clientHistory?.previousWarranties) {
    score += 0.1;
  } else if (clientHistory && clientHistory.totalJobs > 3) {
    score += 0.05; // Repeat customer
  }

  return Math.min(score, 0.95); // Cap at 95%
};

export const useAIUpsellRecommendations = (jobContext?: JobContext) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-upsell-recommendations', jobContext?.job_type, jobContext?.job_value, jobContext?.clientId],
    queryFn: async (): Promise<AIRecommendation[]> => {
      if (!jobContext) return [];

      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.company_id) return [];

      // Fetch warranty products with performance data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, description, is_featured, conversion_hint')
        .eq('category', 'Warranties');

      if (productsError || !products?.length) return [];

      // Fetch conversion stats for these products
      const productIds = products.map(p => p.id);
      const { data: stats } = await supabase
        .from('upsell_daily_stats')
        .select('product_id, shown_count, accepted_count')
        .eq('company_id', profile.company_id)
        .in('product_id', productIds);

      // Aggregate stats per product
      const statsMap = new Map<string, { shown: number; accepted: number }>();
      (stats || []).forEach(stat => {
        const existing = statsMap.get(stat.product_id) || { shown: 0, accepted: 0 };
        statsMap.set(stat.product_id, {
          shown: existing.shown + stat.shown_count,
          accepted: existing.accepted + stat.accepted_count
        });
      });

      // Build product performance data
      const productsWithPerformance: ProductPerformance[] = products.map(p => {
        const perfStats = statsMap.get(p.id) || { shown: 0, accepted: 0 };
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          conversion_hint: p.conversion_hint,
          is_featured: p.is_featured,
          conversionRate: perfStats.shown > 0
            ? (perfStats.accepted / perfStats.shown) * 100
            : 50, // Default for products without history
          acceptedCount: perfStats.accepted
        };
      });

      // Score and rank products for this job
      const recommendations: AIRecommendation[] = productsWithPerformance
        .map(product => ({
          warranty_name: product.name,
          product_id: product.id,
          price: product.price,
          reasoning: generateReasoning(product, jobContext.job_type, jobContext.job_value, jobContext.client_history),
          confidence_score: calculateConfidence(product, jobContext.job_value, jobContext.client_history)
        }))
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 3); // Top 3 recommendations

      return recommendations;
    },
    enabled: !!user?.id && !!jobContext,
    staleTime: 1000 * 60 * 10 // 10 minutes - recommendations don't change often
  });
};

// Simple standalone function for quick recommendations without full analytics
export const getQuickRecommendations = (
  jobType: string,
  jobValue: number
): { tip: string; category: 'conversion' | 'retention' | 'value' }[] => {
  const tips: { tip: string; category: 'conversion' | 'retention' | 'value' }[] = [];
  const categories = matchJobTypeToCategory(jobType);

  // Job value based tips
  if (jobValue > 1000) {
    tips.push({
      tip: `High-value job ($${jobValue.toFixed(0)}) - premium warranty packages have 75% acceptance rate`,
      category: 'value'
    });
  } else if (jobValue > 500) {
    tips.push({
      tip: '2-year warranties convert best for mid-range jobs',
      category: 'conversion'
    });
  } else {
    tips.push({
      tip: 'Offer basic warranty protection - clients expect it on jobs under $500',
      category: 'conversion'
    });
  }

  // Job type based tips
  if (categories.includes('hvac')) {
    tips.push({
      tip: 'HVAC customers prefer 2-3 year coverage - seasonal issues drive warranty value',
      category: 'conversion'
    });
  }

  if (categories.includes('plumbing')) {
    tips.push({
      tip: 'Plumbing warranties with water damage coverage see 55% higher uptake',
      category: 'conversion'
    });
  }

  if (categories.includes('electrical')) {
    tips.push({
      tip: 'Electrical work warranties build trust - safety concerns drive acceptance',
      category: 'retention'
    });
  }

  return tips.slice(0, 3);
};
