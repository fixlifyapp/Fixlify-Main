import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

const tourSteps: Record<string, TourStep[]> = {
  dashboard: [
    {
      target: "[data-tour='dashboard-stats']",
      title: "Your Business Overview",
      content: "Here you can see key metrics about your business at a glance. Track jobs, revenue, and client activity.",
      position: "bottom"
    },
    {
      target: "[data-tour='quick-actions']",
      title: "Quick Actions",
      content: "Create new jobs, estimates, or invoices with just one click. These are your most common tasks.",
      position: "left"
    },
    {
      target: "[data-tour='sidebar-nav']",
      title: "Navigation Menu",
      content: "Access all features of Fixlify from here. Jobs, clients, finances, and more are just a click away.",
      position: "right"
    }
  ],
  jobs: [
    {
      target: "[data-tour='create-job-btn']",
      title: "Create Your First Job",
      content: "Click here to create a new job. You can schedule work, assign technicians, and track progress.",
      position: "bottom"
    },
    {
      target: "[data-tour='job-filters']",
      title: "Filter and Search",
      content: "Use these filters to find specific jobs quickly. Filter by status, date, technician, or search by keyword.",
      position: "bottom"
    }
  ],
  clients: [
    {
      target: "[data-tour='add-client-btn']",
      title: "Add New Clients",
      content: "Start building your client database. Add contact info, addresses, and track all their jobs in one place.",
      position: "bottom"
    }
  ]
};

interface AppTourProps {
  page: keyof typeof tourSteps;
}

export function AppTour({ page }: AppTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { user } = useAuth();
  
  const steps = tourSteps[page] || [];
  const currentTourStep = steps[currentStep];

  useEffect(() => {
    // Check if user has seen this tour before
    const checkTourStatus = async () => {
      if (!user) return;
      
      const tourKey = `tour_${page}_completed`;
      const hasSeenTour = localStorage.getItem(tourKey);
      
      if (!hasSeenTour && steps.length > 0) {
        // Delay tour start to let page render
        setTimeout(() => {
          setIsActive(true);
          highlightElement();
        }, 1000);
      }
    };
    
    checkTourStatus();
  }, [user, page]);

  useEffect(() => {
    if (isActive && currentTourStep) {
      highlightElement();
    }
  }, [currentStep, isActive]);

  const highlightElement = () => {
    if (!currentTourStep) return;
    
    const element = document.querySelector(currentTourStep.target);
    if (!element) {
      console.log(`Tour target not found: ${currentTourStep.target}`);
      return;
    }
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate position based on target element
    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;
    
    // Adjust position based on preferred placement
    switch (currentTourStep.position) {
      case "bottom":
        top += rect.height + 10;
        left += rect.width / 2 - 150; // Center horizontally
        break;
      case "top":
        top -= 120;
        left += rect.width / 2 - 150;
        break;
      case "left":
        top += rect.height / 2 - 60;
        left -= 320;
        break;
      case "right":
        top += rect.height / 2 - 60;
        left += rect.width + 10;
        break;
    }
    
    setPosition({ top, left });
    
    // Add highlight class to element
    element.classList.add("tour-highlight");
    
    // Scroll element into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleNext = () => {
    // Remove highlight from current element
    const currentElement = document.querySelector(currentTourStep.target);
    if (currentElement) {
      currentElement.classList.remove("tour-highlight");
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    // Remove highlight from current element
    const currentElement = document.querySelector(currentTourStep.target);
    if (currentElement) {
      currentElement.classList.remove("tour-highlight");
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Remove all highlights
    document.querySelectorAll(".tour-highlight").forEach(el => {
      el.classList.remove("tour-highlight");
    });
    
    // Mark tour as completed
    const tourKey = `tour_${page}_completed`;
    localStorage.setItem(tourKey, "true");
    
    setIsActive(false);
    setCurrentStep(0);
  };

  if (!isActive || !currentTourStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleSkip} />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-50 w-80 shadow-xl"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{currentTourStep.title}</h3>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {currentTourStep.content}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={handleNext}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Got it!"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add CSS for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 41;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}

// Hook to manually trigger tours
export function useAppTour(page: keyof typeof tourSteps) {
  const startTour = () => {
    const tourKey = `tour_${page}_completed`;
    localStorage.removeItem(tourKey);
    window.location.reload(); // Reload to trigger tour
  };
  
  return { startTour };
} 