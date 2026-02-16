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
      className="border-t dark:border-color-4 py-28 px-10 md:px-20 overflow-hidden border-border"
      data-aos="fade-up"
    >
      <div className="flex flex-col gap-8 items-center text-accent px-8">
        <div className="text-center font-bold md:text-5xl text-4xl">SKILLS</div>

        {/* Scrolling Container */}
        <div className="w-full flex items-center">
          <style>{`
            @keyframes scroll-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .skills-scroll {
              animation: scroll-left 15s linear infinite;
            }

            .skills-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="relative w-full overflow-hidden bg-accent/5 border-b border-t border-accent/20 py-5 lg:py-8 rounded-2xl">
            <div className="skills-scroll flex gap-12 lg:gap-16 w-max">
              {[...skills, ...skills].map((skill, idx) => (
                <div
                  key={idx}
                  className="shrink-0 flex flex-col items-center gap-2 group transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(idx % skills.length)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative">
                    {!loadedImages.has(idx % skills.length) && (
                      <div className="lg:h-24 lg:w-24 md:h-20 md:w-20 h-16 w-16 bg-gray-200 animate-pulse rounded-lg"></div>
                    )}
                    <img
                      src={skill.src}
                      alt={skill.alt}
                      className={`lg:h-24 lg:w-24 md:h-20 md:w-20 h-16 w-16 object-contain transition-all duration-300 group-hover:scale-110 ${
                        loadedImages.has(idx % skills.length)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(idx % skills.length)}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center absolute -top-3 justify-center">
                    <span
                      className={`bg-surface px-2 py-1 rounded-2xl text-xs font-semibold text-accent text-center transition-all duration-300 ${
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
