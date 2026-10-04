import { animate, createAnimatable } from "animejs";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type Particle = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  driftX: string;
  driftY: string;
  hollow?: boolean;
};

const baseParticles: Particle[] = [
  { left: "4%", top: "12%", size: 2, duration: 18, delay: -4, driftX: "18px", driftY: "-26px" },
  { left: "10%", top: "68%", size: 3, duration: 24, delay: -12, driftX: "-14px", driftY: "22px", hollow: true },
  { left: "16%", top: "35%", size: 1, duration: 16, delay: -8, driftX: "20px", driftY: "18px" },
  { left: "22%", top: "84%", size: 2, duration: 21, delay: -2, driftX: "-22px", driftY: "-20px" },
  { left: "28%", top: "18%", size: 3, duration: 26, delay: -16, driftX: "12px", driftY: "28px", hollow: true },
  { left: "33%", top: "57%", size: 1, duration: 17, delay: -6, driftX: "-18px", driftY: "-24px" },
  { left: "39%", top: "91%", size: 2, duration: 23, delay: -10, driftX: "24px", driftY: "-18px" },
  { left: "45%", top: "28%", size: 2, duration: 19, delay: -14, driftX: "-16px", driftY: "24px" },
  { left: "50%", top: "72%", size: 4, duration: 28, delay: -5, driftX: "20px", driftY: "-30px", hollow: true },
  { left: "56%", top: "9%", size: 1, duration: 15, delay: -9, driftX: "-12px", driftY: "20px" },
  { left: "61%", top: "46%", size: 2, duration: 22, delay: -18, driftX: "18px", driftY: "26px" },
  { left: "67%", top: "87%", size: 3, duration: 25, delay: -7, driftX: "-24px", driftY: "-22px", hollow: true },
  { left: "72%", top: "22%", size: 2, duration: 20, delay: -11, driftX: "16px", driftY: "-28px" },
  { left: "77%", top: "62%", size: 1, duration: 16, delay: -3, driftX: "-20px", driftY: "18px" },
  { left: "83%", top: "39%", size: 3, duration: 27, delay: -15, driftX: "22px", driftY: "24px", hollow: true },
  { left: "89%", top: "78%", size: 2, duration: 18, delay: -6, driftX: "-16px", driftY: "-26px" },
  { left: "94%", top: "14%", size: 1, duration: 21, delay: -13, driftX: "-18px", driftY: "22px" },
  { left: "7%", top: "44%", size: 1, duration: 19, delay: -17, driftX: "14px", driftY: "26px" },
  { left: "25%", top: "49%", size: 2, duration: 25, delay: -9, driftX: "20px", driftY: "-22px" },
  { left: "42%", top: "6%", size: 2, duration: 23, delay: -19, driftX: "-22px", driftY: "20px" },
  { left: "59%", top: "95%", size: 1, duration: 17, delay: -12, driftX: "16px", driftY: "-24px" },
  { left: "74%", top: "49%", size: 2, duration: 24, delay: -4, driftX: "-20px", driftY: "-18px" },
  { left: "87%", top: "6%", size: 3, duration: 26, delay: -20, driftX: "18px", driftY: "28px", hollow: true },
  { left: "97%", top: "54%", size: 2, duration: 20, delay: -8, driftX: "-14px", driftY: "-24px" },
];

const particles = Array.from({ length: 72 }, (_, index) => {
  const seed = (index * 47 + 19) % 101;
  const row = (index * 31 + 11) % 97;
  const size = index % 17 === 0 ? 3 : index % 5 === 0 ? 2 : 1;

  return {
    left: `${seed}%`,
    top: `${row}%`,
    size,
    duration: 15 + (index % 15),
    delay: -(index % 21),
    driftX: `${(index % 2 ? -1 : 1) * (12 + (index % 16))}px`,
    driftY: `${(index % 3 ? 1 : -1) * (16 + (index % 18))}px`,
    hollow: index % 13 === 0,
  } satisfies Particle;
});

const allParticles = [...baseParticles, ...particles];

