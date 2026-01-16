import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit costs
const SMART_REPLIES_CREDITS = 1;
const ENHANCED_REPLIES_CREDITS = 2; // More analysis = more credits
const INTENT_DETECTION_CREDITS = 1;
const COMPOSE_CREDITS = 2;
const SUMMARIZE_CREDITS = 2;
const ONE_CLICK_REPLY_CREDITS = 2;

interface Message {
  direction: "inbound" | "outbound";
  body: string;
  sender: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface GeminiRequest {
  action: "smart_replies" | "enhanced_smart_replies" | "one_click_reply" | "detect_intent" | "summarize" | "compose";
  messages?: Message[];
  clientName?: string;
  businessContext?: {
    businessName?: string;
    industry?: string;
    tone?: "professional" | "friendly" | "casual";
    activeJobs?: number;
    pendingEstimates?: number;
    pendingInvoices?: number;
    clientHistory?: string;
    urgencyLevel?: "low" | "normal" | "high" | "urgent";
  };
  prompt?: string;
  organization_id?: string;
  skip_credits?: boolean;
  // Enhanced options
  replyStyle?: "short" | "detailed" | "action-oriented";
  maxReplies?: number;
}

interface SmartReply {
  id: string;
  text: string;
  tone: "professional" | "friendly" | "empathetic" | "direct";
  confidence: number;
}

interface IntentDetection {
  intent: string;
  confidence: number;
  keywords: string[];
  suggestedAction?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      action,
      messages,
      clientName,
      businessContext,
      prompt,
      organization_id,
      skip_credits,
      replyStyle = "short",
      maxReplies = 3,
    }: GeminiRequest = await req.json();

    console.log("Gemini AI request:", { action, clientName, organization_id });

