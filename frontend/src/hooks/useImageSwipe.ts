import { animate, spring } from "animejs";
import { useEffect, useRef } from "react";
import type { PointerEvent, MouseEvent, RefObject } from "react";

export function useImageSwipe(
  imageRef: RefObject<HTMLImageElement | null>,
  change: (direction: -1 | 1) => void,
  enabled: boolean,
  interrupt?: () => void,
) {
  const gesture = useRef<{ id: number; x: number; y: number; dx: number; time: number } | null>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => () => { animation.current?.pause(); }, []);

  const reset = () => {
    const image = imageRef.current;
    if (!image) return;
    animation.current?.pause();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      image.style.transform = "";
      image.style.opacity = "1";
    } else animation.current = animate(image, {
      translateX: 0, opacity: 1, ease: spring({ stiffness: 220, damping: 24 }),
    });
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLImageElement>) => {
      if (!enabled || !event.isPrimary || event.button !== 0) return;
      interrupt?.();
      animation.current?.pause();
      event.currentTarget.style.opacity = "1";
      suppressClick.current = false;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, time: performance.now() };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: PointerEvent<HTMLImageElement>) => {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      if (Math.abs(event.clientY - start.y) > Math.abs(dx) && Math.abs(dx) < 10) return;
      start.dx = dx;
      if (Math.abs(dx) > 6) suppressClick.current = true;
      event.currentTarget.style.transform = `translateX(${dx * 0.8}px)`;
    },
    onPointerUp: (event: PointerEvent<HTMLImageElement>) => {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      gesture.current = null;
      const threshold = Math.min(100, Math.max(40, event.currentTarget.clientWidth * 0.18));
      const velocity = Math.abs(start.dx) / Math.max(performance.now() - start.time, 1);
      if (Math.abs(start.dx) >= threshold || (Math.abs(start.dx) > 18 && velocity > 0.45)) {
        const direction = start.dx < 0 ? 1 : -1;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          event.currentTarget.style.transform = "";
          change(direction);
        } else animation.current = animate(event.currentTarget, {
          translateX: -direction * event.currentTarget.clientWidth * 0.55,
          opacity: 0, duration: 140, ease: "out(2)",
          onComplete: () => change(direction),
        });
      } else reset();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => { gesture.current = null; reset(); },
    onLostPointerCapture: () => { if (gesture.current) { gesture.current = null; reset(); } },
    onClickCapture: (event: MouseEvent) => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
  };
}
