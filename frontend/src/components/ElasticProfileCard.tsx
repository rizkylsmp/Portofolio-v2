import { animate, spring } from "animejs";
import { useEffect, useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

type Props = { photo: string; name: string };

const ElasticProfileCard = ({ photo, name }: Props) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cordRef = useRef<SVGPathElement>(null);
  const position = useRef({ x: 0, y: 0, swing: 0 });
  const gesture = useRef<{ id: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const swingAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const velocity = useRef({ x: 0, time: 0, lastX: 0 });

  const paint = () => {
    const card = cardRef.current;
    const holder = holderRef.current;
    if (!card || !holder) return;
    const { x, y } = position.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rotation = reduced ? 0 : x / Math.max(holder.clientWidth, 1) * 18 + position.current.swing;
    const stretch = reduced ? 1 : 1 + Math.min(Math.hypot(x, y) / Math.max(card.clientHeight, 1) * 0.15, 0.045);
    card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scaleY(${stretch})`;
    // Map the moving attachment into the cord's fixed viewBox.
    const endX = 200 + x * 400 / Math.max(holder.clientWidth, 1);
    const endY = 32 + y;
    cordRef.current?.setAttribute("d", `M 200 2 C ${200 + position.current.swing * 2} ${endY * 0.45}, ${endX + position.current.swing} ${endY * 0.7}, ${endX} ${endY}`);
  };

  const returnHome = () => {
    gesture.current = null;
    cardRef.current?.classList.remove("is-dragging");
    animation.current?.pause();
    swingAnimation.current?.pause();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      position.current.x = 0;
      position.current.y = 0;
      position.current.swing = 0;
      paint();
      return;
    }
    animation.current = animate(position.current, {
      x: 0, y: 0,
      ease: spring({ stiffness: 180, damping: 14, mass: 0.85 }),
      onUpdate: paint,
      onComplete: paint,
    });
    const releaseVelocity = velocity.current.x * Math.exp(-(performance.now() - velocity.current.time) / 100);
    position.current.swing = Math.max(-9, Math.min(9, releaseVelocity * 7 + position.current.x * 0.025));
    swingAnimation.current = animate(position.current, {
      swing: 0, ease: spring({ stiffness: 65, damping: 7, mass: 1.1 }),
      onUpdate: paint, onComplete: paint,
    });
  };

  useEffect(() => {
    return () => { animation.current?.pause(); swingAnimation.current?.pause(); };
  }, []);

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || gesture.current) return;
    animation.current?.pause();
    swingAnimation.current?.pause();
    velocity.current = { x: 0, time: performance.now(), lastX: event.clientX };
    gesture.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      offsetX: position.current.x, offsetY: position.current.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    const holder = holderRef.current;
    if (!start || start.id !== event.pointerId || !holder) return;
    const now = performance.now();
    velocity.current.x = (event.clientX - velocity.current.lastX) / Math.max(now - velocity.current.time, 1);
    velocity.current.time = now;
    velocity.current.lastX = event.clientX;
    const limitX = Math.min(holder.clientWidth * 0.35, 105);
    const limitY = Math.min(holder.clientHeight * 0.28, 125);
    position.current.x = limitX * Math.tanh((event.clientX - start.x + start.offsetX) / limitX);
    position.current.y = limitY * Math.tanh((event.clientY - start.y + start.offsetY) / limitY);
    paint();
  };

  const handleRelease = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id !== event.pointerId) return;
    returnHome();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const nudges: Record<string, [number, number]> = {
      ArrowLeft: [-55, 0], ArrowRight: [55, 0], ArrowUp: [0, -35],
      ArrowDown: [0, 55], Enter: [0, 55], " ": [0, 55],
    };
    const nudge = nudges[event.key];
    if (!nudge || event.repeat || gesture.current) return;
    event.preventDefault();
    animation.current?.pause();
    [position.current.x, position.current.y] = nudge;
    paint();
    returnHome();
  };

  return (
    <div ref={holderRef} className="relative w-[min(100%,25rem)] lg:w-[min(100%,clamp(17rem,28vw,22rem))]">
      <svg aria-hidden="true" className="pointer-events-none absolute -top-8 left-0 h-8 w-full overflow-visible text-text-muted" viewBox="0 0 400 32" preserveAspectRatio="none">
        <circle cx="200" cy="2" r="3" fill="var(--color-surface)" stroke="currentColor" vectorEffect="non-scaling-stroke" />
        <path ref={cordRef} d="M 200 2 L 200 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`Tarik kartu foto ${name}`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        onLostPointerCapture={() => { if (gesture.current) returnHome(); }}
        onBlur={() => { if (gesture.current) returnHome(); }}
        onKeyDown={handleKey}
        className="elastic-profile-card relative rounded-[2rem] border border-border bg-[color-mix(in_srgb,var(--color-surface-secondary)_82%,transparent)] p-2 shadow-[0_1.5rem_4rem_color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
        style={{ transformOrigin: "top center", touchAction: "none", scale: 1 }}
      >
        <span aria-hidden="true" className="absolute -top-1 left-1/2 h-2 w-7 -translate-x-1/2 rounded-full border border-border bg-surface-secondary" />
        <img
          src={photo}
          alt={`${name} - Web Developer & IT Support`}
          draggable={false}
          className="pointer-events-none block aspect-[4/5] w-full rounded-[1.55rem] object-cover object-top saturate-[0.92] contrast-[1.03]"
        />
      </div>
    </div>
  );
};

export default ElasticProfileCard;
