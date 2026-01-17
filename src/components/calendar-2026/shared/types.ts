// Shared types for Calendar 2026 custom views

import type { CalendarEvent, CalendarResource } from '../../calendar/CalendarProvider';

export interface TimeSlot {
  time: Date;
  hour: number;
  minute: number;
  label: string;
}

export interface ViewConfig {
  slotDuration: number; // minutes
  slotHeight: number; // pixels
  startHour: number;
  endHour: number;
  showCurrentTime: boolean;
}

export interface DragState {
  isDragging: boolean;
  event: CalendarEvent | null;
  originalStart: Date | null;
  originalEnd: Date | null;
  targetDate: Date | null;
  targetResourceId: string | null;
}

export interface ResizeState {
  isResizing: boolean;
  event: CalendarEvent | null;
  edge: 'top' | 'bottom' | null;
  originalStart: Date | null;
  originalEnd: Date | null;
}

export interface EventPosition {
  top: number;
  height: number;
  left?: number;
  width?: number;
  column?: number;
  totalColumns?: number;
}

export const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  scheduled: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-700',
  },
  confirmed: {
    bg: 'bg-blue-100',
    border: 'border-blue-600',
    text: 'text-blue-800',
  },
  'in-progress': {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-700',
  },
  completed: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-700',
  },
  cancelled: {
    bg: 'bg-slate-50',
    border: 'border-slate-400',
    text: 'text-slate-600',
  },
  pending: {
    bg: 'bg-violet-50',
    border: 'border-violet-500',
    text: 'text-violet-700',
  },
  'no-show': {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
  },
};

export const STATUS_GRADIENT_COLORS: Record<string, string> = {
  scheduled: 'from-blue-500 to-blue-600',
  confirmed: 'from-blue-600 to-blue-700',
  'in-progress': 'from-amber-500 to-amber-600',
  completed: 'from-emerald-500 to-emerald-600',
  cancelled: 'from-slate-400 to-slate-500',
  pending: 'from-violet-500 to-violet-600',
  'no-show': 'from-red-500 to-red-600',
};

export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  slotDuration: 30,
  slotHeight: 48,
  startHour: 6,
  endHour: 22,
  showCurrentTime: true,
};
