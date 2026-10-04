import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import {
  BiChevronLeft,
  BiChevronRight,
  BiX,
  BiZoomIn,
} from "react-icons/bi";
import { getCertificates } from "../services/storageService";
import CertificateSlide from "../components/CertificateSlide";

type SelectedCertificate = {
  src: string;
  alt: string;
};

const Certificate = () => {
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});
  const [directions, setDirections] = useState<Record<string, number>>({});
  const [selectedImage, setSelectedImage] = useState<SelectedCertificate | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const certificateGroups = getCertificates();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(gridRef.current?.querySelectorAll<HTMLElement>("[data-certificate-card]") ?? []);
    const animations: Array<ReturnType<typeof animate>> = [];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const index = cards.indexOf(entry.target as HTMLElement);
        animations.push(animate(entry.target, {
          opacity: [0, 1], translateY: [22, 0],
          duration: 550, delay: (index % 3) * 65, ease: "out(3)",
        }));
      });
    }, { threshold: 0.12 });
    cards.forEach((card) => observer.observe(card));
    return () => { observer.disconnect(); animations.forEach((animation) => animation.revert()); };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
      if (event.key === "Tab") { event.preventDefault(); dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKey);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [selectedImage]);

  const totalCertificates = certificateGroups.reduce(
    (total, group) => total + group.images.length,
    0
  );

  const changeSlide = (groupId: string, imageCount: number, direction: number) => {
    setDirections((current) => ({ ...current, [groupId]: direction }));
    setActiveSlides((current) => {
      const activeIndex = current[groupId] ?? 0;
      return {
        ...current,
        [groupId]: (activeIndex + direction + imageCount) % imageCount,
      };
    });
  };

  return (
    <div className="portfolio-themed-section border-t border-border px-5 py-20 text-accent sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-24 xl:py-28">
      <div className="mx-auto max-w-7xl">
        <header data-aos="fade-up" className="mb-12 md:mb-16">
          <p className="portfolio-kicker">Recognition / 05</p>
          <h1 className="portfolio-section-title mb-7 break-words">
            Certificates
          </h1>
          <p className="max-w-2xl break-words text-lg leading-relaxed text-text-secondary">
            Professional certifications and learning achievements from the
            institutions I have studied with.
          </p>
          <div className="portfolio-meta mt-8 flex flex-wrap items-center gap-6 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <strong className="text-lg text-accent">{totalCertificates}</strong>
              Certificates
            </span>
            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <span>
              <strong className="text-lg text-accent">{certificateGroups.length}</strong>{" "}
              Institutions
            </span>
          </div>
        </header>

        {certificateGroups.length === 0 ? (
          <p className="py-12 text-center text-text-secondary">
            Belum ada sertifikat.
          </p>
        ) : (
          <div ref={gridRef} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificateGroups.map((group) => {
              const activeIndex = Math.min(
                activeSlides[group.id] ?? 0,
                Math.max(group.images.length - 1, 0)
              );
              const activeImage = group.images[activeIndex];
              const hasMultipleImages = group.images.length > 1;

              return (
                <article
                  key={group.id}
                  data-certificate-card={group.id}
                  className="portfolio-panel min-w-0 overflow-hidden border border-border bg-surface-secondary"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-white">
                    {activeImage ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImage({
                            src: activeImage,
                            alt: `${group.title} certificate ${activeIndex + 1}`,
                          })
                        }
                        className="group/image h-full w-full cursor-zoom-in"
                        aria-label={`Lihat sertifikat ${activeIndex + 1} dari ${group.title}`}
                      >
                        <CertificateSlide
                          src={activeImage}
                          alt={`${group.title} certificate ${activeIndex + 1}`}
                          direction={directions[group.id] ?? 0}
                          multiple={hasMultipleImages}
                          onChange={(direction) => changeSlide(group.id, group.images.length, direction)}
                        />
                        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-xl text-white opacity-0 transition-opacity group-hover/image:opacity-100">
                          <BiZoomIn />
                        </span>
                      </button>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-text-muted">
                        No certificate image
                      </div>
                    )}

                    {hasMultipleImages && (
                      <>
                        <button
                          type="button"
                          onClick={() => changeSlide(group.id, group.images.length, -1)}
                          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-2xl text-white shadow-lg transition-colors hover:bg-black/80"
                          aria-label={`Sertifikat sebelumnya dari ${group.title}`}
                          title="Sebelumnya"
                        >
                          <BiChevronLeft />
                        </button>
                        <button
                          type="button"
                          onClick={() => changeSlide(group.id, group.images.length, 1)}
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-2xl text-white shadow-lg transition-colors hover:bg-black/80"
                          aria-label={`Sertifikat berikutnya dari ${group.title}`}
                          title="Berikutnya"
                        >
                          <BiChevronRight />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                          {activeIndex + 1} / {group.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-4 min-w-0">
                      <h2 className="break-words text-lg font-bold text-accent sm:text-xl">
                        {group.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-text-tertiary">
                        {group.images.length} Certificate{group.images.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="leading-relaxed text-text-secondary">
                      {group.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedImage && createPortal(
        <div
          ref={dialogRef}
          className="portfolio-motion fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
        >
          <div
            className="portfolio-square-media relative max-h-[92vh] max-w-[min(96vw,72rem)] overflow-hidden bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-2xl text-white transition-colors hover:bg-black/80"
              aria-label="Tutup preview"
              title="Tutup"
            >
              <BiX />
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-h-[92vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default Certificate;
