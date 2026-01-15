// Revolutionary Calendar Types for 2026+

import type { CalendarEvent, CalendarResource, TimeRange } from '../calendar/CalendarProvider';

// AI Command Types
export interface AICommand {
  id: string;
  type: 'schedule' | 'move' | 'find' | 'optimize' | 'create' | 'show' | 'cancel';
  rawInput: string;
  parsedIntent: ParsedIntent;
  confidence: number;
  suggestedActions: SuggestedAction[];
}

export interface ParsedIntent {
  action: string;
  technician?: string;
  technicianId?: string;
  client?: string;
  clientId?: string;
  jobType?: string;
  date?: Date;
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'any';
  duration?: number;
  location?: string;
}

export interface SuggestedAction {
  id: string;
  label: string;
  description: string;
  execute: () => Promise<void>;
  icon?: string;
}

// AI Reasoning Types
export interface AIReasoning {
  slot: TimeRange;
  technician: CalendarResource;
  totalScore: number;
  factors: ReasoningFactor[];
  alternatives: AlternativeSlot[];
}

export interface ReasoningFactor {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
  icon: string;
}

export interface AlternativeSlot {
  slot: TimeRange;
  technician: CalendarResource;
  score: number;
  tradeoff: string;
}

// Conflict Resolution Types
export interface ScheduleConflict {
  id: string;
  type: 'overlap' | 'travel_time' | 'workload' | 'business_hours';
  severity: 'warning' | 'error';
  affectedEvents: CalendarEvent[];
  message: string;
  suggestions: ConflictSuggestion[];
}

export interface ConflictSuggestion {
  id: string;
  action: 'move' | 'reassign' | 'shorten' | 'cancel';
  description: string;
  newSlot?: TimeRange;
  newTechnician?: CalendarResource;
  impact: string;
  execute: () => Promise<void>;
}

// Timeline View Types
export interface TimelineConfig {
  groupBy: 'technician' | 'jobType' | 'client' | 'area';
  zoomLevel: number; // 1 = 15min slots, 4 = 1hr slots
  showTravelConnectors: boolean;
  showAIOptimizations: boolean;
}

// Map View Types
export interface MapJob {
  id: string;
  event: CalendarEvent;
  coordinates: { lat: number; lng: number };
  address: string;
  estimatedTravelTime?: number;
  routeOrder?: number;
}

export interface RouteOptimization {
  originalRoute: MapJob[];
  optimizedRoute: MapJob[];
  timeSaved: number; // minutes
  distanceSaved: number; // km
}

// Smart Agenda Types
export interface DailyBrief {
  date: Date;
  totalJobs: number;
  highPriorityJobs: number;
  estimatedDriveTime: number;
  weather?: WeatherInfo;
  insights: AgendaInsight[];
  warnings: AgendaWarning[];
}

export interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'hot' | 'cold';
  temperature: number;
  recommendation?: string;
}

export interface AgendaInsight {
  id: string;
  type: 'client_preference' | 'job_duration' | 'technician_tip' | 'route_tip';
  message: string;
  icon: string;
}

export interface AgendaWarning {
  id: string;
  type: 'conflict' | 'workload' | 'weather' | 'client';
  message: string;
  action?: () => void;
}

// Predictive Insights Types
export interface PredictiveData {
  jobId: string;
  predictedDuration: number;
  actualDuration?: number;
  confidence: number;
  factors: string[];
}

export interface ClientPreference {
  clientId: string;
  preferredTimes: TimeRange[];
  preferredTechnician?: string;
  communicationPreference: 'call' | 'sms' | 'email';
  avgJobDuration: number;
  notes: string[];
}

// Mobile Types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

export interface BottomSheetState {
  isOpen: boolean;
  snapPoint: 'closed' | 'peek' | 'half' | 'full';
  content: 'schedule' | 'details' | 'quick-actions' | null;
}

// Animation Types
export interface DragState {
  isDragging: boolean;
  draggedEventId: string | null;
  dragOffset: { x: number; y: number };
  dropTarget: { date: Date; resourceId?: string } | null;
}

// Store Types
export interface Calendar2026State {
  // AI State
  aiMode: 'passive' | 'active' | 'command';
  commandBarOpen: boolean;
  currentCommand: string;
  aiSuggestions: AIReasoning[];
  conflicts: ScheduleConflict[];

  // View State
  activeView: 'day' | 'week' | 'month' | 'team' | 'timeline' | 'map';
  timelineConfig: TimelineConfig;

  // Mobile State
  bottomSheet: BottomSheetState;
  quickActionsVisible: boolean;

  // Smart Features
  dailyBrief: DailyBrief | null;
  predictiveData: Map<string, PredictiveData>;
  clientPreferences: Map<string, ClientPreference>;

  // Animation State
  dragState: DragState;
  celebrationQueue: string[];

  // Actions
  setCommandBarOpen: (open: boolean) => void;
  setCurrentCommand: (command: string) => void;
  setAIMode: (mode: 'passive' | 'active' | 'command') => void;
  setActiveView: (view: Calendar2026State['activeView']) => void;
  setBottomSheet: (state: Partial<BottomSheetState>) => void;
  addConflict: (conflict: ScheduleConflict) => void;
  resolveConflict: (conflictId: string) => void;
  triggerCelebration: (eventId: string) => void;
}
