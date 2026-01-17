// AI Job Suggestions Component
// Shows smart technician recommendations based on skills and availability

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  User,
  Clock,
  Wrench,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  Calendar,
  Award,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

interface TechnicianSuggestion {
  technician: {
    id: string;
    name: string;
    skills: string[];
    color?: string;
  };
  score: number;
  reasoning: string[];
  skillMatchScore: number;
  availableSlot: {
    start: string;
    end: string;
  } | null;
  jobsToday: number;
}

interface AIJobSuggestionsProps {
  jobTypeId?: string;
  jobTypeName?: string;
  propertyCoords?: { lat: number; lng: number };
  onAccept: (suggestion: {
    technicianId: string;
    technicianName: string;
    slotStart?: string;
    slotEnd?: string;
  }) => void;
  onDismiss?: () => void;
  className?: string;
}

export function AIJobSuggestions({
  jobTypeId,
  jobTypeName,
  propertyCoords,
  onAccept,
  onDismiss,
  className,
}: AIJobSuggestionsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<TechnicianSuggestion[]>([]);
  const [jobType, setJobType] = useState<string>(jobTypeName || "");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [accepted, setAccepted] = useState<string | null>(null);

  // Sync jobTypeName prop to local state
  useEffect(() => {
    if (jobTypeName) {
      setJobType(jobTypeName);
    }
  }, [jobTypeName]);

  // Clear accepted state when job type changes
  useEffect(() => {
    setAccepted(null);
  }, [jobTypeId]);

  // Fetch suggestions when job type changes
  const fetchSuggestions = useCallback(async () => {
    if (!user || !jobTypeId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "ai-scheduling-assistant",
        {
          body: {
            action: "get_smart_suggestions",
            organization_id: user.id,
            job_type_id: jobTypeId,
            property_coords: propertyCoords,
            estimated_duration: 60,
          },
        }
      );

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSuggestions(data.suggestions || []);
      setJobType(data.job_type || jobTypeName || "");
      setRequiredSkills(data.required_skills || []);
    } catch (err) {
      console.error("AI Suggestions Error:", err);
      setError(err instanceof Error ? err.message : "Failed to get suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [user, jobTypeId, propertyCoords, jobTypeName]);

  useEffect(() => {
    if (jobTypeId) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [jobTypeId, fetchSuggestions]);

  const handleAccept = (suggestion: TechnicianSuggestion) => {
    setAccepted(suggestion.technician.id);
    onAccept({
      technicianId: suggestion.technician.id,
      technicianName: suggestion.technician.name,
      slotStart: suggestion.availableSlot?.start,
      slotEnd: suggestion.availableSlot?.end,
    });
  };

  // Don't show if no job type selected
  if (!jobTypeId) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "rounded-lg border border-violet-200 bg-violet-50/50 p-4",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
            <Loader2 className="h-5 w-5 text-violet-600 animate-spin" />
          </div>
          <div>
            <p className="font-medium text-violet-900">Finding best technicians...</p>
            <p className="text-sm text-violet-600">
              Analyzing skills and availability for {jobTypeName || "this job type"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        "rounded-lg border border-amber-200 bg-amber-50/50 p-4",
        className
      )}>
        <p className="text-sm text-amber-800">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSuggestions}
          className="mt-2 text-amber-700"
        >
          Try again
        </Button>
      </div>
    );
  }

  // No suggestions
  if (suggestions.length === 0) {
    return (
      <div className={cn(
        "rounded-lg border border-slate-200 bg-slate-50 p-4",
        className
      )}>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-600">
            No technicians available. Select manually below.
          </p>
        </div>
      </div>
    );
  }

  const topSuggestion = suggestions[0];
  const alternativeSuggestions = suggestions.slice(1);

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      topSuggestion.score >= 80
        ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50"
        : topSuggestion.score >= 60
        ? "border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50"
        : "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-inherit">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              topSuggestion.score >= 80
                ? "bg-emerald-100"
                : topSuggestion.score >= 60
                ? "bg-violet-100"
                : "bg-amber-100"
            )}>
              <Sparkles className={cn(
                "h-4 w-4",
                topSuggestion.score >= 80
                  ? "text-emerald-600"
                  : topSuggestion.score >= 60
                  ? "text-violet-600"
                  : "text-amber-600"
              )} />
            </div>
            <div>
              <p className="font-medium text-sm">AI Recommendation</p>
              <p className="text-xs text-muted-foreground">
                Best match for {jobType}
              </p>
            </div>
          </div>
          {requiredSkills.length > 0 && (
            <div className="flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {requiredSkills.slice(0, 2).join(", ")}
                {requiredSkills.length > 2 && ` +${requiredSkills.length - 2}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Suggestion */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarFallback
              style={{ backgroundColor: topSuggestion.technician.color || "#8b5cf6" }}
              className="text-white font-semibold"
            >
              {topSuggestion.technician.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-lg">
                {topSuggestion.technician.name}
              </h4>
              <Badge
                variant="secondary"
                className={cn(
                  "font-bold",
                  topSuggestion.score >= 80
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : topSuggestion.score >= 60
                    ? "bg-violet-100 text-violet-700 border-violet-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                )}
              >
                {topSuggestion.score}% match
              </Badge>
              {topSuggestion.skillMatchScore >= 75 && (
                <Badge variant="outline" className="text-xs gap-1 border-emerald-300 text-emerald-700">
                  <Award className="h-3 w-3" />
                  Expert
                </Badge>
              )}
            </div>

            {/* Skills */}
            {topSuggestion.technician.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {topSuggestion.technician.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/70 text-slate-600 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
                {topSuggestion.technician.skills.length > 4 && (
                  <span className="text-xs px-2 py-0.5 text-slate-500">
                    +{topSuggestion.technician.skills.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Reasoning */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
              {topSuggestion.reasoning.slice(0, 3).map((reason, i) => (
                <span key={i} className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  {reason}
                </span>
              ))}
            </div>

            {/* Available Slot */}
            {topSuggestion.availableSlot && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Clock className="h-4 w-4 text-violet-500" />
                <span className="text-violet-700 font-medium">
                  Next available: {format(new Date(topSuggestion.availableSlot.start), "EEE, MMM d 'at' h:mm a")}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {accepted === topSuggestion.technician.id ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2 border-emerald-300 text-emerald-700 bg-emerald-50"
              >
                <CheckCircle className="h-4 w-4" />
                Selected
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleAccept(topSuggestion)}
                className={cn(
                  "gap-2",
                  topSuggestion.score >= 80
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-violet-600 hover:bg-violet-700"
                )}
              >
                <Zap className="h-4 w-4" />
                Use This
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Alternative Suggestions */}
      {alternativeSuggestions.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 py-2 border-t border-inherit bg-white/50 hover:bg-white/80 transition-colors text-sm text-muted-foreground">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide alternatives
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show {alternativeSuggestions.length} more option{alternativeSuggestions.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-inherit bg-white/30">
              {alternativeSuggestions.map((suggestion) => (
                <div
                  key={suggestion.technician.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-inherit last:border-b-0 hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        style={{ backgroundColor: suggestion.technician.color || "#8b5cf6" }}
                        className="text-white text-sm"
                      >
                        {suggestion.technician.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{suggestion.technician.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.reasoning[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        suggestion.score >= 80
                          ? "border-emerald-300 text-emerald-600"
                          : suggestion.score >= 60
                          ? "border-violet-300 text-violet-600"
                          : "border-amber-300 text-amber-600"
                      )}
                    >
                      {suggestion.score}%
                    </Badge>
                    {accepted === suggestion.technician.id ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAccept(suggestion)}
                        className="text-xs"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
