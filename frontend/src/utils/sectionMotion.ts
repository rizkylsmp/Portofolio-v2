import { animate } from "animejs";

let activeScroll: ReturnType<typeof animate> | null = null;
let removeListeners: (() => void) | null = null;

export function cancelSectionMotion() {
  activeScroll?.pause();
  activeScroll = null;
  removeListeners?.();
  removeListeners = null;
}

export function scrollToSection(element: HTMLElement) {
  cancelSectionMotion();
  const top = Math.min(
    element.getBoundingClientRect().top + window.scrollY,
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  );
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top, behavior: "instant" });
    return;
  }

  const position = { y: window.scrollY };
  const cancelOnKey = (event: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
      cancelSectionMotion();
    }
  };
  window.addEventListener("wheel", cancelSectionMotion, { passive: true });
  window.addEventListener("touchstart", cancelSectionMotion, { passive: true });
  window.addEventListener("keydown", cancelOnKey);
  removeListeners = () => {
    window.removeEventListener("wheel", cancelSectionMotion);
    window.removeEventListener("touchstart", cancelSectionMotion);
    window.removeEventListener("keydown", cancelOnKey);
  };
  activeScroll = animate(position, {
    y: top,
    duration: Math.min(1000, 450 + Math.abs(top - position.y) * 0.12),
    ease: "inOut(3)",
    onUpdate: () => window.scrollTo({ top: position.y, behavior: "instant" }),
    onComplete: cancelSectionMotion,
  });
}
