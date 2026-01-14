
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  defaultOpen?: boolean;
}

export const NotesSection = ({ notes, onNotesChange, defaultOpen = false }: NotesSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || !!notes);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Additional Notes</span>
              {notes && !isOpen && (
                <span className="text-xs text-muted-foreground ml-1">(has content)</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Visible to client</span>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pt-2">
            <Textarea
              placeholder="Add notes, terms, or special instructions that will be visible to the client..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
