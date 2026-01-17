// EventCard - Draggable, resizable event card for calendar views

import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Clock,
  User,
  MapPin,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import type { CalendarEvent } from '../../calendar/CalendarProvider';
import { STATUS_GRADIENT_COLORS, STATUS_COLORS } from './types';

interface EventCardProps {
  event: CalendarEvent;
  style: {
    top: number;
    height: number;
    left?: number;
    width?: number | string;
    zIndex?: number;
  };
  variant?: 'filled' | 'outline' | 'gradient';
  compact?: boolean;
  showTime?: boolean;
  showClient?: boolean;
  showAddress?: boolean;
  showStatusIcon?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (info: PanInfo) => void;
  onResizeStart?: (edge: 'top' | 'bottom') => void;
  onResizeEnd?: (newHeight: number) => void;
  className?: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  scheduled: <Circle className="h-3 w-3" />,
  confirmed: <CheckCircle2 className="h-3 w-3" />,
  'in-progress': <Loader2 className="h-3 w-3 animate-spin" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  cancelled: <AlertCircle className="h-3 w-3" />,
  pending: <Circle className="h-3 w-3" />,
  'no-show': <AlertCircle className="h-3 w-3" />,
};

export function EventCard({
  event,
  style,
  variant = 'gradient',
  compact = false,
  showTime = true,
  showClient = true,
  showAddress = false,
  showStatusIcon = true,
  draggable = true,
  resizable = true,
  onClick,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
  className,
}: EventCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragControls = useDragControls();
  const cardRef = useRef<HTMLDivElement>(null);

  const statusColors = STATUS_COLORS[event.status] || STATUS_COLORS.scheduled;
  const gradientColor = STATUS_GRADIENT_COLORS[event.status] || STATUS_GRADIENT_COLORS.scheduled;

  // Handle drag
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onDragStart?.();
  }, [onDragStart]);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      setIsDragging(false);
      onDragEnd?.(info);
    },
    [onDragEnd]
  );

  // Handle resize
  const handleResizeStart = useCallback(
    (edge: 'top' | 'bottom') => {
      setIsResizing(true);
      onResizeStart?.(edge);
    },
    [onResizeStart]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    if (cardRef.current) {
      onResizeEnd?.(cardRef.current.offsetHeight);
    }
  }, [onResizeEnd]);

  // Determine if we have enough height to show details
  const isMinimal = style.height < 40;
  const isCompact = compact || style.height < 60;

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return cn(statusColors.bg, statusColors.border, 'border-l-4');
      case 'outline':
        return cn('bg-white border-2', statusColors.border);
      case 'gradient':
      default:
        return cn('bg-gradient-to-r', gradientColor);
    }
  };

  const textColorClass = variant === 'gradient' ? 'text-white' : statusColors.text;
  const mutedTextClass = variant === 'gradient' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: isDragging
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            whileHover={{ scale: draggable ? 1.02 : 1, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            drag={draggable ? 'y' : false}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onClick}
            className={cn(
              "absolute rounded-lg cursor-pointer overflow-hidden",
              "transition-shadow duration-200",
              getVariantClasses(),
              isDragging && "opacity-90 z-50",
              isResizing && "z-50",
              className
            )}
            style={{
              top: style.top,
              height: style.height,
              left: style.left ?? 4,
              right: style.width ? undefined : 4,
              width: style.width,
              zIndex: style.zIndex ?? (isDragging ? 50 : 1),
            }}
          >
            {/* Resize handle - top */}
            {resizable && !isMinimal && (
              <div
                className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart('top');
                }}
              />
            )}

            {/* Content */}
            <div className={cn("h-full flex flex-col", isMinimal ? "px-2 py-0.5" : "px-3 py-2")}>
              {/* Title row */}
              <div className="flex items-center gap-1.5 min-w-0">
                {showStatusIcon && !isMinimal && (
                  <span className={cn("shrink-0", textColorClass)}>
                    {STATUS_ICONS[event.status]}
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium truncate",
                    textColorClass,
                    isMinimal ? "text-xs" : isCompact ? "text-sm" : "text-sm"
                  )}
                >
                  {event.title}
                </span>
              </div>

              {/* Time */}
              {showTime && !isMinimal && (
                <div className={cn("flex items-center gap-1 mt-0.5", mutedTextClass)}>
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="text-xs truncate">
                    {format(new Date(event.start), 'h:mm a')}
                    {!isCompact && ` - ${format(new Date(event.end), 'h:mm a')}`}
                  </span>
                </div>
              )}

              {/* Client name */}
              {showClient && !isCompact && event.extendedProps?.clientName && (
                <div className={cn("flex items-center gap-1 mt-0.5", mutedTextClass)}>
                  <User className="h-3 w-3 shrink-0" />
                  <span className="text-xs truncate">
                    {event.extendedProps.clientName}
                  </span>
                </div>
              )}

              {/* Address */}
              {showAddress && !isCompact && event.extendedProps?.address && (
                <div className={cn("flex items-center gap-1 mt-0.5", mutedTextClass)}>
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="text-xs truncate">
                    {event.extendedProps.address}
                  </span>
                </div>
              )}
            </div>

            {/* Drag handle indicator */}
            {draggable && !isMinimal && (
              <div className={cn("absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50", textColorClass)}>
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            {/* Resize handle - bottom */}
            {resizable && !isMinimal && (
              <div
                className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart('bottom');
                }}
              />
            )}
          </motion.div>
        </TooltipTrigger>

        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-semibold">{event.title}</p>

            <p className="text-sm flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
            </p>

            {event.extendedProps?.clientName && (
              <p className="text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {event.extendedProps.clientName}
              </p>
            )}

            {event.extendedProps?.address && (
              <p className="text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {event.extendedProps.address}
              </p>
            )}

            {event.extendedProps?.technicianName && (
              <p className="text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Technician: {event.extendedProps.technicianName}
              </p>
            )}

            <div className="pt-1 border-t">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  statusColors.bg,
                  statusColors.text
                )}
              >
                {event.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Mini event card for month view
export function EventChip({
  event,
  onClick,
  className,
}: {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}) {
  const gradientColor = STATUS_GRADIENT_COLORS[event.status] || STATUS_GRADIENT_COLORS.scheduled;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "px-2 py-0.5 rounded text-xs font-medium truncate cursor-pointer",
        "bg-gradient-to-r text-white shadow-sm",
        gradientColor,
        className
      )}
    >
      <span className="mr-1">{format(new Date(event.start), 'h:mm')}</span>
      {event.title}
    </motion.div>
  );
}

// Event dot for month view (when space is limited)
export function EventDot({
  event,
  onClick,
  className,
}: {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}) {
  const statusColors = STATUS_COLORS[event.status] || STATUS_COLORS.scheduled;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className={cn(
              "w-2 h-2 rounded-full cursor-pointer",
              statusColors.border.replace('border-', 'bg-'),
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{event.title}</p>
          <p className="text-muted-foreground">
            {format(new Date(event.start), 'h:mm a')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
