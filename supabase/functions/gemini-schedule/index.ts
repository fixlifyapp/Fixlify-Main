import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit costs for scheduling operations
const CREDITS = {
  parse_command: 1,
  find_optimal_slot: 2,
  optimize_routes: 3,
  auto_schedule: 5,
  generate_insights: 2,
};

interface Technician {
  id: string;
  name: string;
  skills?: string[];
  workload?: number; // hours already scheduled
}

interface Job {
  id: string;
  title: string;
  clientName?: string;
  address?: string;
  duration: number; // minutes
  priority?: "low" | "normal" | "high" | "urgent";
  requiredSkills?: string[];
  latitude?: number;
  longitude?: number;
}

interface TimeSlot {
  start: string; // ISO string
  end: string;
  technicianId: string;
  technicianName: string;
}

interface ScheduleRequest {
  action:
    | "parse_command"
    | "find_optimal_slot"
    | "optimize_routes"
    | "auto_schedule"
    | "generate_insights";

  // For parse_command
  command?: string;

  // Context
  technicians?: Technician[];
  clients?: Array<{ id: string; name: string }>;
  existingJobs?: Job[];
  availableSlots?: TimeSlot[];

  // For find_optimal_slot
  jobToSchedule?: Job;
  preferredDate?: string;
  preferredTimeOfDay?: "morning" | "afternoon" | "evening" | "any";
  preferredTechnicianId?: string;

  // For optimize_routes
  routeDate?: string;
  technicianId?: string;
  jobs?: Job[];

  // For generate_insights
  scheduleDate?: string;

  // Billing
  organization_id?: string;
  skip_credits?: boolean;
}

interface SchedulingInsight {
  type: "optimization" | "warning" | "suggestion" | "weather" | "client_preference";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  actionable?: boolean;
  suggestedAction?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ScheduleRequest = await req.json();
    const { action, organization_id, skip_credits } = request;

    console.log("Gemini Schedule request:", { action, organization_id });

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
      const creditAmount = CREDITS[action] || 1;

