// Create AI Assistant via Telnyx API
// This can be run in browser console or as part of your app

async function createFixlifyAIAssistant() {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2'; // Your API key
  
  const assistantConfig = {
    name: "Fixlify AI Dispatcher",
    
    // Model configuration
    model: "anthropic/claude-3-haiku", // or "openai/gpt-4", "meta/llama-3"
    
    // Voice configuration
    voice: {
      provider: "telnyx",
      model: "KokoroTTS",
      voice_id: "Heart"
    },
    
    // Instructions for the AI
    instructions: `You are {{agent_name}}, the AI assistant for {{business_name}}, a professional repair shop.

## Business Information
- Hours: {{hours_of_operation}}
- Services: {{services_offered}}
- Current Time: {{current_date}} {{current_time}}

## Your Capabilities
1. Book appointments - collect name, phone, date, time, device, issue
2. Check repair status - ask for ticket number
3. Provide quotes - ask about device and issue
4. Answer questions about services

## Conversation Guidelines
- Be friendly and professional
- Use natural language with contractions
- Confirm important details
- If unsure, offer to transfer to human

When booking appointments:
1. Collect all required information
2. Confirm details with customer
3. Use book_appointment tool
4. Provide confirmation number`,
    
    // Greeting message
    greeting: "{{greeting}}",
    
    // Dynamic variables webhook
    dynamic_variables_webhook_url: "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook",
    
    // Enable features
    record_calls: false,
    transcribe_calls: true,
    enable_voicemail_detection: true,
    voicemail_message: "Please leave a message and we'll call you back.",
    
    // Temperature for responses
    temperature: 0.7,
    
    // Tools configuration
    tools: [
      {
        type: "webhook",
        name: "book_appointment",
        description: "Book a repair appointment",
        url: "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/book-appointment",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        parameters: {
          type: "object",
          properties: {
            customer_name: {
              type: "string",
              description: "Customer's full name"
            },
            phone: {
              type: "string", 
              description: "Customer's phone number"
            },
            date: {
              type: "string",
              description: "Appointment date YYYY-MM-DD"
            },
            time: {
              type: "string",
              description: "Appointment time HH:MM"
            },
            device: {
              type: "string",
              description: "Device type and model"
            },
            issue: {
              type: "string",
              description: "What needs to be fixed"
            }
          },
          required: ["customer_name", "phone", "date", "time", "device", "issue"]
        }
      },
      {
        type: "built_in",
        name: "hangup",
        description: "End the call when conversation is complete"
      }
    ],
    
    // Channel configuration
    channels: ["voice"], // Can also add "messaging" for SMS
    
    // Optional: Analytics insights
    insights: {
      enabled: true,
      summary: true,
      sentiment_analysis: true
    }
  };
  
  try {
    // Create the assistant
    const response = await fetch('https://api.telnyx.com/v2/ai/assistants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });
    
    const assistant = await response.json();
    
    if (response.ok) {
      console.log('✅ AI Assistant created successfully!');
      console.log('Assistant ID:', assistant.data.id);
      console.log('Assistant:', assistant.data);
      
      // Now assign phone number to the assistant
      await assignPhoneToAssistant(assistant.data.id);
      
      return assistant.data;
    } else {
      console.error('❌ Failed to create assistant:', assistant);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating assistant:', error);
    return null;
  }
}

// Assign phone number to the assistant
async function assignPhoneToAssistant(assistantId) {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2';
  const PHONE_NUMBER = '+14375249932';
  
  try {
    // Update phone number to use the assistant
    const response = await fetch(`https://api.telnyx.com/v2/phone_numbers/${PHONE_NUMBER}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        voice_enabled: true
      })
    });
    
    if (response.ok) {
      console.log('✅ Phone number assigned to assistant!');
    } else {
      console.error('❌ Failed to assign phone number');
    }
  } catch (error) {
    console.error('❌ Error assigning phone:', error);
  }
}

// List existing assistants
async function listAssistants() {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2';
  
  const response = await fetch('https://api.telnyx.com/v2/ai/assistants', {
    headers: {
      'Authorization': `Bearer ${TELNYX_API_KEY}`
    }
  });
  
  const data = await response.json();
  console.log('Existing assistants:', data.data);
  return data.data;
}

// Update existing assistant
async function updateAssistant(assistantId, updates) {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2';
  
  const response = await fetch(`https://api.telnyx.com/v2/ai/assistants/${assistantId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  console.log('Updated assistant:', data.data);
  return data.data;
}

// Delete assistant
async function deleteAssistant(assistantId) {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2';
  
  const response = await fetch(`https://api.telnyx.com/v2/ai/assistants/${assistantId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${TELNYX_API_KEY}`
    }
  });
  
  if (response.ok) {
    console.log('✅ Assistant deleted');
  } else {
    console.error('❌ Failed to delete assistant');
  }
}

// Test the assistant with a call
async function testAssistantCall(phoneNumber) {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2';
  
  const response = await fetch('https://api.telnyx.com/v2/calls', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: '+14375249932', // Your Telnyx number
      to: phoneNumber, // Number to call
      assistant_id: 'YOUR_ASSISTANT_ID' // Replace with actual assistant ID
    })
  });
  
  const call = await response.json();
  console.log('Test call initiated:', call);
}

// Run the creation
console.log('🚀 Creating Fixlify AI Assistant...');
console.log('Run: createFixlifyAIAssistant() to create');
console.log('Run: listAssistants() to see existing');
console.log('Run: updateAssistant(id, updates) to update');
console.log('Run: deleteAssistant(id) to delete');
console.log('Run: testAssistantCall("+1234567890") to test');