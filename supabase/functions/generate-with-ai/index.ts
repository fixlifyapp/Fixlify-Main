
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define the OpenAI API interface
interface OpenAIRequest {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const requestData = await req.json();
    console.log("Received request data:", JSON.stringify(requestData));
    
    // Extract parameters with more flexible fallbacks
    const {
      prompt,
      context,
      systemContext,
      userPrompt,
      data,
      mode = "text",
      temperature = 0.7,
      maxTokens = 800,
      fetchBusinessData = false,
      userId,
      forceRefresh = false // Parameter to force refresh regardless of cache
    } = requestData;

    // Validate that we have either prompt or userPrompt
    const finalUserPrompt = userPrompt || prompt || "";
    if (!finalUserPrompt) {
      return new Response(
        JSON.stringify({ error: "No prompt or userPrompt provided" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Use either provided context or systemContext, with a fallback
    const finalSystemContext = systemContext || context || "You are a helpful assistant.";
    
    console.log("Using context:", finalSystemContext);
    console.log("Using prompt:", finalUserPrompt);
    console.log("Force refresh:", forceRefresh);

    // If fetchBusinessData is true, get business data from Supabase
    let businessData = null;
    let userMessageContent = finalUserPrompt;
    
    if (fetchBusinessData && userId) {
      console.log("Fetching business data for user:", userId);
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase configuration");
      } else {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        try {
          // Add cache control for 7-day refresh cycle
          const cacheOptions = forceRefresh ? { count: "exact" } : undefined;
          
          // Fetch jobs data
          const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*', cacheOptions);
            
          if (jobsError) {
            console.error("Error fetching jobs:", jobsError);
          }
          
          // Fetch clients data
          const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*', cacheOptions);
            
          if (clientsError) {
            console.error("Error fetching clients:", clientsError);
          }

          // Fetch profiles data (team members)
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*', cacheOptions);
            
          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          }

          // Fetch invoices data
          const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('*', cacheOptions);
            
          if (invoicesError) {
            console.error("Error fetching invoices:", invoicesError);
          }

          // Fetch payments data
          const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('*', cacheOptions);
            
          if (paymentsError) {
            console.error("Error fetching payments:", paymentsError);
          }
          
          // Calculate business metrics
          if (jobs && clients) {
            const completedJobs = jobs.filter(job => job.status === "completed");
            const activeClients = clients.filter(client => client.status === "active");
            const totalRevenue = completedJobs.reduce((sum, job) => sum + parseFloat(job.revenue?.toString() || '0'), 0);
            
            // Add invoice data if available
            const totalFromInvoices = invoices 
              ? invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total?.toString() || '0'), 0)
              : 0;

            // Add payments data if available
            const totalPayments = payments
              ? payments.reduce((sum, payment) => sum + parseFloat(payment.amount?.toString() || '0'), 0)
              : 0;

            // Group jobs by service type
            const serviceTypes = {};
            jobs.forEach(job => {
              const serviceType = job.service || "Unspecified";
              if (!serviceTypes[serviceType]) {
                serviceTypes[serviceType] = {
                  count: 0,
                  revenue: 0,
                };
              }
              serviceTypes[serviceType].count++;
              serviceTypes[serviceType].revenue += parseFloat(job.revenue?.toString() || '0');
            });
            
            // Calculate top service
            let topService = { name: "None", count: 0, revenue: 0 };
            Object.entries(serviceTypes).forEach(([name, data]: [string, any]) => {
              if (data.revenue > topService.revenue) {
                topService = { name, count: data.count, revenue: data.revenue };
              }
            });
            
            // Calculate technician performance
            const techPerformance = {};
            jobs.forEach(job => {
              if (job.technician_id) {
                if (!techPerformance[job.technician_id]) {
                  techPerformance[job.technician_id] = { 
                    jobs: 0, 
                    completed: 0,
                    revenue: 0,
                    name: profiles?.find(p => p.id === job.technician_id)?.name || "Unknown",
                  };
                }
                techPerformance[job.technician_id].jobs++;
                if (job.status === "completed") {
                  techPerformance[job.technician_id].completed++;
                  techPerformance[job.technician_id].revenue += parseFloat(job.revenue?.toString() || '0');
                }
              }
            });
            
            // Find top technician
            let topTech = { id: "None", performance: 0, revenue: 0, name: "None" };
            Object.entries(techPerformance).forEach(([id, perf]: [string, any]) => {
              if (perf.revenue > topTech.revenue) {
                const performance = perf.jobs > 0 ? perf.completed / perf.jobs : 0;
                topTech = { id, performance, revenue: perf.revenue, name: perf.name };
              }
            });
            
            // Create business data object
            businessData = {
              metrics: {
                clients: {
                  total: clients.length,
                  active: activeClients.length,
                  newLastMonth: Math.floor(clients.length * 0.2)  // Approximation for demo
                },
                jobs: {
                  total: jobs.length,
                  completed: completedJobs.length,
                  inProgress: jobs.filter(job => job.status === "in-progress").length,
                  scheduled: jobs.filter(job => job.status === "scheduled").length,
                  lastUpdated: new Date().toISOString()
                },
                revenue: {
                  total: totalRevenue + totalFromInvoices,
                  average: completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0,
                  fromInvoices: totalFromInvoices,
                  fromJobs: totalRevenue,
                  collected: totalPayments
                },
                services: {
                  topService: topService.name,
                  distribution: serviceTypes
                },
                technicians: {
                  performance: techPerformance,
                  topPerformer: topTech.name
                }
              },
              period: "current month",
              refreshCycle: "7 days",
              lastRefreshed: new Date().toISOString()
            };
            
            console.log("Generated business data:", JSON.stringify(businessData));
            
            // Include business data in the prompt
            userMessageContent = `Here is the current business data: ${JSON.stringify(businessData)}\n\n${finalUserPrompt}`;
          }
        } catch (error) {
          console.error("Error calculating business metrics:", error);
        }
      }
    } else if (data) {
      // If data is provided directly in the request
      userMessageContent = `Here is the data: ${JSON.stringify(data)}\n\n${finalUserPrompt}`;
    }
    
    // Prepare the request body - always use GPT-4o
    const openaiRequest: OpenAIRequest = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: finalSystemContext
        },
        {
          role: "user",
          content: userMessageContent
        }
      ],
    };

    console.log("Sending to OpenAI:", JSON.stringify(openaiRequest));
    
    // Send the request to the OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error("OpenAI API error:", errorBody);
      throw new Error(`OpenAI API error: ${errorBody}`);
    }

    const result = await openaiResponse.json();
    const generatedText = result.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No response content from OpenAI");
    }

    console.log("Successfully generated response");

    // Return the AI-generated content and the business data
    return new Response(
      JSON.stringify({ 
        generatedText, 
        businessData,
        model: "gpt-4o", // Explicitly include model information
        lastRefreshed: new Date().toISOString(),
        refreshCycle: "7 days"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
