// Quick Actions Wheel - Long-press Radial Menu
// Revolutionary quick actions for mobile scheduling

import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Plus,
  Calendar,
  Clock,
  Route,
  Sparkles,
  X,
  CalendarPlus,
  Users,
  MapPin,
  Zap,
} from 'lucide-react';
import type { QuickAction } from '../types';

interface QuickActionsWheelProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  actions?: QuickAction[];
  onActionSelect?: (actionId: string) => void;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'new-job',
    label: 'New Job',
    icon: 'calendar-plus',
    color: '#8b5cf6',
    action: () => {},
  },
  {
    id: 'block-time',
    label: 'Block Time',
    icon: 'clock',
    color: '#f59e0b',
    action: () => {},
  },
  {
    id: 'ai-schedule',
    label: 'AI Schedule',
    icon: 'sparkles',
    color: '#10b981',
    action: () => {},
  },
  {
    id: 'view-team',
    label: 'Team View',
    icon: 'users',
    color: '#3b82f6',
    action: () => {},
  },
  {
    id: 'optimize',
    label: 'Optimize',
    icon: 'route',
    color: '#ec4899',
    action: () => {},
  },
  {
    id: 'map-view',
    label: 'Map',
    icon: 'map-pin',
    color: '#06b6d4',
    action: () => {},
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  'calendar-plus': CalendarPlus,
  clock: Clock,
  sparkles: Sparkles,
  users: Users,
  route: Route,
  'map-pin': MapPin,
  zap: Zap,
  calendar: Calendar,
  plus: Plus,
};

export function QuickActionsWheel({
  visible,
  position,
  onClose,
  actions = DEFAULT_ACTIONS,
  onActionSelect,
}: QuickActionsWheelProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Calculate positions for each action around the wheel
  const actionPositions = actions.map((_, index) => {
    const angle = (index / actions.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 100;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  // Handle action selection
  const handleActionClick = useCallback(
    (action: QuickAction) => {
      setSelectedAction(action.id);

      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Execute action after animation
      setTimeout(() => {
        action.action();
        onActionSelect?.(action.id);
        onClose();
      }, 200);
    },
    [onActionSelect, onClose]
  );

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={wheelRef}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed z-50 pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Backdrop blur circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-[-120px] rounded-full bg-black/20 backdrop-blur-sm"
        />

        {/* Center close button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={onClose}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-16 h-16 rounded-full bg-white shadow-xl",
            "flex items-center justify-center",
            "hover:bg-slate-100 transition-colors",
            "z-10"
          )}
        >
          <X className="h-6 w-6 text-slate-600" />
        </motion.button>

        {/* Action buttons */}
        {actions.map((action, index) => {
          const Icon = ICON_MAP[action.icon] || Plus;
          const pos = actionPositions[index];
          const isSelected = selectedAction === action.id;
          const isHovered = hoveredAction === action.id;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 1,
                scale: isSelected ? 1.2 : isHovered ? 1.1 : 1,
                x: pos.x,
                y: pos.y,
              }}
              exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: index * 0.05,
              }}
              className="absolute top-1/2 left-1/2"
              style={{
                marginLeft: -28,
                marginTop: -28,
              }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleActionClick(action)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                className={cn(
                  "w-14 h-14 rounded-full shadow-lg",
                  "flex items-center justify-center",
                  "transition-shadow",
                  isSelected && "ring-4 ring-white"
                )}
                style={{ backgroundColor: action.color }}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.button>

              {/* Label */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={cn(
                      "absolute whitespace-nowrap px-2 py-1 rounded-md text-xs font-medium",
                      "bg-slate-900 text-white shadow-lg",
                      pos.y < 0 ? "top-16" : "bottom-16",
                      "left-1/2 -translate-x-1/2"
                    )}
                  >
                    {action.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Instruction text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-center text-sm text-white whitespace-nowrap"
        >
          Tap an action or tap center to close
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for triggering quick actions wheel on long press
export function useQuickActionsWheel() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const onLongPressStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTimer.current = setTimeout(() => {
      setPosition({ x: clientX, y: clientY });
      setIsVisible(true);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms long press
  }, []);

  const onLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    position,
    close,
    handlers: {
      onTouchStart: onLongPressStart,
      onTouchEnd: onLongPressEnd,
      onTouchCancel: onLongPressEnd,
      onMouseDown: onLongPressStart,
      onMouseUp: onLongPressEnd,
      onMouseLeave: onLongPressEnd,
    },
  };
}
