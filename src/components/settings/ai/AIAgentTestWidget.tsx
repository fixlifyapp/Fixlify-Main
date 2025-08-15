import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AIAgentTestWidgetProps {
  open: boolean;
  onClose: () => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'telnyx-ai-agent': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'agent-id': string;
      }, HTMLElement>;
    }
  }
}

export const AIAgentTestWidget = ({ open, onClose }: AIAgentTestWidgetProps) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (open && !scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@telnyx/ai-agent-widget';
      script.async = true;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Test AI Voice Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground text-center mb-8">
            Click the button below to start a test call
          </p>
          <div className="flex justify-center">
            <telnyx-ai-agent agent-id="assistant-2a8a396c-e975-4ea5-90bf-3297f1350775" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};