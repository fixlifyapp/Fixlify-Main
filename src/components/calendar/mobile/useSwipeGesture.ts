import * as React from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

interface SwipeGestureReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  swipeDirection: "left" | "right" | "up" | "down" | null;
  isSwiping: boolean;
}

/**
 * Hook for detecting swipe gestures on touch devices
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeGestureOptions): SwipeGestureReturn {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [swipeDirection, setSwipeDirection] = React.useState<
    "left" | "right" | "up" | "down" | null
  >(null);
  const [isSwiping, setIsSwiping] = React.useState(false);

  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      setIsSwiping(true);
      setSwipeDirection(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Determine direction based on which axis has more movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 20) {
          setSwipeDirection("right");
        } else if (deltaX < -20) {
          setSwipeDirection("left");
        }
      } else {
        if (deltaY > 20) {
          setSwipeDirection("down");
        } else if (deltaY < -20) {
          setSwipeDirection("up");
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Determine if it was a swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold) {
          onSwipeRight?.();
        } else if (deltaX < -threshold) {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold) {
          onSwipeDown?.();
        } else if (deltaY < -threshold) {
          onSwipeUp?.();
        }
      }

      touchStartRef.current = null;
      setIsSwiping(false);

      // Clear direction after animation
      setTimeout(() => setSwipeDirection(null), 300);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return { containerRef, swipeDirection, isSwiping };
}
