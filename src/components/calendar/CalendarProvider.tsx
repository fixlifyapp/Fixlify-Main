import * as React from "react";
import { create } from "zustand";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  differenceInMinutes,
  areIntervalsOverlapping,
} from "date-fns";

// Types
export type CalendarView = "day" | "week" | "month" | "team" | "gantt";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string; // Technician ID for team view
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    jobId?: string;
    clientName?: string;
    clientPhone?: string;
    address?: string;
    technicianName?: string;
    description?: string;
  };
}

export interface CalendarResource {
  id: string;
  title: string;
  color?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// Business hours type from company settings
export interface BusinessHoursDay {
  start: string; // "09:00"
  end: string;   // "17:00"
  enabled: boolean;
}

export interface BusinessHours {
  monday: BusinessHoursDay;
  tuesday: BusinessHoursDay;
  wednesday: BusinessHoursDay;
  thursday: BusinessHoursDay;
  friday: BusinessHoursDay;
  saturday: BusinessHoursDay;
  sunday: BusinessHoursDay;
  [key: string]: BusinessHoursDay;
}

// Conflict detection
export interface SlotConflict {
  slotTime: Date;
  resourceId: string;
  conflictingEvents: CalendarEvent[];
  severity: "warning" | "error";
}

// Workload tracking per technician
export interface TechnicianWorkload {
  jobCount: number;
  hoursWorked: number;
  isOverloaded: boolean;
  isNearCapacity: boolean;
}

// Travel gap between jobs
export interface TravelGap {
  fromEventId: string;
  toEventId: string;
  gapMinutes: number;
  estimatedTravelMinutes: number;
  isRisky: boolean;
}

export interface CalendarState {
  // Current view state
  view: CalendarView;
  currentDate: Date;
  selectedDate: Date | null;
  selectedEvent: CalendarEvent | null;

  // Data
  events: CalendarEvent[];
  resources: CalendarResource[];

  // UI state
  isLoading: boolean;
  isDragging: boolean;
  draggedEvent: CalendarEvent | null;

  // Time settings
  slotDuration: number; // minutes
  slotMinTime: string; // "06:00"
  slotMaxTime: string; // "22:00"

  // Business hours settings
  businessHours: BusinessHours | null;
  timezone: string;

  // Workload limits
  maxJobsPerTechnicianPerDay: number;
  maxHoursPerTechnicianPerDay: number;

  // AI state
  aiHighlightedSlots: TimeRange[];
  aiRecommendation: {
    slot: TimeRange;
    technician: CalendarResource;
    score: number;
    reasoning: string[];
  } | null;

