import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeclineData {
  id: string;
  type: 'estimate' | 'invoice';
  number: string;
  client_name: string;
  total: number;
  decline_reason: string | null;
  declined_at: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { timeframe = '30days', includeAiAnalysis = false } = body;

    console.log('[get-decline-analytics] Fetching for user:', user.id, 'timeframe:', timeframe);

    // Calculate date range
    let startDate = new Date();
    switch (timeframe) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Fetch declined estimates
    const { data: declinedEstimates, error: estError } = await supabase
      .from('estimates')
      .select('id, estimate_number, total, decline_reason, declined_at, created_at, clients(name)')
      .eq('user_id', user.id)
      .eq('status', 'rejected')
      .gte('declined_at', startDate.toISOString())
      .order('declined_at', { ascending: false });

    if (estError) {
      console.error('[get-decline-analytics] Error fetching estimates:', estError);
    }

    // Fetch declined invoices (if they have decline tracking)
    const { data: declinedInvoices, error: invError } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, decline_reason, declined_at, created_at, clients(name)')
      .eq('user_id', user.id)
      .not('declined_at', 'is', null)
      .gte('declined_at', startDate.toISOString())
      .order('declined_at', { ascending: false });

    if (invError) {
      console.error('[get-decline-analytics] Error fetching invoices:', invError);
    }

    // Fetch total estimates for rate calculation
    const { count: totalEstimates } = await supabase
      .from('estimates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    const { count: totalInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    // Combine and process declines
    const allDeclines: DeclineData[] = [];

    (declinedEstimates || []).forEach((est: any) => {
      allDeclines.push({
        id: est.id,
        type: 'estimate',
        number: est.estimate_number || est.id.substring(0, 8),
        client_name: est.clients?.name || 'Unknown',
        total: est.total || 0,
        decline_reason: est.decline_reason,
        declined_at: est.declined_at,
        created_at: est.created_at,
      });
    });

    (declinedInvoices || []).forEach((inv: any) => {
      allDeclines.push({
        id: inv.id,
        type: 'invoice',
        number: inv.invoice_number || inv.id.substring(0, 8),
        client_name: inv.clients?.name || 'Unknown',
        total: inv.total || 0,
        decline_reason: inv.decline_reason,
        declined_at: inv.declined_at,
        created_at: inv.created_at,
      });
    });

    // Calculate analytics
    const estimateDeclineCount = declinedEstimates?.length || 0;
    const invoiceDeclineCount = declinedInvoices?.length || 0;
    const totalDeclines = estimateDeclineCount + invoiceDeclineCount;

    const estimateDeclineRate = totalEstimates ? Math.round((estimateDeclineCount / totalEstimates) * 100) : 0;
    const invoiceDeclineRate = totalInvoices ? Math.round((invoiceDeclineCount / totalInvoices) * 100) : 0;

    const totalLostRevenue = allDeclines.reduce((sum, d) => sum + d.total, 0);

    // Group by reason categories
    const reasonCounts: Record<string, { count: number; total: number }> = {};
    const noReasonKey = 'No reason provided';

    allDeclines.forEach((decline) => {
      const reason = decline.decline_reason?.trim() || noReasonKey;
      // Normalize common reasons
      const normalizedReason = normalizeReason(reason);

      if (!reasonCounts[normalizedReason]) {
        reasonCounts[normalizedReason] = { count: 0, total: 0 };
      }
      reasonCounts[normalizedReason].count++;
      reasonCounts[normalizedReason].total += decline.total;
    });

    // Sort reasons by count
    const topReasons = Object.entries(reasonCounts)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        percentage: totalDeclines ? Math.round((data.count / totalDeclines) * 100) : 0,
        totalRevenue: data.total,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by time periods (for trend chart)
    const trendData = calculateTrendData(allDeclines, timeframe);

    // Generate AI insights if requested
    let aiAnalysis = null;
    if (includeAiAnalysis && topReasons.length > 0) {
      aiAnalysis = generateBasicInsights(topReasons, estimateDeclineRate, invoiceDeclineRate, totalLostRevenue);
    }

    const response = {
      summary: {
        totalDeclines,
        estimateDeclines: estimateDeclineCount,
        invoiceDeclines: invoiceDeclineCount,
        estimateDeclineRate,
        invoiceDeclineRate,
        totalLostRevenue,
        averageDeclinedValue: totalDeclines ? totalLostRevenue / totalDeclines : 0,
      },
      topReasons,
      trendData,
      recentDeclines: allDeclines.slice(0, 20),
      aiAnalysis,
      timeframe,
    };

    console.log('[get-decline-analytics] Response summary:', response.summary);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-decline-analytics] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Normalize decline reasons into categories
function normalizeReason(reason: string): string {
  const lowerReason = reason.toLowerCase();

  // Price-related
  if (lowerReason.includes('price') || lowerReason.includes('expensive') ||
      lowerReason.includes('cost') || lowerReason.includes('afford') ||
      lowerReason.includes('budget') || lowerReason.includes('cheap')) {
    return 'Price too high';
  }

  // Timing
  if (lowerReason.includes('time') || lowerReason.includes('later') ||
      lowerReason.includes('wait') || lowerReason.includes('schedule') ||
      lowerReason.includes('busy') || lowerReason.includes('postpone')) {
    return 'Bad timing';
  }

  // Competitor
  if (lowerReason.includes('competitor') || lowerReason.includes('another') ||
      lowerReason.includes('different company') || lowerReason.includes('someone else') ||
      lowerReason.includes('other quote')) {
    return 'Chose competitor';
  }

  // Not needed
  if (lowerReason.includes('not need') || lowerReason.includes('don\'t need') ||
      lowerReason.includes('changed mind') || lowerReason.includes('cancel') ||
      lowerReason.includes('no longer')) {
    return 'No longer needed';
  }

  // Scope issues
  if (lowerReason.includes('scope') || lowerReason.includes('different') ||
      lowerReason.includes('not what') || lowerReason.includes('misunderstand')) {
    return 'Scope mismatch';
  }

  // Trust
  if (lowerReason.includes('trust') || lowerReason.includes('review') ||
      lowerReason.includes('reference') || lowerReason.includes('reputation')) {
    return 'Trust concerns';
  }

  // No reason
  if (reason === 'No reason provided' || !reason.trim()) {
    return 'No reason provided';
  }

  // If it's a short custom reason, return as-is
  if (reason.length < 50) {
    return reason;
  }

  return 'Other';
}

// Calculate trend data for charts
function calculateTrendData(declines: DeclineData[], timeframe: string) {
  const now = new Date();
  const periods: { label: string; start: Date; end: Date }[] = [];

  // Define periods based on timeframe
  if (timeframe === '7days') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      periods.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
      });
    }
  } else if (timeframe === '30days') {
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      periods.push({
        label: `Week ${4 - i}`,
        start,
        end,
      });
    }
  } else {
    // Monthly for 90days and 1year
    const months = timeframe === '90days' ? 3 : 12;
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      });
    }
  }

  return periods.map((period) => {
    const periodDeclines = declines.filter((d) => {
      const declinedDate = new Date(d.declined_at);
      return declinedDate >= period.start && declinedDate <= period.end;
    });

    return {
      label: period.label,
      estimates: periodDeclines.filter((d) => d.type === 'estimate').length,
      invoices: periodDeclines.filter((d) => d.type === 'invoice').length,
      total: periodDeclines.length,
      revenue: periodDeclines.reduce((sum, d) => sum + d.total, 0),
    };
  });
}

