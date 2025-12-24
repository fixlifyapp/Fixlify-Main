import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  timeframe?: 'today' | 'week' | 'month' | 'all';
  userId?: string;
  phoneNumberId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AnalyticsRequest = await req.json().catch(() => ({}));
    const { timeframe = 'today', userId, phoneNumberId } = requestData;

    console.log('get-ai-call-analytics request:', { timeframe, userId, phoneNumberId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Query AI dispatcher call logs
    let query = supabase
      .from('ai_dispatcher_call_logs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (phoneNumberId) {
      query = query.eq('phone_number_id', phoneNumberId);
    }

    const { data: callLogs, error: callError } = await query;

    if (callError) {
      console.error('Error fetching call logs:', callError);
    }

    // Calculate analytics
    const calls = callLogs || [];
    const totalCalls = calls.length;
    const completedCalls = calls.filter(c => c.call_status === 'completed').length;
    const missedCalls = calls.filter(c => c.call_status === 'missed' || c.call_status === 'no-answer').length;
    const inProgressCalls = calls.filter(c => c.call_status === 'in_progress').length;

    // Calculate average duration for completed calls
    const completedCallsWithDuration = calls.filter(c => c.duration_seconds);
    const avgDuration = completedCallsWithDuration.length > 0
      ? completedCallsWithDuration.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / completedCallsWithDuration.length
      : 0;

    // Calculate success rate
    const successRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

    // Get calls by hour for chart data
    const callsByHour: Record<string, number> = {};
    calls.forEach(call => {
      const hour = new Date(call.created_at).getHours();
      const hourKey = `${hour}:00`;
      callsByHour[hourKey] = (callsByHour[hourKey] || 0) + 1;
    });

    // Query appointment bookings
    let bookingsQuery = supabase
      .from('ai_appointments')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (userId) {
      bookingsQuery = bookingsQuery.eq('user_id', userId);
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery;

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        analytics: {
          totalCalls,
          completedCalls,
          missedCalls,
          inProgressCalls,
          avgDuration: Math.round(avgDuration),
          successRate: Math.round(successRate * 100) / 100,
          callsByHour,
          totalBookings,
          confirmedBookings,
          timeframe,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-ai-call-analytics:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        analytics: {
          totalCalls: 0,
          completedCalls: 0,
          missedCalls: 0,
          inProgressCalls: 0,
          avgDuration: 0,
          successRate: 0,
          callsByHour: {},
          totalBookings: 0,
          confirmedBookings: 0
        }
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
