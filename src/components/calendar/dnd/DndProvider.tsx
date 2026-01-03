import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { useCalendarStore, CalendarEvent, useCalendarContext } from "../CalendarProvider";
import { toast } from "sonner";
import { AlertTriangle, Ban } from "lucide-react";

interface CalendarDndProviderProps {
  children: React.ReactNode;
}

export function CalendarDndProvider({ children }: CalendarDndProviderProps) {
  const { onEventDrop } = useCalendarContext();
  const setIsDragging = useCalendarStore((state) => state.setIsDragging);
  const setDraggedEvent = useCalendarStore((state) => state.setDraggedEvent);
  const draggedEvent = useCalendarStore((state) => state.draggedEvent);
  const slotDuration = useCalendarStore((state) => state.slotDuration);
  const checkConflicts = useCalendarStore((state) => state.checkConflicts);
  const isSlotOutsideBusinessHours = useCalendarStore((state) => state.isSlotOutsideBusinessHours);
  const [dropError, setDropError] = React.useState<string | null>(null);

  // Configure sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px movement before drag starts
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // 200ms hold before drag starts on touch
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const eventData = active.data.current?.event as CalendarEvent | undefined;

    if (eventData) {
      setIsDragging(true);
      setDraggedEvent(eventData);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Can add visual feedback here if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setIsDragging(false);
    setDraggedEvent(null);
    setDropError(null);

    if (!over) return;

    const eventData = active.data.current?.event as CalendarEvent | undefined;
    const slotData = over.data.current as {
      type: string;
      date: Date;
      time: Date;
      resourceId?: string;
    } | undefined;

    if (!eventData || !slotData || slotData.type !== "slot") return;

    // Calculate new start and end times
    const oldStart = new Date(eventData.start);
    const oldEnd = new Date(eventData.end);
    const duration = oldEnd.getTime() - oldStart.getTime();

    // Create new start time from dropped slot
    const newStart = new Date(slotData.date);
    newStart.setHours(slotData.time.getHours(), slotData.time.getMinutes(), 0, 0);

    const newEnd = new Date(newStart.getTime() + duration);

    // Check if slot is outside business hours
    if (isSlotOutsideBusinessHours(slotData.date, slotData.time)) {
      toast.error("Cannot schedule outside business hours", {
        description: "This time slot is outside of your configured business hours.",
        icon: <Ban className="h-4 w-4" />,
      });
      return;
    }

    // Check for conflicts
    const conflicts = checkConflicts(eventData, newStart, newEnd, slotData.resourceId);
    if (conflicts.length > 0) {
      toast.error("Scheduling conflict detected", {
        description: `This technician already has ${conflicts.length} job${conflicts.length > 1 ? 's' : ''} scheduled during this time.`,
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }

    // Only trigger callback if time or resource changed
    const startChanged = newStart.getTime() !== oldStart.getTime();
    const resourceChanged = slotData.resourceId !== eventData.resourceId;

    if (startChanged || resourceChanged) {
      onEventDrop?.(eventData, newStart, newEnd, slotData.resourceId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}

      {/* Drag overlay for better UX */}
      <DragOverlay dropAnimation={null}>
        {draggedEvent && (
          <div
            className="px-2 py-1 rounded-md shadow-lg opacity-90 pointer-events-none"
            style={{
              backgroundColor: dropError ? "#ef4444" : (draggedEvent.backgroundColor || "#3b82f6"),
              color: draggedEvent.textColor || "#ffffff",
              minWidth: "100px",
            }}
          >
            <div className="text-xs font-medium truncate flex items-center gap-1.5">
              {dropError && <AlertTriangle className="h-3 w-3" />}
              {draggedEvent.title}
            </div>
            {dropError && (
              <div className="text-[10px] opacity-80 mt-0.5">{dropError}</div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
