// Direct API client for SMS operations without realtime
const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";

export const smsAPI = {
  async query(table: string, method: string = 'GET', body?: any) {
    const token = localStorage.getItem('supabase.auth.token');
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok && response.status !== 409) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async getConversations(userId: string) {
    return this.query(`sms_conversations?user_id=eq.${userId}&status=eq.active&select=*,client:clients(id,name,phone,email)&order=last_message_at.desc.nullsfirst`);
  },

  async getMessages(conversationId: string) {
    return this.query(`sms_messages?conversation_id=eq.${conversationId}&order=created_at.asc`);
  },

  async insertMessage(message: any) {
    return this.query('sms_messages', 'POST', message);
  },

  async updateConversation(id: string, data: any) {
    return this.query(`sms_conversations?id=eq.${id}`, 'PATCH', data);
  }
};