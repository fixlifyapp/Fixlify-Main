import { supabase } from '@/integrations/supabase/client';

export interface CallConversation {
  id?: string;
  job_id?: string | null;
  client_id?: string | null;
  user_id?: string | null;
  phone_number: string;
  caller_number?: string | null;
  call_id?: string | null;
  call_duration?: number;
  call_direction?: 'inbound' | 'outbound';
  call_status?: 'completed' | 'missed' | 'voicemail' | 'failed';
  summary?: string | null;
  transcript?: string | null;
  ai_notes?: string | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  topics?: string[];
  action_items?: string[];
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export const callConversationService = {
  // Create a new conversation
  async createConversation(conversation: CallConversation) {
    const { data, error } = await supabase
      .from('call_conversations')
      .insert([conversation])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get conversations for a specific job
  async getJobConversations(jobId: string) {
    const { data, error } = await supabase
      .from('call_conversations')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get conversations for a specific client
  async getClientConversations(clientId: string) {
    const { data, error } = await supabase
      .from('call_conversations')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all conversations for a user
  async getUserConversations(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('call_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Update a conversation
  async updateConversation(id: string, updates: Partial<CallConversation>) {
    const { data, error } = await supabase
      .from('call_conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a conversation
  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('call_conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get conversation by call ID (from Telnyx)
  async getConversationByCallId(callId: string) {
    const { data, error } = await supabase
      .from('call_conversations')
      .select('*')
      .eq('call_id', callId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors
    return data;
  },

  // Add action items to a conversation
  async addActionItems(id: string, actionItems: string[]) {
    const { data: existing } = await supabase
      .from('call_conversations')
      .select('action_items')
      .eq('id', id)
      .single();

    const currentItems = existing?.action_items || [];
    const updatedItems = [...currentItems, ...actionItems];

    const { data, error } = await supabase
      .from('call_conversations')
      .update({ action_items: updatedItems })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Search conversations by content
  async searchConversations(userId: string, searchTerm: string) {
    const { data, error } = await supabase
      .from('call_conversations')
      .select('*')
      .eq('user_id', userId)
      .or(`summary.ilike.%${searchTerm}%,transcript.ilike.%${searchTerm}%,ai_notes.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get conversation statistics
  async getConversationStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('call_conversations')
      .select('call_duration, sentiment, call_status, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalCalls: data?.length || 0,
      totalDuration: data?.reduce((sum, c) => sum + (c.call_duration || 0), 0) || 0,
      averageDuration: 0,
      sentimentBreakdown: {
        positive: 0,
        neutral: 0,
        negative: 0,
        mixed: 0
      },
      statusBreakdown: {
        completed: 0,
        missed: 0,
        voicemail: 0,
        failed: 0
      }
    };

    if (data && data.length > 0) {
      stats.averageDuration = Math.round(stats.totalDuration / data.length);
      
      data.forEach(conv => {
        if (conv.sentiment) {
          stats.sentimentBreakdown[conv.sentiment]++;
        }
        if (conv.call_status) {
          stats.statusBreakdown[conv.call_status]++;
        }
      });
    }

    return stats;
  }
};