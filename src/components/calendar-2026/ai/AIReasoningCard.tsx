// AI Reasoning Card - Shows WHY AI chose this slot
// Transparent AI decisions, not black box

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Brain,
  Sparkles,
  User,
  Clock,
  MapPin,
  Route,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Heart,
  TrendingUp,
  Navigation,
} from 'lucide-react';
import type { AIReasoning, ReasoningFactor, AlternativeSlot } from '../types';

interface AIReasoningCardProps {
  reasoning: AIReasoning;
  onSelectSlot?: (slot: AIReasoning['slot'], technicianId: string) => void;
  onSelectAlternative?: (alternative: AlternativeSlot) => void;
  className?: string;
  compact?: boolean;
}

const factorIcons: Record<string, React.ElementType> = {
  availability: Clock,
  skills: Star,
  travel: Route,
  workload: TrendingUp,
  preference: Heart,
  efficiency: Zap,
  proximity: Navigation,
  history: Calendar,
};

const factorColors: Record<string, string> = {
  availability: 'text-blue-600 bg-blue-50',
  skills: 'text-amber-600 bg-amber-50',
  travel: 'text-green-600 bg-green-50',
  workload: 'text-purple-600 bg-purple-50',
  preference: 'text-pink-600 bg-pink-50',
  efficiency: 'text-orange-600 bg-orange-50',
  proximity: 'text-teal-600 bg-teal-50',
  history: 'text-indigo-600 bg-indigo-50',
};

export function AIReasoningCard({
  reasoning,
  onSelectSlot,
  onSelectAlternative,
  className,
  compact = false,
}: AIReasoningCardProps) {
  const [expanded, setExpanded] = React.useState(!compact);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Consider alternatives';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="overflow-hidden border-violet-200 shadow-lg shadow-violet-100/50">
        {/* Header with AI Badge */}
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  AI Recommendation
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Based on {reasoning.factors.length} factors
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-2xl font-bold", getScoreColor(reasoning.totalScore))}>
                {reasoning.totalScore}%
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  reasoning.totalScore >= 80
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : reasoning.totalScore >= 60
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                {getScoreLabel(reasoning.totalScore)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Recommended Slot */}
          <div className="mb-4 rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-600" />
                  <span className="font-medium">{reasoning.technician.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {reasoning.slot.start.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {reasoning.slot.start.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {reasoning.slot.end.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => onSelectSlot?.(reasoning.slot, reasoning.technician.id)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Select
              </Button>
            </div>
          </div>

          {/* Expandable Reasoning */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Why this slot?
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Factor Breakdown */}
                <div className="mt-4 space-y-3">
                  {reasoning.factors.map((factor, index) => (
                    <FactorRow key={index} factor={factor} />
                  ))}
                </div>

                {/* Alternatives */}
                {reasoning.alternatives.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="mb-3 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Alternatives to Consider
                      </h4>
                      <div className="space-y-2">
                        {reasoning.alternatives.map((alt, index) => (
                          <AlternativeRow
                            key={index}
                            alternative={alt}
                            onSelect={() => onSelectAlternative?.(alt)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FactorRow({ factor }: { factor: ReasoningFactor }) {
  const Icon = factorIcons[factor.name.toLowerCase()] || Sparkles;
  const colorClass = factorColors[factor.name.toLowerCase()] || 'text-slate-600 bg-slate-50';
  const percentage = Math.round((factor.score / factor.maxScore) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium capitalize">{factor.name}</span>
          <span className="text-xs text-muted-foreground">
            {factor.score}/{factor.maxScore}
          </span>
        </div>
        <Progress value={percentage} className="h-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">{factor.explanation}</p>
      </div>
    </div>
  );
}

function AlternativeRow({
  alternative,
  onSelect,
}: {
  alternative: AlternativeSlot;
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{alternative.technician.title}</span>
          <span className="text-muted-foreground">
            {alternative.slot.start.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {alternative.score}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{alternative.tradeoff}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onSelect}>
        Select
      </Button>
    </div>
  );
}

// Compact version for inline display
export function AIReasoningBadge({
  score,
  topFactor,
  onClick,
}: {
  score: number;
  topFactor: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1.5 text-sm"
    >
      <Sparkles className="h-3 w-3 text-violet-600" />
      <span className="font-medium text-violet-800">{score}%</span>
      <span className="text-violet-600">• {topFactor}</span>
    </motion.button>
  );
}
