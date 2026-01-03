import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent, STATUS_COLORS } from "../CalendarProvider";
import { format, differenceInMinutes } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Edit,
  Trash2,
  Navigation,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface MobileEventSheetProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onNavigate?: (address: string) => void;
  className?: string;
}

/**
 * Mobile bottom sheet for event details
 */
export function MobileEventSheet({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onNavigate,
  className,
}: MobileEventSheetProps) {
  if (!event) return null;

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const duration = differenceInMinutes(endDate, startDate);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationText = hours > 0
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  const status = event.extendedProps?.status || "scheduled";
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.scheduled;

  const handleNavigate = () => {
    const address = event.extendedProps?.address;
    if (address && onNavigate) {
      onNavigate(address);
    } else if (address) {
      // Open in maps
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank"
      );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-xl max-h-[85vh] overflow-y-auto",
          className
        )}
      >
        {/* Handle indicator */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Event Header */}
        <SheetHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div
              className="w-1.5 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color || statusColor }}
            />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg text-left truncate">
                {event.title}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs capitalize"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  {status.replace("_", " ")}
                </Badge>
                {event.extendedProps?.jobType && (
                  <Badge variant="outline" className="text-xs">
                    {event.extendedProps.jobType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Event Details */}
        <div className="space-y-4 py-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">
                {format(startDate, "EEEE, MMMM d, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>
                  {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                </span>
                <span className="text-xs">({durationText})</span>
              </div>
            </div>
          </div>

          {/* Technician */}
          {event.resourceId && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium">
                  {event.extendedProps?.technicianName || "Assigned Technician"}
                </div>
                {event.extendedProps?.technicianPhone && (
                  <a
                    href={`tel:${event.extendedProps.technicianPhone}`}
                    className="text-sm text-primary"
                  >
                    {event.extendedProps.technicianPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          {event.extendedProps?.address && (
            <button
              onClick={handleNavigate}
              className="flex items-start gap-3 w-full text-left hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {event.extendedProps.address}
                </div>
                <div className="text-sm text-primary flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  Get directions
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )}

          {/* Client Info */}
          {event.extendedProps?.clientName && (
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Client
              </div>
              <div className="font-medium">{event.extendedProps.clientName}</div>
              {event.extendedProps.clientPhone && (
                <a
                  href={`tel:${event.extendedProps.clientPhone}`}
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <Phone className="h-4 w-4" />
                  {event.extendedProps.clientPhone}
                </a>
              )}
              {event.extendedProps.clientEmail && (
                <a
                  href={`mailto:${event.extendedProps.clientEmail}`}
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {event.extendedProps.clientEmail}
                </a>
              )}
            </div>
          )}

          {/* Description */}
          {event.extendedProps?.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Notes
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {event.extendedProps.description}
                </p>
              </div>
            </div>
          )}

          {/* Status Actions */}
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              {status === "scheduled" && (
                <Button variant="outline" size="sm" className="justify-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Start Job
                </Button>
              )}
              {status === "in_progress" && (
                <Button variant="outline" size="sm" className="justify-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Complete
                </Button>
              )}
              {event.extendedProps?.clientPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  asChild
                >
                  <a href={`tel:${event.extendedProps.clientPhone}`}>
                    <Phone className="h-4 w-4" />
                    Call Client
                  </a>
                </Button>
              )}
              {event.extendedProps?.address && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={handleNavigate}
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          {onEdit && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                onEdit(event);
                onClose();
              }}
            >
              <Edit className="h-4 w-4" />
              Edit Job
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                onDelete(event);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
