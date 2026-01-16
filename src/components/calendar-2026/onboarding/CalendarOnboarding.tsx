// Calendar 2026 Onboarding - User Education Component
// Shows first-time users how to use the revolutionary features

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Map,
  GanttChart,
  Command,
  Zap,
  Route,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle,
  Keyboard,
  MousePointer,
  Calendar,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tip: string;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'ai-schedule',
    title: 'AI Schedule (⌘K)',
    description: 'Type naturally to schedule jobs. Say "Schedule repair for John tomorrow morning" and AI will understand.',
    icon: Sparkles,
    tip: 'Press ⌘K (or Ctrl+K) anytime to open',
    action: 'Try typing a command',
  },
  {
    id: 'timeline',
    title: 'Timeline View',
    description: 'See your entire day horizontally. Zoom in/out to see 15-minute or 2-hour slots. The red line shows current time.',
    icon: GanttChart,
    tip: 'Use zoom buttons to adjust detail level',
    action: 'Click Timeline tab to try',
  },
  {
    id: 'map-view',
    title: 'Map View',
    description: 'See all jobs on a map with real-time weather. Optimize routes with one click to save time and fuel.',
    icon: Map,
    tip: 'Weather updates automatically for your area',
    action: 'Click Map tab to explore',
  },
  {
    id: 'optimize',
    title: 'Route Optimization',
    description: 'AI calculates the best order for your jobs to minimize driving time. Works with multiple technicians.',
    icon: Route,
    tip: 'Click "Optimize Routes" in Map view',
    action: 'Try with your scheduled jobs',
  },
];

const STORAGE_KEY = 'fixlify_calendar_onboarding_completed';

interface CalendarOnboardingProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function CalendarOnboarding({ onComplete, forceShow = false }: CalendarOnboardingProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  // Check if onboarding was already completed
  useEffect(() => {
    const wasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!wasCompleted && !forceShow) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
    if (forceShow) {
      setOpen(true);
    }
  }, [forceShow]);

  const handleNext = () => {
    const step = ONBOARDING_STEPS[currentStep];
    if (!completed.includes(step.id)) {
      setCompleted([...completed, step.id]);
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    onComplete?.();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="gap-1 text-violet-600 border-violet-200 bg-violet-50">
              <Sparkles className="h-3 w-3" />
              New Features
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleSkip}
            >
              Skip tour
            </Button>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to Smart Calendar</DialogTitle>
            <DialogDescription>
              Let's show you the powerful new features that will save you time
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Feature Card */}
              <div className="rounded-xl border bg-gradient-to-br from-violet-50 to-purple-50 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm">
                  <Keyboard className="h-4 w-4 text-violet-500" />
                  <span className="text-violet-700 font-medium">{step.tip}</span>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {ONBOARDING_STEPS.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === currentStep
                        ? "w-6 bg-violet-500"
                        : index < currentStep
                        ? "w-2 bg-violet-300"
                        : "w-2 bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>

            <Button
              onClick={handleNext}
              className="gap-1 bg-violet-600 hover:bg-violet-700"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick tip component for inline hints
interface QuickTipProps {
  children: React.ReactNode;
  className?: string;
}

export function QuickTip({ children, className }: QuickTipProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-sm text-violet-700",
      className
    )}>
      <Zap className="h-4 w-4 text-violet-500 shrink-0" />
      {children}
    </div>
  );
}

// Function to reset onboarding (for testing or settings)
export function resetCalendarOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}

// Check if onboarding was completed
export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}
