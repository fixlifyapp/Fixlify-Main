// Revolutionary Calendar Store - Zustand State Management
import { create } from 'zustand';
import type {
  Calendar2026State,
  ScheduleConflict,
  BottomSheetState,
  TimelineConfig,
  DragState,
  DailyBrief,
  PredictiveData,
  ClientPreference,
  AIReasoning
} from '../types';

const defaultTimelineConfig: TimelineConfig = {
  groupBy: 'technician',
  zoomLevel: 2,
  showTravelConnectors: true,
  showAIOptimizations: true,
};

const defaultBottomSheet: BottomSheetState = {
  isOpen: false,
  snapPoint: 'closed',
  content: null,
};

const defaultDragState: DragState = {
  isDragging: false,
  draggedEventId: null,
  dragOffset: { x: 0, y: 0 },
  dropTarget: null,
};

export const useCalendar2026Store = create<Calendar2026State>((set, get) => ({
  // AI State
  aiMode: 'passive',
  commandBarOpen: false,
  currentCommand: '',
  aiSuggestions: [],
  conflicts: [],

  // View State
  activeView: 'week',
  timelineConfig: defaultTimelineConfig,

  // Mobile State
  bottomSheet: defaultBottomSheet,
  quickActionsVisible: false,

  // Smart Features
  dailyBrief: null,
  predictiveData: new Map(),
  clientPreferences: new Map(),

  // Animation State
  dragState: defaultDragState,
  celebrationQueue: [],

  // Actions
  setCommandBarOpen: (open) => set({
    commandBarOpen: open,
    aiMode: open ? 'command' : 'passive'
  }),

  setCurrentCommand: (command) => set({ currentCommand: command }),

  setAIMode: (mode) => set({ aiMode: mode }),

  setActiveView: (view) => set({ activeView: view }),

  setBottomSheet: (state) => set((prev) => ({
    bottomSheet: { ...prev.bottomSheet, ...state }
  })),

  addConflict: (conflict) => set((state) => ({
    conflicts: [...state.conflicts, conflict]
  })),

  resolveConflict: (conflictId) => set((state) => ({
    conflicts: state.conflicts.filter(c => c.id !== conflictId)
  })),

  triggerCelebration: (eventId) => set((state) => ({
    celebrationQueue: [...state.celebrationQueue, eventId]
  })),

  // Additional actions for AI
  setAISuggestions: (suggestions: AIReasoning[]) => set({ aiSuggestions: suggestions }),

  setDailyBrief: (brief: DailyBrief | null) => set({ dailyBrief: brief }),

  updatePredictiveData: (jobId: string, data: PredictiveData) => set((state) => {
    const newMap = new Map(state.predictiveData);
    newMap.set(jobId, data);
    return { predictiveData: newMap };
  }),

  updateClientPreference: (clientId: string, pref: ClientPreference) => set((state) => {
    const newMap = new Map(state.clientPreferences);
    newMap.set(clientId, pref);
    return { clientPreferences: newMap };
  }),

  setDragState: (dragState: Partial<DragState>) => set((state) => ({
    dragState: { ...state.dragState, ...dragState }
  })),

  clearCelebration: (eventId: string) => set((state) => ({
    celebrationQueue: state.celebrationQueue.filter(id => id !== eventId)
  })),

  setTimelineConfig: (config: Partial<TimelineConfig>) => set((state) => ({
    timelineConfig: { ...state.timelineConfig, ...config }
  })),

  setQuickActionsVisible: (visible: boolean) => set({ quickActionsVisible: visible }),
}));
