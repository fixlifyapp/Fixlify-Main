import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the webhook payload
    const payload = await req.text();
    console.log('Received email webhook payload');

    // Verify Mailgun signature if webhook secret is set
    const webhookSecret = Deno.env.get('MAILGUN_WEBHOOK_SECRET');
    if (webhookSecret) {
      const signature = req.headers.get('X-Mailgun-Signature');
      if (!signature) {
        console.error('Missing Mailgun signature');
        return new Response('Unauthorized', { status: 401 });
      }

      // Verify signature
      const timestamp = req.headers.get('X-Mailgun-Timestamp');
      const token = req.headers.get('X-Mailgun-Token');
      
      if (!timestamp || !token) {
        console.error('Missing signature components');
        return new Response('Unauthorized', { status: 401 });
      }

      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(timestamp + token)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Mailgun signature');
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Parse the email data
    const formData = new URLSearchParams(payload);
    const emailData = {
      recipient: formData.get('recipient') || '',
      sender: formData.get('sender') || formData.get('from') || '',
      subject: formData.get('subject') || '',
      body: formData.get('body-plain') || formData.get('stripped-text') || '',
      htmlBody: formData.get('body-html') || formData.get('stripped-html') || '',
      messageId: formData.get('Message-Id') || '',
      timestamp: formData.get('timestamp') || new Date().toISOString(),
    };

    console.log('Email received:', {
      to: emailData.recipient,
      from: emailData.sender,
      subject: emailData.subject
    });

    // Extract company email from recipient (e.g., kyky@fixlify.app)
    const recipientEmail = emailData.recipient.toLowerCase();
    const companyEmailMatch = recipientEmail.match(/^([^@]+)@fixlify\.app$/);
    
    if (!companyEmailMatch) {
      console.error('Invalid recipient format:', recipientEmail);
      return new Response('Invalid recipient', { status: 400 });
    }

    const companyEmailPrefix = companyEmailMatch[1];

    // Find the user by company email address
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('id, user_id, company_name')
      .eq('company_email_address', `${companyEmailPrefix}@fixlify.app`)
      .single();

    if (userError || !userData) {
      // Try company_settings table
      const { data: companyData, error: companyError } = await supabaseClient
        .from('company_settings')
        .select('id, user_id, company_name')
        .eq('company_email_address', `${companyEmailPrefix}@fixlify.app`)
        .single();

      if (companyError || !companyData) {
        console.error('Company email not found:', companyEmailPrefix);
        return new Response('Recipient not found', { status: 404 });
      }

      // Use company data
      userData = companyData;
    }

    const userId = userData.user_id;

    // Extract client email from sender
    const clientEmail = emailData.sender.toLowerCase();

    // Find or create client
    let clientId = null;
    const { data: existingClient, error: clientError } = await supabaseClient
      .from('clients')
      .select('id, name')
      .eq('email', clientEmail)
      .eq('user_id', userId)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Extract name from email if possible
      const emailParts = clientEmail.split('@');
      const nameParts = emailParts[0].split(/[._-]/);
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Client';
      const clientName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;

      // Create new client
      const { data: newClient, error: createError } = await supabaseClient
        .from('clients')
        .insert({
          user_id: userId,
          name: clientName,
          email: clientEmail,
          type: 'individual',
          status: 'lead',
          notes: `Auto-created from email on ${new Date().toLocaleString()}`
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        return new Response('Failed to create client', { status: 500 });
      }

      clientId = newClient.id;
    }

    // Find or create conversation
    let conversationId = null;
    const { data: existingConversation } = await supabaseClient
      .from('email_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .eq('client_email', clientEmail)
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;
      
      // Update conversation
      await supabaseClient
        .from('email_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: emailData.body.substring(0, 100),
          unread_count: supabaseClient.sql`unread_count + 1`,
          subject: emailData.subject || existingConversation.subject,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabaseClient
        .from('email_conversations')
        .insert({
          user_id: userId,
          client_id: clientId,
          client_email: clientEmail,
          email_address: clientEmail,
          client_name: existingClient?.name || 'Unknown',
          subject: emailData.subject,
          last_message_at: new Date().toISOString(),
          last_message_preview: emailData.body.substring(0, 100),
          unread_count: 1,
          is_archived: false,
          is_starred: false
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return new Response('Failed to create conversation', { status: 500 });
      }

      conversationId = newConversation.id;
    }

    // Store the email message
    const { error: messageError } = await supabaseClient
      .from('email_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        direction: 'inbound',
        from_email: clientEmail,
        to_email: `${companyEmailPrefix}@fixlify.app`,
        subject: emailData.subject,
        body: emailData.body,
        html_body: emailData.htmlBody,
        is_read: false,
        email_id: emailData.messageId,
        status: 'received',
        metadata: {
          mailgun_timestamp: emailData.timestamp,
          webhook_received_at: new Date().toISOString()
        }
      });

    if (messageError) {
      console.error('Error storing email message:', messageError);
      return new Response('Failed to store message', { status: 500 });
    }

    console.log('Email processed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Email processed' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in email webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