  // Actions
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setResources: (resources: CalendarResource[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setDraggedEvent: (event: CalendarEvent | null) => void;
  setAIHighlightedSlots: (slots: TimeRange[]) => void;
  setAIRecommendation: (recommendation: CalendarState["aiRecommendation"]) => void;
  setBusinessHours: (businessHours: BusinessHours | null) => void;
  setTimezone: (timezone: string) => void;

  // Navigation
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;

  // Computed
  getVisibleRange: () => TimeRange;
  getTimeSlots: () => Date[];

  // Conflict detection
  checkConflicts: (event: CalendarEvent, targetStart: Date, targetEnd: Date, targetResourceId?: string) => CalendarEvent[];
  isSlotOutsideBusinessHours: (date: Date, time: Date) => boolean;
  getTechnicianWorkload: (technicianId: string, date: Date) => TechnicianWorkload;
  getAllTechnicianWorkloads: (date: Date) => Record<string, TechnicianWorkload>;
}

// Day name mapping for business hours lookup
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

// Zustand store
export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initial state
  view: "week",
  currentDate: new Date(),
  selectedDate: null,
  selectedEvent: null,
  events: [],
  resources: [],
  isLoading: false,
  isDragging: false,
  draggedEvent: null,
  slotDuration: 30,
  slotMinTime: "06:00",
  slotMaxTime: "22:00",
  businessHours: null,
  timezone: "America/New_York",
  maxJobsPerTechnicianPerDay: 8,
  maxHoursPerTechnicianPerDay: 10,
  aiHighlightedSlots: [],
  aiRecommendation: null,

  // Actions
  setView: (view) => set({ view }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setEvents: (events) => set({ events }),
  setResources: (resources) => set({ resources }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setDraggedEvent: (draggedEvent) => set({ draggedEvent }),
  setAIHighlightedSlots: (aiHighlightedSlots) => set({ aiHighlightedSlots }),
  setAIRecommendation: (aiRecommendation) => set({ aiRecommendation }),
  setBusinessHours: (businessHours) => set({ businessHours }),
  setTimezone: (timezone) => set({ timezone }),

  // Navigation
  goToToday: () => set({ currentDate: new Date() }),

  goToPrevious: () => {
    const { view, currentDate } = get();
    switch (view) {
      case "day":
        set({ currentDate: subDays(currentDate, 1) });
        break;
      case "week":
      case "team":
      case "gantt":
        set({ currentDate: subWeeks(currentDate, 1) });
        break;
      case "month":
        set({ currentDate: subMonths(currentDate, 1) });
        break;
    }
  },

  goToNext: () => {
    const { view, currentDate } = get();
    switch (view) {
      case "day":
        set({ currentDate: addDays(currentDate, 1) });
        break;
      case "week":
      case "team":
      case "gantt":
        set({ currentDate: addWeeks(currentDate, 1) });
        break;
      case "month":
        set({ currentDate: addMonths(currentDate, 1) });
        break;
    }
  },

  // Computed
  getVisibleRange: () => {
    const { view, currentDate } = get();
    switch (view) {
      case "day":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
        };
      case "week":
      case "team":
      case "gantt":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        };
      case "month":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
    }
  },

  getTimeSlots: () => {
    const { slotMinTime, slotMaxTime, slotDuration } = get();
    const slots: Date[] = [];

    const [minHour, minMinute] = slotMinTime.split(":").map(Number);
    const [maxHour, maxMinute] = slotMaxTime.split(":").map(Number);

    const baseDate = new Date();
    baseDate.setHours(minHour, minMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(maxHour, maxMinute, 0, 0);

    let current = new Date(baseDate);
    while (current < endTime) {
      slots.push(new Date(current));
      current = new Date(current.getTime() + slotDuration * 60 * 1000);
    }

    return slots;
  },

  // Conflict detection - check if moving an event would cause overlaps
  checkConflicts: (event, targetStart, targetEnd, targetResourceId) => {
    const { events } = get();
    const resourceId = targetResourceId || event.resourceId;

    // Find all events for the same resource on the same day
    const conflicting = events.filter((e) => {
      // Don't conflict with self
      if (e.id === event.id) return false;
      // Must be same resource
      if (e.resourceId !== resourceId) return false;

      // Check time overlap
      try {
        return areIntervalsOverlapping(
          { start: new Date(e.start), end: new Date(e.end) },
          { start: targetStart, end: targetEnd }
        );
      } catch {
        return false;
      }
    });

    return conflicting;
  },

  // Check if a slot is outside business hours
  isSlotOutsideBusinessHours: (date, time) => {
    const { businessHours } = get();

    // If no business hours set, everything is open
    if (!businessHours) return false;

    const dayName = DAY_NAMES[date.getDay()];
    const dayHours = businessHours[dayName];

    // If day is not enabled, slot is outside business hours
    if (!dayHours?.enabled) return true;

    const hour = time.getHours();
    const minute = time.getMinutes();
    const slotMinutes = hour * 60 + minute;

    const [startH, startM] = dayHours.start.split(":").map(Number);
    const [endH, endM] = dayHours.end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return slotMinutes < startMinutes || slotMinutes >= endMinutes;
  },

  // Get workload for a specific technician on a specific day
  getTechnicianWorkload: (technicianId, date) => {
    const { events, maxJobsPerTechnicianPerDay, maxHoursPerTechnicianPerDay } = get();

    // Filter events for this technician on this day
    const techEvents = events.filter(
      (e) =>
        e.resourceId === technicianId &&
        isSameDay(new Date(e.start), date)
    );

    // Calculate total minutes worked
    const totalMinutes = techEvents.reduce((sum, e) => {
      return sum + differenceInMinutes(new Date(e.end), new Date(e.start));
    }, 0);

    const hoursWorked = totalMinutes / 60;
    const jobCount = techEvents.length;

    return {
      jobCount,
      hoursWorked,
      isOverloaded: jobCount >= maxJobsPerTechnicianPerDay || hoursWorked >= maxHoursPerTechnicianPerDay,
      isNearCapacity: jobCount >= maxJobsPerTechnicianPerDay - 1 || hoursWorked >= maxHoursPerTechnicianPerDay - 1,
    };
  },

  // Get workloads for all technicians on a specific day
  getAllTechnicianWorkloads: (date) => {
    const { resources, events, maxJobsPerTechnicianPerDay, maxHoursPerTechnicianPerDay } = get();

    const workloads: Record<string, TechnicianWorkload> = {};

    resources.forEach((resource) => {
      const techEvents = events.filter(
        (e) =>
          e.resourceId === resource.id &&
          isSameDay(new Date(e.start), date)
      );

      const totalMinutes = techEvents.reduce((sum, e) => {
        return sum + differenceInMinutes(new Date(e.end), new Date(e.start));
      }, 0);

      const hoursWorked = totalMinutes / 60;
      const jobCount = techEvents.length;

      workloads[resource.id] = {
        jobCount,
        hoursWorked,
        isOverloaded: jobCount >= maxJobsPerTechnicianPerDay || hoursWorked >= maxHoursPerTechnicianPerDay,
        isNearCapacity: jobCount >= maxJobsPerTechnicianPerDay - 1 || hoursWorked >= maxHoursPerTechnicianPerDay - 1,
      };
    });

    return workloads;
  },
}));

// Context for passing callbacks
interface CalendarContextValue {
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onEventResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  onDateSelect?: (start: Date, end: Date, resourceId?: string) => void;
}

const CalendarContext = React.createContext<CalendarContextValue>({});

export const useCalendarContext = () => React.useContext(CalendarContext);

interface CalendarProviderProps {
  children: React.ReactNode;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onEventResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  onDateSelect?: (start: Date, end: Date, resourceId?: string) => void;
}

export function CalendarProvider({
  children,
  onEventClick,
  onEventDrop,
  onEventResize,
  onSlotClick,
  onDateSelect,
}: CalendarProviderProps) {
  const contextValue = React.useMemo(
    () => ({
      onEventClick,
      onEventDrop,
      onEventResize,
      onSlotClick,
      onDateSelect,
    }),
    [onEventClick, onEventDrop, onEventResize, onSlotClick, onDateSelect]
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

// Status colors for calendar events
export const STATUS_COLORS: Record<CalendarEvent["status"], { bg: string; border: string; text: string }> = {
  scheduled: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  "in-progress": { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  completed: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  cancelled: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" },
  "no-show": { bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
};
