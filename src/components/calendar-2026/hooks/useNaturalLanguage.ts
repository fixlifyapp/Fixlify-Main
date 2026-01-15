// Natural Language Processing Hook for Calendar Commands
// Uses Gemini AI to parse scheduling intents

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ParsedIntent } from '../types';

interface NLPContext {
  technicians?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
  jobTypes?: string[];
}

interface UseNaturalLanguageReturn {
  parseCommand: (command: string, context?: NLPContext) => Promise<ParsedIntent>;
  isLoading: boolean;
  error: string | null;
}

// Local parsing for common patterns (fast, no API call needed)
function parseLocally(command: string, context?: NLPContext): ParsedIntent | null {
  const lowerCommand = command.toLowerCase().trim();
  const intent: ParsedIntent = { action: '' };

  // Detect action type
  if (lowerCommand.startsWith('schedule') || lowerCommand.includes('book')) {
    intent.action = 'schedule';
  } else if (lowerCommand.startsWith('move') || lowerCommand.includes('reschedule')) {
    intent.action = 'move';
  } else if (lowerCommand.startsWith('show') || lowerCommand.startsWith('find') || lowerCommand.startsWith('search')) {
    intent.action = 'find';
  } else if (lowerCommand.includes('optimize') || lowerCommand.includes('route')) {
    intent.action = 'optimize';
  } else if (lowerCommand.startsWith('cancel') || lowerCommand.includes('delete')) {
    intent.action = 'cancel';
  } else if (lowerCommand.startsWith('create') || lowerCommand.startsWith('new')) {
    intent.action = 'create';
  } else {
    return null; // Can't parse locally, need AI
  }

  // Find technician name
  if (context?.technicians) {
    for (const tech of context.technicians) {
      const techNameLower = tech.name.toLowerCase();
      const firstName = techNameLower.split(' ')[0];
      if (lowerCommand.includes(techNameLower) || lowerCommand.includes(firstName)) {
        intent.technician = tech.name;
        intent.technicianId = tech.id;
        break;
      }
    }
  }

  // Find client name
  if (context?.clients) {
    for (const client of context.clients) {
      const clientNameLower = client.name.toLowerCase();
      const firstName = clientNameLower.split(' ')[0];
      if (lowerCommand.includes(clientNameLower) || lowerCommand.includes(firstName)) {
        intent.client = client.name;
        intent.clientId = client.id;
        break;
      }
    }
  }

  // Parse date
  const today = new Date();
  if (lowerCommand.includes('today')) {
    intent.date = today;
  } else if (lowerCommand.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    intent.date = tomorrow;
  } else if (lowerCommand.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    intent.date = nextWeek;
  } else if (lowerCommand.includes('monday')) {
    intent.date = getNextDayOfWeek(1);
  } else if (lowerCommand.includes('tuesday')) {
    intent.date = getNextDayOfWeek(2);
  } else if (lowerCommand.includes('wednesday')) {
    intent.date = getNextDayOfWeek(3);
  } else if (lowerCommand.includes('thursday')) {
    intent.date = getNextDayOfWeek(4);
  } else if (lowerCommand.includes('friday')) {
    intent.date = getNextDayOfWeek(5);
  }

  // Parse time preference
  if (lowerCommand.includes('morning') || lowerCommand.includes('am')) {
    intent.timePreference = 'morning';
  } else if (lowerCommand.includes('afternoon')) {
    intent.timePreference = 'afternoon';
  } else if (lowerCommand.includes('evening') || lowerCommand.includes('pm')) {
    intent.timePreference = 'evening';
  }

  // Parse job type (common patterns)
  const jobTypes = [
    'ac repair', 'hvac', 'plumbing', 'electrical', 'appliance',
    'heating', 'cooling', 'water heater', 'drain', 'pipe',
    'installation', 'maintenance', 'tune-up', 'inspection',
    'emergency', 'service call'
  ];

  for (const jobType of jobTypes) {
    if (lowerCommand.includes(jobType)) {
      intent.jobType = jobType.charAt(0).toUpperCase() + jobType.slice(1);
      break;
    }
  }

  return intent;
}