const ParticleBackground = () => {
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const meteorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof window.setTimeout>;
    let animations: Array<ReturnType<typeof animate>> = [];
    const schedule = () => {
      window.clearTimeout(timer);
      if (reducedMotion.matches || document.hidden) return;
      timer = window.setTimeout(shoot, 9000 + Math.random() * 15000);
    };
    const shoot = () => {
      const meteor = meteorRef.current;
      if (!meteor || reducedMotion.matches || document.hidden) return;
      const trail = meteor.firstElementChild as HTMLSpanElement | null;
      if (!trail) return;
      animations.forEach((animation) => animation.revert());
      meteor.style.left = `${10 + Math.random() * 50}%`;
      meteor.style.top = `${4 + Math.random() * 24}%`;
      const angle = 28 + Math.random() * 18;
      const radians = angle * Math.PI / 180;
      const distance = Math.min(window.innerWidth * 0.55, 520) * (0.75 + Math.random() * 0.25);
      const duration = 750 + Math.random() * 300;
      // Rotate only the trail so the flight coordinates stay in screen space.
      trail.style.rotate = `${angle}deg`;
      trail.style.setProperty("--meteor-length", `${Math.min(window.innerWidth * 0.2, 85 + Math.random() * 65)}px`);
      animations = [animate(meteor, {
        translateX: [0, distance * Math.cos(radians)],
        translateY: [0, distance * Math.sin(radians)],
        opacity: [0, 0.65, 0],
        duration,
        ease: "linear",
        onComplete: schedule,
      }), animate(trail, {
        scaleX: [0.15, 1, 0.08],
        duration,
        ease: "inOutSine",
      })];
    };
    const reset = () => {
      animations.forEach((animation) => animation.revert());
      schedule();
    };
    schedule();
    document.addEventListener("visibilitychange", reset);
    reducedMotion.addEventListener("change", reset);
    return () => {
      window.clearTimeout(timer);
      animations.forEach((animation) => animation.revert());
      document.removeEventListener("visibilitychange", reset);
      reducedMotion.removeEventListener("change", reset);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const layers = layerRefs.current.map((layer) => layer ? createAnimatable(layer, {
      x: 850, y: 850, ease: "out(3)",
    }) : null);
    const move = (x: number, y: number) => layers.forEach((layer, index) => {
      const depth = 5 + index * 7;
      layer?.x(x * depth);
      layer?.y(y * depth);
    });
    const handlePointer = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
      move(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);
    };
    const reset = () => move(0, 0);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    reducedMotion.addEventListener("change", reset);
    return () => {
      window.removeEventListener("pointermove", handlePointer);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      reducedMotion.removeEventListener("change", reset);
      layers.forEach((layer) => layer?.revert());
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations = allParticles.map((particle, index) => {
      const element = particleRefs.current[index];
      if (!element) return null;

      return [animate(element, {
        translateX: [0, particle.driftX, 0],
        translateY: [0, particle.driftY, 0],
        duration: particle.duration * 1000,
        delay: Math.abs(particle.delay) * 300,
        ease: "inOutSine",
        loop: true,
      }), animate(element, {
        opacity: [0.12, 0.8, 0.12],
        duration: 2400 + (index % 7) * 470,
        delay: (index % 11) * 190,
        ease: "inOutSine",
        loop: true,
      })];
    });

    return () => {
      animations.forEach((pair) => pair?.forEach((animation) => animation.revert()));
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="space-backdrop absolute inset-0" />
      <span ref={meteorRef} className="shooting-star absolute block">
        <span className="shooting-star-trail" />
      </span>
      {[0, 1, 2].map((depth) => (
        <div key={depth} ref={(element) => { layerRefs.current[depth] = element; }} className="absolute inset-0" data-star-depth={depth}>
      {allParticles.map((particle, index) => {
        if (index % 3 !== depth) return null;
        const style: CSSProperties = {
          left: particle.left,
          top: particle.top,
          width: particle.size,
          height: particle.size,
        };

        return (
          <span
            key={`${particle.left}-${particle.top}-${index}`}
            ref={(element) => { particleRefs.current[index] = element; }}
            className={`star-particle absolute block rounded-full will-change-transform ${
              particle.hollow ? "border border-text-muted/60" : "bg-text-muted/70"
            }`}
            style={style}
          />
        );
      })}
        </div>
      ))}
    </div>
  );
};

export default ParticleBackground;
