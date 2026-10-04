import { animate } from "animejs";
import { useEffect, useRef } from "react";
import { useImageSwipe } from "../hooks/useImageSwipe";

type Props = {
  src: string; alt: string; direction: number; multiple: boolean;
  onChange: (direction: -1 | 1) => void;
};

const CertificateSlide = ({ src, alt, direction, multiple, onChange }: Props) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const swipe = useImageSwipe(imageRef, onChange, multiple, () => animation.current?.pause());
  useEffect(() => () => { animation.current?.pause(); }, []);
  const enter = () => {
    const image = imageRef.current;
    if (!image) return;
    animation.current?.pause();
    if (!direction || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      image.style.opacity = "1";
      image.style.transform = "";
      return;
    }
    animation.current = animate(image, {
      translateX: [direction * image.clientWidth * 0.3, 0],
      opacity: [0, 1], duration: 300, ease: "out(3)",
    });
  };
  return (
    <img
      key={src} ref={imageRef} src={src} alt={alt}
      {...swipe} onLoad={enter}
      onError={() => { if (imageRef.current) imageRef.current.style.opacity = "1"; }}
      draggable={false} loading="lazy"
      style={{ touchAction: "pan-y", opacity: direction ? 0 : 1 }}
      className="h-full w-full object-contain p-3 sm:p-4"
    />
  );
};

export default CertificateSlide;
