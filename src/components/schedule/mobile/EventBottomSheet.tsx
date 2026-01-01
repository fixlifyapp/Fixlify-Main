import { Drawer } from 'vaul';
import { format } from 'date-fns';
import { Calendar, Clock, User, MapPin, ExternalLink, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventBottomSheetProps {
  event: {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    clientName?: string;
    technicianName?: string;
    status?: string;
    address?: string;
    description?: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onViewJob: (jobId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

export function EventBottomSheet({ event, open, onClose, onViewJob }: EventBottomSheetProps) {
  if (!event) return null;

  const formatStatus = (status: string) => {
    return status.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Drawer.Root open={open} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto max-h-[85vh] flex-col rounded-t-[20px] bg-background">
          {/* Drag handle */}
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted-foreground/20" />

          <div className="flex-1 overflow-auto p-4 pb-8">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold leading-tight">{event.title}</h2>
                {event.status && (
                  <Badge className={cn('shrink-0', STATUS_STYLES[event.status] || STATUS_STYLES.scheduled)}>
                    {formatStatus(event.status)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {/* Date & Time */}
              {event.start && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{format(event.start, 'EEEE, MMMM d, yyyy')}</div>
                    <div className="text-muted-foreground">
                      {format(event.start, 'h:mm a')}
                      {event.end && ` - ${format(event.end, 'h:mm a')}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Client */}
              {event.clientName && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Client</div>
                    <div className="font-medium">{event.clientName}</div>
                  </div>
                </div>
              )}

              {/* Technician */}
              {event.technicianName && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                    <User className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Technician</div>
                    <div className="font-medium">{event.technicianName}</div>
                  </div>
                </div>
              )}

              {/* Address */}
              {event.address && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10">
                    <MapPin className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Address</div>
                    <div className="font-medium">{event.address}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => onViewJob(event.id)}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Job Details
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </Button>
                <Button variant="outline" size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
