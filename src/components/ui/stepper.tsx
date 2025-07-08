
import React from 'react';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: number;
  steps: Array<{
    title: string;
    description?: string;
  }>;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps, className }) => {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2",
              index < currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : index === currentStep
                ? "border-primary text-primary"
                : "border-muted text-muted-foreground"
            )}
          >
            {index + 1}
          </div>
          <div className="ml-2">
            <div className={cn(
              "text-sm font-medium",
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.title}
            </div>
            {step.description && (
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-border mx-4" />
          )}
        </div>
      ))}
    </div>
  );
};
