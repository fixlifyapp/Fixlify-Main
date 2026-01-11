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
    const fullEmailAddress = `${companyEmailPrefix}@fixlify.app`;

    // ============================================
    // NEW: Try organization-scoped lookup first
    // ============================================
    let organizationId: string | null = null;
    let userId: string | null = null;
    let organizationName: string | null = null;

    // Step 1: Check organization_communication_settings for organization email
    const { data: orgSettings, error: orgError } = await supabaseClient
      .from('organization_communication_settings')
      .select('organization_id')
      .eq('organization_email_address', fullEmailAddress)
      .single();

    if (orgSettings && !orgError) {
      organizationId = orgSettings.organization_id;
      console.log('Found organization by email:', organizationId);

      // Get organization details
      const { data: org } = await supabaseClient
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();

      organizationName = org?.name || null;

      // Get a default user (admin) for this organization for backwards compatibility
      const { data: adminProfile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminProfile) {
        userId = adminProfile.id;
      }
    }

    // Step 2: Fallback to legacy user-scoped lookup
    if (!organizationId) {
      // Try profiles table
      const { data: userData, error: userError } = await supabaseClient
        .from('profiles')
        .select('id, organization_id, company_name')
        .eq('company_email_address', fullEmailAddress)
        .single();

      if (userData && !userError) {
        userId = userData.id;
        organizationId = userData.organization_id;
        organizationName = userData.company_name;
        console.log('Found user by email (legacy):', userId);
      } else {
        // Try company_settings table
        const { data: companyData, error: companyError } = await supabaseClient
          .from('company_settings')
          .select('user_id, company_name')
          .eq('company_email_address', fullEmailAddress)
          .single();

        if (companyData && !companyError) {
          userId = companyData.user_id;
          organizationName = companyData.company_name;

          // Get organization_id from profile
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('organization_id')
            .eq('id', userId)
            .single();

          organizationId = profile?.organization_id || null;
          console.log('Found user in company_settings (legacy):', userId);
        }
      }
    }

    if (!userId && !organizationId) {
      console.error('Email recipient not found:', fullEmailAddress);
      return new Response('Recipient not found', { status: 404 });
    }

    // Extract client email from sender
    const clientEmail = emailData.sender.toLowerCase().replace(/.*<([^>]+)>.*/, '$1').trim();

    // Find or create client (organization-scoped if possible)
    let clientId = null;
    let clientName = 'Unknown';

    // Build query based on whether we have organization or user scope
    let clientQuery = supabaseClient
      .from('clients')
      .select('id, name')
      .eq('email', clientEmail);

    if (organizationId) {
      clientQuery = clientQuery.eq('organization_id', organizationId);
    } else if (userId) {
      clientQuery = clientQuery.eq('user_id', userId);
    }

    const { data: existingClient } = await clientQuery.single();

    if (existingClient) {
      clientId = existingClient.id;
      clientName = existingClient.name;
    } else {
      // Extract name from email if possible
      const emailParts = clientEmail.split('@');
      const nameParts = emailParts[0].split(/[._-]/);
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Client';
      clientName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;

      // Create new client
      const clientInsert: Record<string, unknown> = {
        name: clientName,
        email: clientEmail,
        type: 'individual',
        status: 'lead',
        notes: `Auto-created from email on ${new Date().toLocaleString()}`
      };

      // Add proper scoping
      if (organizationId) {
        clientInsert.organization_id = organizationId;
      }
      if (userId) {
        clientInsert.user_id = userId;
      }

      const { data: newClient, error: createError } = await supabaseClient
        .from('clients')
        .insert(clientInsert)
        .select()
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        // Don't fail - continue without client
      } else {
        clientId = newClient.id;
      }
    }

    // Find or create conversation (organization-scoped)
    let conversationId = null;

    // Build conversation query
    let convQuery = supabaseClient
      .from('email_conversations')
      .select('id, subject')
      .eq('client_email', clientEmail);

    if (organizationId) {
      convQuery = convQuery.eq('organization_id', organizationId);
    } else if (userId) {
      convQuery = convQuery.eq('user_id', userId);
    }

    if (clientId) {
      convQuery = convQuery.eq('client_id', clientId);
    }

    const { data: existingConversation } = await convQuery.single();

    if (existingConversation) {
      conversationId = existingConversation.id;

      // Update conversation with raw SQL for increment
      const { error: updateError } = await supabaseClient.rpc('increment_unread_count', {
        conv_id: conversationId
      }).catch(() => {
        // Fallback if RPC doesn't exist
        return supabaseClient
          .from('email_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: emailData.body.substring(0, 100),
            subject: emailData.subject || existingConversation.subject,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      });

      // Also try direct update
      await supabaseClient
        .from('email_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: emailData.body.substring(0, 100),
          subject: emailData.subject || existingConversation.subject,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

    } else {
      // Create new conversation
      const convInsert: Record<string, unknown> = {
        client_id: clientId,
        client_email: clientEmail,
        email_address: clientEmail,
        client_name: clientName,
        subject: emailData.subject,
        last_message_at: new Date().toISOString(),
        last_message_preview: emailData.body.substring(0, 100),
        unread_count: 1,
        is_archived: false,
        is_starred: false
      };

      // Add proper scoping
      if (organizationId) {
        convInsert.organization_id = organizationId;
      }
      if (userId) {
        convInsert.user_id = userId;
      }

      const { data: newConversation, error: convError } = await supabaseClient
        .from('email_conversations')
        .insert(convInsert)
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return new Response('Failed to create conversation', { status: 500 });
      }

      conversationId = newConversation.id;
    }

    // Store the email message
    const messageInsert: Record<string, unknown> = {
      conversation_id: conversationId,
      direction: 'inbound',
      from_email: clientEmail,
      to_email: fullEmailAddress,
      subject: emailData.subject,
      body: emailData.body,
      html_body: emailData.htmlBody,
      is_read: false,
      email_id: emailData.messageId,
      status: 'received',
      metadata: {
        mailgun_timestamp: emailData.timestamp,
        webhook_received_at: new Date().toISOString(),
        organization_id: organizationId
      }
    };

    // Add proper scoping
    if (organizationId) {
      messageInsert.organization_id = organizationId;
    }
    if (userId) {
      messageInsert.user_id = userId;
    }

    const { error: messageError } = await supabaseClient
      .from('email_messages')
      .insert(messageInsert);

    if (messageError) {
      console.error('Error storing email message:', messageError);
      return new Response('Failed to store message', { status: 500 });
    }

    console.log('Email processed successfully', {
      organizationId,
      conversationId,
      clientId
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email processed',
        organizationId,
        conversationId
      }),
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