      const { data: creditResult, error: creditError } = await supabase.rpc("use_credits", {
        p_organization_id: organization_id,
        p_amount: creditAmount,
        p_reference_type: `ai_schedule_${action}`,
        p_reference_id: null,
        p_description: `Gemini AI Schedule: ${action}`,
        p_user_id: null,
        p_metadata: { action },
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
      case "parse_command": {
        systemPrompt = `You are an AI assistant for a field service scheduling system. Parse natural language commands into structured scheduling intents.

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "action": "schedule" | "reschedule" | "find" | "optimize" | "cancel" | "create" | "show",
  "technician": "technician name if mentioned",
  "technicianId": "id if matched",
  "client": "client name if mentioned",
  "clientId": "id if matched",
  "jobType": "type of job if mentioned",
  "date": "YYYY-MM-DD format if mentioned",
  "time": "HH:MM format if specific time mentioned",
  "timePreference": "morning" | "afternoon" | "evening" | "any",
  "duration": number in minutes if mentioned,
  "location": "address if mentioned",
  "confidence": 0.0 to 1.0
}

Only include fields that are explicitly mentioned or clearly implied.`;

        const techniciansList = request.technicians?.map(t => `${t.name} (ID: ${t.id})`).join(", ") || "none";
        const clientsList = request.clients?.map(c => `${c.name} (ID: ${c.id})`).join(", ") || "none";
        const today = new Date().toISOString().split("T")[0];

        userPrompt = `Parse this scheduling command:
"${request.command}"

Context:
- Today's date: ${today}
- Available technicians: ${techniciansList}
- Known clients: ${clientsList}

Extract the intent and match names to IDs if possible.`;
        break;
      }

      case "find_optimal_slot": {
        systemPrompt = `You are an AI scheduling optimizer for a field service business. Analyze available time slots and recommend the best option considering:

1. Technician workload balance - distribute jobs evenly
2. Skills match - if the job requires specific skills
3. Geographic efficiency - minimize travel between jobs
4. Client preferences - if known
5. Time of day appropriateness - some jobs are better in morning/afternoon
6. Urgency level - urgent jobs need sooner slots

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "recommendedSlot": {
    "start": "ISO datetime string",
    "end": "ISO datetime string",
    "technicianId": "id",
    "technicianName": "name"
  },
  "score": 0-100,
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "alternatives": [
    {
      "slot": { "start": "ISO", "end": "ISO", "technicianId": "id", "technicianName": "name" },
      "score": 0-100,
      "tradeoff": "why this is second choice"
    }
  ],
  "warnings": ["any scheduling conflicts or concerns"]
}`;

        const job = request.jobToSchedule;
        const slots = request.availableSlots || [];
        const techs = request.technicians || [];

        userPrompt = `Find the optimal time slot for this job:

Job Details:
- Title: ${job?.title || "Service Call"}
- Duration: ${job?.duration || 60} minutes
- Client: ${job?.clientName || "Not specified"}
- Address: ${job?.address || "Not specified"}
- Priority: ${job?.priority || "normal"}
${job?.requiredSkills?.length ? `- Required skills: ${job.requiredSkills.join(", ")}` : ""}

Preferences:
- Preferred date: ${request.preferredDate || "Any available"}
- Time of day: ${request.preferredTimeOfDay || "any"}
- Preferred technician: ${request.preferredTechnicianId ? techs.find(t => t.id === request.preferredTechnicianId)?.name || "Specified" : "Any"}

Available Slots (${slots.length} total):
${slots.slice(0, 20).map(s => `- ${s.start} to ${s.end} with ${s.technicianName}`).join("\n")}

Technician Info:
${techs.map(t => `- ${t.name}: ${t.workload || 0}h scheduled today${t.skills?.length ? `, skills: ${t.skills.join(", ")}` : ""}`).join("\n")}

Recommend the best slot with detailed reasoning.`;
        break;
      }

      case "optimize_routes": {
        systemPrompt = `You are a route optimization AI for a field service business. Optimize the order of jobs to minimize total travel time and distance.

Consider:
1. Geographic proximity - cluster nearby jobs
2. Time windows - respect scheduled times where possible
3. Traffic patterns - mornings may be slower in certain areas
4. Job duration - ensure enough time between jobs
5. End-of-day return - factor in return to home base

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "optimizedOrder": ["jobId1", "jobId2", "jobId3"],
  "originalDistance": number in km,
  "optimizedDistance": number in km,
  "distanceSaved": number in km,
  "timeSaved": number in minutes,
  "routeDetails": [
    {
      "jobId": "id",
      "order": 1,
      "estimatedArrival": "HH:MM",
      "travelTimeFromPrevious": number in minutes
    }
  ],
  "suggestions": ["any optimization tips"]
}`;

        const routeJobs = request.jobs || [];
        userPrompt = `Optimize the route for ${request.technicianId ? "technician " + request.technicianId : "the day"} on ${request.routeDate || "today"}:

Jobs to optimize (${routeJobs.length} total):
${routeJobs.map((j, i) => `${i + 1}. ${j.title} - ${j.address || "No address"} (${j.duration}min)${j.latitude && j.longitude ? ` [${j.latitude}, ${j.longitude}]` : ""}`).join("\n")}

Find the most efficient route order to minimize travel time.`;
        break;
      }

      case "auto_schedule": {
        systemPrompt = `You are an AI auto-scheduler for a field service business. Given unassigned jobs and available technicians, create an optimal schedule.

Consider:
1. Workload balance - distribute jobs fairly
2. Skills matching - assign to qualified technicians
3. Geographic clustering - group nearby jobs
4. Priority handling - urgent jobs first
5. Time efficiency - minimize idle time

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "assignments": [
    {
      "jobId": "id",
      "technicianId": "id",
      "technicianName": "name",
      "suggestedStart": "ISO datetime",
      "suggestedEnd": "ISO datetime",
      "confidence": 0-100,
      "reasoning": "why this assignment"
    }
  ],
  "unassignable": [
    {
      "jobId": "id",
      "reason": "why couldn't be assigned"
    }
  ],
  "summary": {
    "totalAssigned": number,
    "totalUnassignable": number,
    "estimatedEfficiency": 0-100
  }
}`;

        const unassignedJobs = request.existingJobs || [];
        const availableTechs = request.technicians || [];
        const targetDate = request.preferredDate || new Date().toISOString().split("T")[0];

        userPrompt = `Auto-schedule these unassigned jobs for ${targetDate}:

Unassigned Jobs (${unassignedJobs.length}):
${unassignedJobs.map(j => `- ${j.title}: ${j.duration}min, ${j.priority || "normal"} priority${j.address ? `, at ${j.address}` : ""}`).join("\n")}

Available Technicians (${availableTechs.length}):
${availableTechs.map(t => `- ${t.name}: ${t.workload || 0}h already scheduled${t.skills?.length ? `, skills: ${t.skills.join(", ")}` : ""}`).join("\n")}

Create optimal assignments for all jobs.`;
        break;
      }

      case "generate_insights": {
        systemPrompt = `You are an AI insights generator for a field service scheduling system. Analyze the schedule and provide actionable insights.

Categories of insights:
1. Optimization opportunities - ways to improve efficiency
2. Warnings - potential issues or conflicts
3. Suggestions - proactive recommendations
4. Client preferences - patterns to leverage
5. Workload balance - team distribution

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "insights": [
    {
      "type": "optimization" | "warning" | "suggestion" | "client_preference" | "workload",
      "priority": "low" | "medium" | "high",
      "title": "Short title",
      "description": "Detailed description",
      "actionable": true/false,
      "suggestedAction": "What to do if actionable"
    }
  ],
  "scheduleHealth": {
    "score": 0-100,
    "factors": {
      "workloadBalance": 0-100,
      "routeEfficiency": 0-100,
      "utilizationRate": 0-100
    }
  },
  "summary": "One sentence summary of schedule state"
}`;

        const scheduleJobs = request.existingJobs || [];
        const insightTechs = request.technicians || [];

        userPrompt = `Analyze this schedule for ${request.scheduleDate || "today"} and generate insights:

Scheduled Jobs (${scheduleJobs.length}):
${scheduleJobs.map(j => `- ${j.title}: ${j.duration}min, ${j.clientName || "No client"}`).join("\n")}

Technician Workloads:
${insightTechs.map(t => `- ${t.name}: ${t.workload || 0}h scheduled`).join("\n")}

Provide actionable insights to optimize the schedule.`;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
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
            temperature: 0.3, // Lower temperature for more consistent scheduling decisions
            maxOutputTokens: 2048,
            topP: 0.9,
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
    console.log("Gemini response received for action:", action);

    // Extract text from Gemini response
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response
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
      console.error("Failed to parse Gemini response:", responseText.substring(0, 500));

      // Return fallback based on action
      switch (action) {
        case "parse_command":
          parsedResult = {
            action: "find",
            confidence: 0.3,
            error: "Could not parse command reliably"
          };
          break;
        case "find_optimal_slot":
          parsedResult = {
            recommendedSlot: null,
            score: 0,
            reasoning: ["AI parsing failed, using fallback"],
            alternatives: [],
            warnings: ["Manual selection recommended"]
          };
          break;
        case "optimize_routes":
          parsedResult = {
            optimizedOrder: request.jobs?.map(j => j.id) || [],
            originalDistance: 0,
            optimizedDistance: 0,
            distanceSaved: 0,
            timeSaved: 0,
            suggestions: ["Could not optimize, keeping original order"]
          };
          break;
        case "auto_schedule":
          parsedResult = {
            assignments: [],
            unassignable: request.existingJobs?.map(j => ({ jobId: j.id, reason: "AI service unavailable" })) || [],
            summary: { totalAssigned: 0, totalUnassignable: request.existingJobs?.length || 0, estimatedEfficiency: 0 }
          };
          break;
        case "generate_insights":
          parsedResult = {
            insights: [{
              type: "warning",
              priority: "low",
              title: "AI Insights Unavailable",
              description: "Could not generate AI insights at this time",
              actionable: false
            }],
            scheduleHealth: { score: 50, factors: { workloadBalance: 50, routeEfficiency: 50, utilizationRate: 50 } },
            summary: "Analysis unavailable"
          };
          break;
        default:
          parsedResult = { error: "Parsing failed" };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result: parsedResult,
        usage: {
          promptTokens: geminiData.usageMetadata?.promptTokenCount || 0,
          completionTokens: geminiData.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: geminiData.usageMetadata?.totalTokenCount || 0,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini Schedule error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
