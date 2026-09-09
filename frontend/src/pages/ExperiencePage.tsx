import { useEffect, useRef, useState } from "react";
import { MdWork, MdAccessTime, MdLocationOn, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { getExperiences } from "../services/storageService";

const ExperiencePage = () => {
  const experiences = getExperiences();
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [timelineLine, setTimelineLine] = useState<{ top: number; height: number } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const measureTimeline = () => {
      const dots = dotRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (dots.length < 2) {
        setTimelineLine(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const centers = dots.map((dot) => {
        const rect = dot.getBoundingClientRect();
        return rect.top + rect.height / 2 - containerRect.top;
      });
      const firstCenter = centers[0];
      const lastCenter = centers[centers.length - 1];

      setTimelineLine({
        top: firstCenter,
        height: Math.max(lastCenter - firstCenter, 0),
      });
    };

    const scheduleMeasure = () => {
      window.requestAnimationFrame(measureTimeline);
    };

    scheduleMeasure();
    const settleTimer = window.setTimeout(scheduleMeasure, 700);
    const images = Array.from(container.querySelectorAll("img"));

    window.addEventListener("resize", scheduleMeasure);
    images.forEach((image) => {
      image.addEventListener("load", scheduleMeasure);
      image.addEventListener("error", scheduleMeasure);
    });

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", scheduleMeasure);
      images.forEach((image) => {
        image.removeEventListener("load", scheduleMeasure);
        image.removeEventListener("error", scheduleMeasure);
      });
    };
  }, [experiences.length]);

  if (experiences.length === 0) {
    return (
      <div className="portfolio-themed-section border-t border-border px-5 py-20 text-accent sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-24 2xl:px-36">
        <div className="px-0 py-8 mb-10 md:mb-16">
          <p className="portfolio-kicker">Career / 03</p>
          <h2 className="portfolio-section-title">Experience</h2>
        </div>
        <p className="text-center text-text-secondary">Belum ada pengalaman kerja.</p>
      </div>
    );
  }

  const handlePrevImage = (experienceId: string, totalImages: number) => {
    setActiveImageIndex((current) => {
      const currentIndex = current[experienceId] || 0;
      return {
        ...current,
        [experienceId]: (currentIndex - 1 + totalImages) % totalImages,
      };
    });
  };

  const handleNextImage = (experienceId: string, totalImages: number) => {
    setActiveImageIndex((current) => {
      const currentIndex = current[experienceId] || 0;
      return {
        ...current,
        [experienceId]: (currentIndex + 1) % totalImages,
      };
    });
  };

  return (
    <div className="portfolio-themed-section overflow-hidden border-t border-border px-5 py-20 text-accent sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-24 2xl:px-36">
      <div
        data-aos="fade-up"
        className="px-0 py-8 mb-10 md:mb-16"
      >
        <p className="portfolio-kicker">Career / 03</p>
        <h2 className="portfolio-section-title">Experience</h2>
      </div>

      {/* Timeline Container */}
      <div ref={timelineContainerRef} className="relative max-w-7xl mx-auto">
        {/* Timeline Line - Left Side */}
        {timelineLine && (
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-8 w-0.5 bg-accent/30"
            style={{
              top: `${timelineLine.top}px`,
              height: `${timelineLine.height}px`,
            }}
          />
        )}

        {experiences.map((exp, index) => {
          const responsibilityDescriptions = exp.responsibilities
            .map((item) => [item.title, item.description].filter(Boolean).join(": "))
            .filter(Boolean);
          const descriptions = responsibilityDescriptions.length > 0
            ? responsibilityDescriptions
            : exp.description.split(/\n\s*\n/).filter(Boolean);
          const workImages = Array.isArray(exp.images)
            ? exp.images.filter(Boolean)
            : exp.image
              ? [exp.image]
              : [];
          const activeImageIdx = Math.min(
            activeImageIndex[exp.id] || 0,
            Math.max(workImages.length - 1, 0)
          );
          const activeImage = workImages[activeImageIdx];
          const hasMultipleImages = workImages.length > 1;

          return (
          <div key={exp.id} className="relative lg:ml-20 min-w-0 mb-10">
            <span
              ref={(element) => {
                dotRefs.current[index] = element;
              }}
              aria-hidden="true"
              className="hidden lg:block absolute -left-14 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-accent ring-4 ring-surface"
            />
            <div data-aos="flip-left" className="portfolio-panel border p-5 sm:p-7 md:p-8 xl:p-10">
              {/* Header Section */}
              <div className="flex flex-col xl:flex-row gap-8">
                {/* Company Info */}
                <div className="xl:w-2/3 w-full">
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    {exp.companyLogo && (
                      <img
                        src={exp.companyLogo}
                        alt={exp.company}
                        className="portfolio-square-media w-12 h-10 object-contain border border-border bg-white p-1"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-2xl md:text-3xl font-bold text-accent">
                        {exp.company}
                      </h3>
                      {exp.companyDescription && (
                        <p className="text-text-secondary text-sm">
                          {exp.companyDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Position & Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-lg min-w-0">
                      <MdWork className="text-accent" />
                      <span className="font-semibold text-accent break-words">{exp.position}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary min-w-0">
                      <MdAccessTime className="text-accent" />
                      <span className="break-words">{exp.period}</span>
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-3 text-text-secondary min-w-0">
                        <MdLocationOn className="text-accent" />
                        <span className="break-words">{exp.location}</span>
                      </div>
                    )}
                  </div>

                  <ul className="mb-6 space-y-3">
                    {descriptions.map((description, index) => (
                      <li key={index} className="flex items-start gap-3 text-text-secondary leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"
                        />
                        <span>{description}</span>
                      </li>
                    ))}
                  </ul>

                </div>

                {/* Image Section */}
                {activeImage && (
                  <div className="xl:w-1/3 w-full">
                    <div className="portfolio-square-media relative group overflow-hidden border border-border">
                      <img
                        src={activeImage}
                        alt={`Working at ${exp.company} ${activeImageIdx + 1}`}
                        className="portfolio-square-media h-56 w-full object-cover duration-500 sm:h-72 xl:h-96"
                      />
                      <div className="absolute inset-0 bg-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {hasMultipleImages && (
                        <>
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-t from-black/35 via-transparent to-black/0">
                            <button
                              type="button"
                              onClick={() => handlePrevImage(exp.id, workImages.length)}
                              className="pointer-events-auto relative z-10 flex items-center justify-center rounded-r-xl bg-surface/70 px-2 py-6 text-accent transition-colors hover:bg-accent hover:text-surface cursor-pointer"
                              aria-label={`Foto kerja sebelumnya dari ${exp.company}`}
                            >
                              <MdChevronLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNextImage(exp.id, workImages.length)}
                              className="pointer-events-auto relative z-10 flex items-center justify-center rounded-l-xl bg-surface/70 px-2 py-6 text-accent transition-colors hover:bg-accent hover:text-surface cursor-pointer"
                              aria-label={`Foto kerja berikutnya dari ${exp.company}`}
                            >
                              <MdChevronRight />
                            </button>
                          </div>

                          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                            {workImages.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setActiveImageIndex((current) => ({ ...current, [exp.id]: idx }))
                                }
                                aria-label={`Pilih foto kerja ${idx + 1} dari ${exp.company}`}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                  idx === activeImageIdx
                                    ? "w-6 bg-accent"
                                    : "bg-surface/80 hover:bg-accent/80"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Gained Section */}
              {exp.skills.length > 0 && (
                <div className="mt-8 pt-6 border-t border-accent/20">
                  <h4 className="font-semibold text-accent text-lg mb-4">
                    Skills & Technologies Used:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="portfolio-chip px-3 py-1 text-sm font-medium transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExperiencePage;