// Generate basic AI insights
function generateBasicInsights(
  topReasons: any[],
  estimateDeclineRate: number,
  invoiceDeclineRate: number,
  totalLostRevenue: number
) {
  const insights: string[] = [];
  const recommendations: string[] = [];

  // Top reason insight
  if (topReasons.length > 0) {
    const topReason = topReasons[0];
    insights.push(`"${topReason.reason}" is your #1 decline reason, accounting for ${topReason.percentage}% of all declines ($${topReason.totalRevenue.toFixed(2)} lost).`);

    // Add recommendation based on reason
    switch (topReason.reason) {
      case 'Price too high':
        recommendations.push('Consider offering tiered pricing options or payment plans.');
        recommendations.push('Highlight value-added services to justify pricing.');
        break;
      case 'Bad timing':
        recommendations.push('Implement automated follow-up sequences for timing-related declines.');
        recommendations.push('Add calendar scheduling links in estimates for easy rebooking.');
        break;
      case 'Chose competitor':
        recommendations.push('Research competitor pricing and differentiate your value proposition.');
        recommendations.push('Consider adding "why choose us" section to estimates.');
        break;
      case 'No longer needed':
        recommendations.push('Speed up estimate turnaround time.');
        recommendations.push('Add urgency messaging or limited-time discounts.');
        break;
      case 'No reason provided':
        recommendations.push('Add a mandatory decline reason field in the portal.');
        recommendations.push('Follow up personally with clients who decline without reason.');
        break;
      default:
        recommendations.push('Analyze individual decline reasons for patterns.');
    }
  }

  // Rate insights
  if (estimateDeclineRate > 30) {
    insights.push(`Your estimate decline rate (${estimateDeclineRate}%) is above industry average. Focus on qualification before sending estimates.`);
    recommendations.push('Qualify leads better before sending estimates.');
  }

  if (invoiceDeclineRate > 10) {
    insights.push(`Invoice decline rate of ${invoiceDeclineRate}% suggests issues with post-service satisfaction or invoicing clarity.`);
    recommendations.push('Review invoice clarity and add detailed service descriptions.');
  }

  // Revenue insight
  if (totalLostRevenue > 1000) {
    insights.push(`You've lost $${totalLostRevenue.toFixed(2)} to declined documents in this period. Even a 10% recovery could add $${(totalLostRevenue * 0.1).toFixed(2)} to your revenue.`);
    recommendations.push('Implement an automated re-engagement campaign for declined estimates.');
  }

  return {
    insights,
    recommendations,
    priority: topReasons[0]?.reason || 'No reason provided',
    potentialRecovery: totalLostRevenue * 0.15, // Assume 15% potential recovery
  };
}