    // Get Gemini API key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("Gemini API key not found");
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Deduct credits
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (organization_id && !skip_credits && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const creditAmount =
        action === "smart_replies" ? SMART_REPLIES_CREDITS :
        action === "enhanced_smart_replies" ? ENHANCED_REPLIES_CREDITS :
        action === "one_click_reply" ? ONE_CLICK_REPLY_CREDITS :
        action === "detect_intent" ? INTENT_DETECTION_CREDITS :
        action === "compose" ? COMPOSE_CREDITS :
        SUMMARIZE_CREDITS;

      const { data: creditResult, error: creditError } = await supabase.rpc("use_credits", {
        p_organization_id: organization_id,
        p_amount: creditAmount,
        p_reference_type: `ai_${action}`,
        p_reference_id: null,
        p_description: `Gemini AI ${action}`,
        p_user_id: null,
        p_metadata: { action, clientName },
      });

      if (creditError) {
        console.error("Credit check error:", creditError);
        return new Response(
          JSON.stringify({ error: "Failed to check credits", details: creditError.message }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const result = creditResult?.[0] || creditResult;
      if (!result?.success) {
        return new Response(
          JSON.stringify({
            error: "Insufficient credits",
            message: result?.error_message || "Not enough credits",
            credits_required: creditAmount,
            current_balance: result?.new_balance || 0,
          }),
          { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Build prompt based on action
    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "smart_replies":
        systemPrompt = `You are a helpful assistant for a field service business${
          businessContext?.businessName ? ` called "${businessContext.businessName}"` : ""
        }. Generate 3 contextually appropriate reply suggestions for customer messages.

The tone should be ${businessContext?.tone || "professional"}.
${businessContext?.industry ? `Industry: ${businessContext.industry}` : ""}

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "replies": [
    {"id": "1", "text": "reply text", "tone": "professional", "confidence": 0.9},
    {"id": "2", "text": "reply text", "tone": "friendly", "confidence": 0.85},
    {"id": "3", "text": "reply text", "tone": "empathetic", "confidence": 0.8}
  ]
}`;

        const conversationHistory = messages?.slice(-5).map(
          (m) => `${m.direction === "inbound" ? clientName || "Client" : "You"}: ${m.body}`
        ).join("\n");

        userPrompt = `Generate 3 smart reply suggestions for this conversation:

${conversationHistory}

${businessContext?.activeJobs ? `Note: This client has ${businessContext.activeJobs} active job(s).` : ""}
${businessContext?.pendingInvoices ? `They also have ${businessContext.pendingInvoices} pending invoice(s).` : ""}

Keep replies concise (under 160 chars for SMS compatibility).`;
        break;

      case "enhanced_smart_replies":
        // Advanced smart replies with full conversation context analysis
        systemPrompt = `You are an elite AI assistant for "${businessContext?.businessName || "a field service business"}".
Your task is to generate highly contextual, intelligent reply suggestions based on:
1. The FULL conversation history (not just the last message)
2. The client's communication patterns and preferences
3. Any urgency indicators or emotional tone
4. Previous topics discussed
5. Business context (active jobs, pending documents)

ANALYSIS REQUIREMENTS:
- Identify the conversation flow and any unresolved questions
- Detect if the client seems frustrated, happy, or neutral
- Note any time-sensitive requests
- Consider what information would be most helpful

Tone: ${businessContext?.tone || "professional"}
${businessContext?.industry ? `Industry: ${businessContext.industry}` : ""}
${businessContext?.urgencyLevel ? `Urgency: ${businessContext.urgencyLevel}` : ""}

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "replies": [
    {
      "id": "1",
      "text": "reply text",
      "tone": "professional",
      "confidence": 0.95,
      "reasoning": "why this reply is appropriate"
    }
  ],
  "conversationInsights": {
    "clientSentiment": "positive|neutral|negative",
    "topicsDiscussed": ["topic1", "topic2"],
    "unresolvedQuestions": ["question1"],
    "suggestedFollowUp": "what to address next"
  }
}`;

        // Build rich conversation context
        const fullHistory = messages?.map((m, index) => {
          const speaker = m.direction === "inbound" ? (clientName || "Client") : "Business";
          const timestamp = new Date(m.created_at).toLocaleString();
          return `[${index + 1}] ${timestamp} - ${speaker}: ${m.body}`;
        }).join("\n\n") || "";

        // Analyze message patterns
        const inboundMessages = messages?.filter(m => m.direction === "inbound") || [];
        const outboundMessages = messages?.filter(m => m.direction === "outbound") || [];
        const avgInboundLength = inboundMessages.reduce((sum, m) => sum + m.body.length, 0) / (inboundMessages.length || 1);

        // Detect urgency keywords
        const lastInbound = inboundMessages[inboundMessages.length - 1]?.body || "";
        const urgencyKeywords = ["urgent", "asap", "emergency", "today", "now", "immediately", "help"];
        const hasUrgency = urgencyKeywords.some(k => lastInbound.toLowerCase().includes(k));

        userPrompt = `FULL CONVERSATION HISTORY (${messages?.length || 0} messages):
${fullHistory}

CONVERSATION STATISTICS:
- Total messages: ${messages?.length || 0}
- Client messages: ${inboundMessages.length}
- Your responses: ${outboundMessages.length}
- Client's average message length: ${Math.round(avgInboundLength)} characters
- Urgency detected: ${hasUrgency ? "YES" : "No"}

BUSINESS CONTEXT:
${businessContext?.activeJobs ? `- Active jobs with this client: ${businessContext.activeJobs}` : ""}
${businessContext?.pendingEstimates ? `- Pending estimates: ${businessContext.pendingEstimates}` : ""}
${businessContext?.pendingInvoices ? `- Pending invoices: ${businessContext.pendingInvoices}` : ""}
${businessContext?.clientHistory ? `- Client history: ${businessContext.clientHistory}` : ""}

Generate ${maxReplies} highly contextual reply options that:
1. Address ALL unresolved questions from the conversation
2. Match the client's communication style (${avgInboundLength > 100 ? "detailed" : "concise"})
3. ${hasUrgency ? "Acknowledge the urgency and provide immediate assistance" : "Maintain professional pacing"}
4. Include any relevant business context (jobs, estimates, invoices)

Style preference: ${replyStyle}
${replyStyle === "short" ? "Keep under 160 chars for SMS" : replyStyle === "detailed" ? "Be thorough but professional" : "Focus on next actionable steps"}`;
        break;

      case "one_click_reply":
        // Generate the BEST single reply for one-click sending
        systemPrompt = `You are an expert AI assistant for "${businessContext?.businessName || "a field service business"}".
Generate ONE PERFECT reply that can be sent immediately without editing.

Requirements:
- Must be complete and ready to send
- Must address the client's most recent concern
- Must be appropriate for the channel (SMS = under 160 chars, Email = can be longer)
- Must maintain professional tone while being personable
- Must include any necessary follow-up actions or commitments

IMPORTANT: Return ONLY valid JSON:
{
  "reply": {
    "text": "the perfect reply text",
    "confidence": 0.95,
    "suggestedAction": "optional next step for the business user"
  }
}`;

        const recentMessages = messages?.slice(-5) || [];
        const lastClientMsg = recentMessages.filter(m => m.direction === "inbound").pop();
        const contextMessages = recentMessages.map(m =>
          `${m.direction === "inbound" ? (clientName || "Client") : "You"}: ${m.body}`
        ).join("\n");

        userPrompt = `Recent conversation:
${contextMessages}

Last client message to respond to:
"${lastClientMsg?.body || "No message"}"

Generate the single best reply that:
1. Directly addresses their message
2. Is ready to send without any editing
3. ${replyStyle === "short" ? "Is SMS-friendly (under 160 chars)" : "Is appropriately detailed"}
4. Sounds natural and helpful

${businessContext?.activeJobs ? `Context: Client has ${businessContext.activeJobs} active job(s)` : ""}`;
        break;

      case "detect_intent":
        systemPrompt = `You are an intent detection system for a field service business. Analyze customer messages to detect their intent.

Possible intents: scheduling, inquiry, complaint, payment, confirmation, cancellation, follow_up, urgent, appreciation, unknown

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "intent": "scheduling",
  "confidence": 0.95,
  "keywords": ["schedule", "appointment", "book"],
  "suggestedAction": "Offer available time slots"
}`;

        const lastMessage = messages?.[messages.length - 1]?.body || prompt || "";
        userPrompt = `Analyze this message and detect the customer's intent:

"${lastMessage}"

Detect the primary intent and provide confidence score (0-1).`;
        break;

      case "summarize":
        systemPrompt = `You are a conversation summarizer for a field service business. Create concise summaries of customer conversations.

IMPORTANT: Return ONLY valid JSON:
{
  "summary": "Brief summary of the conversation",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["action 1"],
  "sentiment": "positive|neutral|negative"
}`;

        const fullConversation = messages?.map(
          (m) => `${m.direction === "inbound" ? "Client" : "Business"}: ${m.body}`
        ).join("\n");

        userPrompt = `Summarize this conversation:

${fullConversation}

Provide a brief summary, key points, and any action items.`;
        break;

      case "compose":
        systemPrompt = `You are a message composer for a field service business${
          businessContext?.businessName ? ` called "${businessContext.businessName}"` : ""
        }. Help compose professional messages.

Tone: ${businessContext?.tone || "professional"}
${businessContext?.industry ? `Industry: ${businessContext.industry}` : ""}

IMPORTANT: Return ONLY valid JSON:
{
  "message": "The composed message text",
  "subject": "Email subject if applicable"
}`;

        userPrompt = prompt || "Compose a follow-up message for a completed service.";
        break;
    }

    // Call Gemini API (using Gemini 3 Flash - latest model Jan 2025)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + "\n\n" + userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini response:", JSON.stringify(geminiData).substring(0, 500));

    // Extract text from Gemini response
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes("```json")) {
      jsonText = responseText.split("```json")[1]?.split("```")[0]?.trim() || responseText;
    } else if (responseText.includes("```")) {
      jsonText = responseText.split("```")[1]?.split("```")[0]?.trim() || responseText;
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      // Fallback responses based on action
      if (action === "smart_replies") {
        parsedResult = {
          replies: [
            { id: "1", text: "Thank you for reaching out! How can I help?", tone: "friendly", confidence: 0.7 },
            { id: "2", text: "I'll look into this and get back to you shortly.", tone: "professional", confidence: 0.6 },
            { id: "3", text: "Would you like to schedule a service call?", tone: "direct", confidence: 0.5 },
          ],
        };
      } else if (action === "detect_intent") {
        parsedResult = {
          intent: "unknown",
          confidence: 0.5,
          keywords: [],
          suggestedAction: "Review message manually",
        };
      } else {
        parsedResult = { message: responseText };
      }
    }

    // Format response based on action
    let result;
    if (action === "smart_replies" || action === "enhanced_smart_replies") {
      result = {
        replies: parsedResult.replies || [],
        insights: parsedResult.conversationInsights || null,
      };
    } else if (action === "one_click_reply") {
      result = parsedResult.reply || { text: "", confidence: 0 };
    } else if (action === "detect_intent") {
      result = parsedResult;
    } else {
      result = parsedResult;
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result,
        usage: {
          promptTokens: geminiData.usageMetadata?.promptTokenCount || 0,
          completionTokens: geminiData.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: geminiData.usageMetadata?.totalTokenCount || 0,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Gemini AI error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
