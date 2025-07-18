
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface AIRequest {
  prompt: string;
  context?: Record<string, any>;
}

interface AIResponse {
  response: string;
  suggestions: string[];
}

export const useIntelligentAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const location = useLocation();

  const getAIRecommendation = useCallback(async ({ prompt, context = {} }: AIRequest): Promise<AIResponse | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('intelligent-ai-assistant', {
        body: {
          prompt,
          context: {
            page: location.pathname,
            currentTask: context.currentTask,
            ...context
          },
          userId: user.id
        }
      });

      if (functionError) {
        throw functionError;
      }

      return data as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI recommendation';
      setError(errorMessage);
      console.error('AI recommendation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, location.pathname]);

  const provideFeedback = useCallback(async (recommendationId: string, isHelpful: boolean, feedback?: string) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_recommendations')
        .update({
          is_helpful: isHelpful,
          feedback: feedback || null,
          action_taken: true
        })
        .eq('id', recommendationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  }, [user]);

  return {
    getAIRecommendation,
    provideFeedback,
    isLoading,
    error
  };
};
