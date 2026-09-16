import { useCallback, useRef, useState } from 'react';

const DISMISS_THRESHOLD_PX = 110;

/**
 * Drag-down-to-close for bottom sheets, via the visual "sheet-handle" grab
 * bar. Pointer capture keeps move/up events routed to the handle even once
 * the finger leaves it, so this needs no window-level listeners.
 */
export function useSwipeToDismiss(onDismiss: () => void) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0) setDragY(delta);
  }, [isDragging]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > DISMISS_THRESHOLD_PX) onDismiss();
    setDragY(0);
  }, [isDragging, dragY, onDismiss]);

  return {
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    sheetStyle: {
      transform: dragY ? `translateY(${dragY}px)` : undefined,
      transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };
}