function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const resultDate = new Date(today);
  resultDate.setDate(today.getDate() + ((7 + dayOfWeek - today.getDay()) % 7 || 7));
  return resultDate;
}

export function useNaturalLanguage(): UseNaturalLanguageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCommand = useCallback(async (
    command: string,
    context?: NLPContext
  ): Promise<ParsedIntent> => {
    setError(null);

    // Try local parsing first (fast path)
    const localResult = parseLocally(command, context);
    if (localResult && localResult.action) {
      // If we have a basic understanding, return it
      // Only call AI if we need more sophisticated parsing
      const hasEnoughInfo = localResult.action && (
        localResult.technician ||
        localResult.date ||
        localResult.action === 'optimize' ||
        localResult.action === 'find'
      );

      if (hasEnoughInfo) {
        return localResult;
      }
    }

    // For complex commands, use Gemini AI
    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('gemini-ai', {
        body: {
          action: 'parse_scheduling_command',
          prompt: `Parse this scheduling command and extract the intent:
            Command: "${command}"

            Available technicians: ${context?.technicians?.map(t => t.name).join(', ') || 'none provided'}
            Available clients: ${context?.clients?.map(c => c.name).join(', ') || 'none provided'}

            Return a JSON object with these fields:
            - action: "schedule" | "move" | "find" | "optimize" | "create" | "cancel"
            - technician: name if mentioned
            - client: name if mentioned
            - jobType: type of job if mentioned
            - date: ISO date string if mentioned (relative to today: ${new Date().toISOString().split('T')[0]})
            - timePreference: "morning" | "afternoon" | "evening" | "any"
            - location: address if mentioned
            - duration: estimated minutes if mentioned

            Only include fields that are explicitly mentioned or can be clearly inferred.`,
        },
      });

      if (fnError) throw fnError;

      // Parse the AI response
      if (data?.response) {
        try {
          // Extract JSON from response
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Convert date string back to Date object
            if (parsed.date) {
              parsed.date = new Date(parsed.date);
            }
            // Map technician name to ID
            if (parsed.technician && context?.technicians) {
              const tech = context.technicians.find(
                t => t.name.toLowerCase().includes(parsed.technician.toLowerCase())
              );
              if (tech) {
                parsed.technicianId = tech.id;
              }
            }
            // Map client name to ID
            if (parsed.client && context?.clients) {
              const client = context.clients.find(
                c => c.name.toLowerCase().includes(parsed.client.toLowerCase())
              );
              if (client) {
                parsed.clientId = client.id;
              }
            }
            return parsed;
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }

      // Fallback to local result if AI failed
      return localResult || { action: 'find' };
    } catch (err) {
      console.error('NLP Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse command');
      // Return local result as fallback
      return localResult || { action: 'find' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { parseCommand, isLoading, error };
}

// Additional hook for generating AI suggestions
export function useAISuggestions() {
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = useCallback(async (
    context: {
      currentTime: Date;
      unassignedJobs: number;
      technicianCount: number;
      hasGaps: boolean;
    }
  ): Promise<string[]> => {
    const suggestions: string[] = [];

    // Simple rule-based suggestions (fast, no API needed)
    if (context.unassignedJobs > 0) {
      suggestions.push(`You have ${context.unassignedJobs} unassigned jobs. Try "auto-schedule all"`);
    }

    if (context.hasGaps) {
      suggestions.push('I noticed some gaps in the schedule. Say "fill empty slots" to optimize');
    }

    const hour = context.currentTime.getHours();
    if (hour >= 7 && hour <= 9) {
      suggestions.push('Good morning! Say "optimize routes" to plan the best route for today');
    }

    return suggestions;
  }, []);

  return { getSuggestions, isLoading };
}
