// Revolutionary AI-Powered Calendar System for Fixlify 2026+
// Main exports

// Core Components
export { Calendar2026 } from './Calendar2026';

// AI Components
export { AICommandBar } from './ai/AICommandBar';
export { AIAssistantBubble } from './ai/AIAssistantBubble';
export { AIReasoningCard, AIReasoningBadge } from './ai/AIReasoningCard';
export { AIConflictWizard, ConflictIndicatorBadge } from './ai/AIConflictWizard';

// Views
export { TimelineView } from './views/TimelineView';
export { MapScheduleView } from './views/MapScheduleView';

// Mobile Components
export { ScheduleBottomSheet } from './mobile/ScheduleBottomSheet';
export { SwipeTimePicker, TimePickerCompact } from './mobile/SwipeTimePicker';
export { QuickActionsWheel, useQuickActionsWheel } from './mobile/QuickActionsWheel';

// Smart Features
export { SmartAgenda, SmartAgendaCompact } from './smart/SmartAgenda';

// Hooks
export { useAIScheduling2026 } from './hooks/useAIScheduling2026';
export { useNaturalLanguage, useAISuggestions } from './hooks/useNaturalLanguage';
export { useCalendar2026Store } from './store/calendarStore';

// Types
export type * from './types';
