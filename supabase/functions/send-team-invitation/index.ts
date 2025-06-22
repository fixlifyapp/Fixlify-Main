import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create beautiful 3D email template with Fixlify branding
const createInvitationEmailTemplate = (data: {
  inviteeName: string;
  inviterName: string;
  companyName: string;
  role: string;
  invitationLink: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - ${data.companyName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.05) 10px,
                rgba(255, 255, 255, 0.05) 20px
            );
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { transform: translateX(-100px) translateY(-100px); }
            50% { transform: translateX(100px) translateY(100px); }
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: #ffffff;
            border-radius: 20px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .invitation-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
        }
        
        .invitation-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            background-size: 200% 100%;
            animation: gradient 2s ease infinite;
        }
        
        @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .invitation-details {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .invitation-details h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .cta-button:hover::before {
            left: 100%;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }
        
        .info-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }
        
        .info-section h3 {
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            color: #6b7280;
            position: relative;
            padding-left: 25px;
        }
        
        .info-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .expiry-notice {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            text-align: center;
        }
        
        .expiry-notice p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .invitation-details h2 {
                font-size: 20px;
            }
            
            .cta-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">F</div>
            <h1>You're Invited!</h1>
            <p>Join ${data.companyName} team</p>
        </div>
        
        <div class="content">
            <div class="invitation-card">
                <div class="invitation-details">
                    <h2>Welcome to the team, ${data.inviteeName}!</h2>
                    <div class="role-badge">${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</div>
                    <p style="color: #6b7280; margin-bottom: 25px;">
                        ${data.inviterName} has invited you to join <strong>${data.companyName}</strong> as a ${data.role}. 
                        Click the button below to accept your invitation and set up your account.
                    </p>
                    <a href="${data.invitationLink}" class="cta-button">Accept Invitation</a>
                </div>
            </div>
            
            <div class="info-section">
                <h3>What happens next?</h3>
                <ul class="info-list">
                    <li>Click the invitation link above</li>
                    <li>Create your secure password</li>
                    <li>Access your personalized dashboard</li>
                    <li>Start collaborating with your team</li>
                </ul>
            </div>
            
            <div class="expiry-notice">
                <p><strong>⏰ This invitation expires in 7 days</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>This invitation was sent by ${data.inviterName} from ${data.companyName}</p>
            <p>If you have any questions, please contact your team administrator.</p>
            <p style="margin-top: 20px;">
                <a href="https://fixlify.app">Powered by Fixlify</a>
            </p>
        </div>
    </div>
</body>
</html>`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Invalid token');
    }

    const { name, email, phone, role, serviceArea, sendWelcomeEmail } = await req.json();

    // Validate required fields
    if (!name || !email || !role) {
      throw new Error('Name, email, and role are required fields');
    }

    // Get company settings for branding
    const { data: companySettings } = await supabaseClient
      .from('company_settings')
      .select('company_name')
      .eq('user_id', userData.user.id)
      .single();

    const companyName = companySettings?.company_name || 'Your Company';

    // Get inviter profile
    const { data: inviterProfile } = await supabaseClient
      .from('profiles')
      .select('name')
      .eq('id', userData.user.id)
      .single();

    const inviterName = inviterProfile?.name || userData.user.email?.split('@')[0] || 'Team Admin';

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    
    // Create team invitation record
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('team_invitations')
      .insert({
        name,
        email,
        phone,
        role,
        service_area: serviceArea,
        invitation_token: invitationToken,
        invited_by: userData.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    // Create invitation link - use the correct frontend URL
    const baseUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8081';
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitationToken}`;

    let smsResult = null;
    let emailResult = null;

    // Send SMS if phone number is provided and user opted for welcome message
    if (phone && sendWelcomeEmail) {
      try {
        console.log('📱 Sending SMS invitation via Telnyx...');
        
        const smsMessage = `Hi ${name}! You've been invited to join ${companyName} as a ${role}. Complete your registration: ${invitationLink}. This link expires in 7 days.`;

        const { data: smsData, error: smsError } = await supabaseClient.functions.invoke('telnyx-sms', {
          body: {
            recipientPhone: phone,
            message: smsMessage,
            user_id: userData.user.id
          }
        });

        if (smsError) {
          console.error('SMS sending failed:', smsError);
          // Continue execution - SMS failure shouldn't block invitation
        } else {
          console.log('✅ SMS sent successfully');
          smsResult = smsData;
        }
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Don't fail the entire operation if SMS fails
      }
    }

    // Send email invitation if user opted for welcome message
    if (sendWelcomeEmail) {
      try {
        console.log('📧 Sending email invitation via Mailgun...');
        
        const emailHtml = createInvitationEmailTemplate({
          inviteeName: name,
          inviterName,
          companyName,
          role,
          invitationLink
        });

        const emailSubject = `You're invited to join ${companyName} team!`;

        const { data: emailData, error: emailError } = await supabaseClient.functions.invoke('send-email', {
          body: {
            to: email,
            subject: emailSubject,
            html: emailHtml,
            text: `Hi ${name}! You've been invited to join ${companyName} as a ${role}. Click this link to accept: ${invitationLink}. This invitation expires in 7 days.`
          }
        });

        if (emailError) {
          console.error('Email sending failed:', emailError);
          // Continue execution - email failure shouldn't block invitation
        } else {
          console.log('✅ Email sent successfully');
          emailResult = emailData;
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the entire operation if email fails
      }
    }

    // Determine success message based on what was sent
    let successMessage = `Invitation created for ${name}`;
    if (smsResult && emailResult) {
      successMessage = `Invitation sent to ${name} via SMS and email`;
    } else if (smsResult) {
      successMessage = `Invitation sent to ${name} via SMS`;
    } else if (emailResult) {
      successMessage = `Invitation sent to ${name} via email`;
    } else if (sendWelcomeEmail) {
      successMessage = `Invitation created for ${name} (delivery may have failed - check logs)`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation,
        message: successMessage,
        invitationLink,
        smsResult,
        emailResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-team-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
