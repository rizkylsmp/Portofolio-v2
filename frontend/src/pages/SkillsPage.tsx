import React from "react";
import { getSkills } from "../services/storageService";
import type { Skill } from "../types/content";

const SkillsPage = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(
    new Set()
  );
  const [skills, setSkills] = React.useState<Skill[]>([]);

  React.useEffect(() => {
    setSkills(getSkills());
  }, []);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  if (skills.length === 0) return null;

  return (
    <div
      className="relative flex min-h-svh flex-col justify-center overflow-hidden border-t border-border bg-surface px-5 py-20 text-text-primary sm:px-8 sm:py-24 md:px-12 lg:px-16 xl:px-24"
      data-aos="fade-up"
    >
      <div className="flex flex-col gap-8 text-accent lg:px-4 xl:px-8">
        <div>
          <p className="portfolio-kicker">Capabilities / 02</p>
          <h2 className="portfolio-section-title">Skills</h2>
        </div>

        <div className="flex w-full items-center">
          <div className="relative w-full overflow-hidden border-b border-t border-border py-5 lg:py-8">
            <div className="flex w-max animate-skills-scroll gap-12 hover:[animation-play-state:paused] lg:gap-16">
              {[...skills, ...skills].map((skill, idx) => (
                <div
                  key={idx}
                  className="group relative flex shrink-0 flex-col items-center gap-2 transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(idx % skills.length)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative">
                    {!loadedImages.has(idx % skills.length) && (
                      <div className="h-16 w-16 animate-pulse rounded-lg bg-surface-tertiary md:h-20 md:w-20 lg:h-24 lg:w-24"></div>
                    )}
                    <img
                      src={skill.src}
                      alt={skill.alt}
                      className={`h-16 w-16 object-contain transition-all duration-300 group-hover:scale-110 md:h-20 md:w-20 lg:h-24 lg:w-24 ${
                        loadedImages.has(idx % skills.length)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(idx % skills.length)}
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute -top-3 flex items-center justify-center">
                    <span
                      className={`border border-border bg-surface px-2 py-1 text-center font-mono text-xs font-semibold uppercase text-accent transition-all duration-300 ${
                        hoveredIndex === idx % skills.length
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    >
                      {skill.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
