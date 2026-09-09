import { useState } from "react";
import {
  BiChevronLeft,
  BiChevronRight,
  BiX,
  BiZoomIn,
} from "react-icons/bi";
import { getCertificates } from "../services/storageService";

type SelectedCertificate = {
  src: string;
  alt: string;
};

const Certificate = () => {
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});
  const [selectedImage, setSelectedImage] = useState<SelectedCertificate | null>(null);

  const certificateGroups = getCertificates();

  const totalCertificates = certificateGroups.reduce(
    (total, group) => total + group.images.length,
    0
  );

  const changeSlide = (groupId: string, imageCount: number, direction: number) => {
    setActiveSlides((current) => {
      const activeIndex = current[groupId] ?? 0;
      return {
        ...current,
        [groupId]: (activeIndex + direction + imageCount) % imageCount,
      };
    });
  };

  return (
    <div className="portfolio-themed-section border-t border-border bg-surface px-5 py-20 text-accent sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-24 xl:py-28">
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificateGroups.map((group, groupIndex) => {
              const activeIndex = Math.min(
                activeSlides[group.id] ?? 0,
                Math.max(group.images.length - 1, 0)
              );
              const activeImage = group.images[activeIndex];
              const hasMultipleImages = group.images.length > 1;

              return (
                <article
                  key={group.id}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(groupIndex * 100, 300)}
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
                        <img
                          src={activeImage}
                          alt={`${group.title} certificate ${activeIndex + 1}`}
                          className="h-full w-full object-contain p-3 sm:p-4"
                          loading="lazy"
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

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
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
        </div>
      )}
    </div>
  );
};

export default Certificate;
