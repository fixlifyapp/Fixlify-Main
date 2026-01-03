import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  name: string;
  email: string;
  phone?: string;
  role: string;
  serviceArea?: string;
  sendWelcomeEmail: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get user's JWT from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create user client to get the current user
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's organization
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile?.organization_id) {
      return new Response(
        JSON.stringify({ error: "User organization not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: InvitationRequest = await req.json();
    const { name, email, phone, role, serviceArea, sendWelcomeEmail } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return new Response(
        JSON.stringify({ error: "Name, email, and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();

    // Check if team_invitations table exists, if not create directly in profiles
    // For now, we'll create the user directly in profiles as a pending team member

    // Check if email already exists in profiles
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a new auth user with a temporary password
    const tempPassword = crypto.randomUUID();

    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name,
        role,
        invited_by: user.id,
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile for the new user
    const { error: profileCreateError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newAuthUser.user.id,
        name,
        email,
        phone: phone || null,
        role,
        organization_id: userProfile.organization_id,
        service_area: serviceArea || null,
        has_completed_onboarding: true, // Team members don't need onboarding
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileCreateError) {
      console.error("Error creating profile:", profileCreateError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileCreateError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send welcome communications if requested
    if (sendWelcomeEmail) {
      // Generate password reset link so user can set their own password
      let actionLink: string | null = null;

      try {
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: {
            redirectTo: `${Deno.env.get("SITE_URL") || "https://app.fixlify.com"}/auth/reset-password`,
          },
        });

        if (!resetError && resetData?.properties?.action_link) {
          actionLink = resetData.properties.action_link;
        }
      } catch (linkErr) {
        console.error("Error generating reset link:", linkErr);
      }

      // Send email
      if (actionLink) {
        try {
          const emailHtml = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1f2937;">Welcome to Fixlify, ${name}!</h2>
              <p style="color: #4b5563; font-size: 16px;">You've been invited to join the team as a <strong>${role}</strong>.</p>
              <p style="color: #4b5563; font-size: 16px;">Click the button below to set up your password and get started:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${actionLink}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">Set Up Your Account</a>
              </p>
              <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">Welcome to the team! 🎉</p>
            </div>
          `;

          await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: email,
              subject: "Welcome to Fixlify - Set Up Your Account",
              html: emailHtml,
              userId: user.id,
              metadata: {
                type: "team_invitation",
                invitee_name: name,
                invitee_role: role,
              },
            }),
          });
          console.log(`Welcome email sent to ${email}`);
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
          // Don't fail the whole request if email fails
        }
      }

      // Send SMS if phone provided - use organization's primary number
      if (phone && actionLink) {
        try {
          const smsMessage = `Welcome to Fixlify, ${name}! You've been invited as a ${role}. Set up your account: ${actionLink}`;

          await fetch(`${supabaseUrl}/functions/v1/telnyx-sms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              recipientPhone: phone,
              message: smsMessage,
              user_id: user.id, // This auto-fetches organization's primary phone number
              metadata: {
                type: "team_invitation",
                invitee_name: name,
                invitee_role: role,
              },
            }),
          });
          console.log(`Welcome SMS sent to ${phone}`);
        } catch (smsErr) {
          console.error("Failed to send welcome SMS:", smsErr);
          // Don't fail the whole request if SMS fails
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Team member ${name} has been added successfully${sendWelcomeEmail ? " and a welcome email has been sent" : ""}`,
        user: {
          id: newAuthUser.user.id,
          name,
          email,
          role,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-team-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
