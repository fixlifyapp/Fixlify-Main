// Main exports
export { CustomCalendar } from "./CalendarContainer";
export {
  CalendarProvider,
  useCalendarStore,
  useCalendarContext,
  STATUS_COLORS,
} from "./CalendarProvider";
export type {
  CalendarEvent,
  CalendarResource,
  CalendarView,
  CalendarState,
  TimeRange,
} from "./CalendarProvider";

// Views
export { DayView } from "./views/DayView";
export { WeekView } from "./views/WeekView";
export { MonthView } from "./views/MonthView";
export { TeamView } from "./views/TeamView";

// Grid components
export { TimeGrid } from "./grid/TimeGrid";
export { TimeSlot } from "./grid/TimeSlot";
export { TimeAxis } from "./grid/TimeAxis";

// Other components
export { CalendarHeader } from "./CalendarHeader";
export { CalendarEventBlock } from "./CalendarEvent";
export { NowIndicator } from "./NowIndicator";
export { CalendarDndProvider } from "./dnd/DndProvider";

// AI Scheduling components
export {
  AISlotHighlight,
  AISlotOverlay,
  AIFormHint,
  AIInlineHint,
  AISchedulingPanel,
  AISchedulingToggle,
  useAIScheduling,
} from "./ai";
export type { AISchedulingInput, AIRecommendation, TechnicianWorkload } from "./ai";

// Mobile components
export {
  MobileCalendar,
  MobileCalendarHeader,
  SwipeableDay,
  MobileEventSheet,
  MobileTechnicianList,
  useSwipeGesture,
} from "./mobile";

// Gantt View
export { GanttView } from "./views/GanttView";

// Features
export {
  TravelTimeIndicator,
  TravelSummaryBadge,
  GanttTravelConnector,
  TimelineTravelMarkers,
} from "./features/TravelTimeIndicator";
