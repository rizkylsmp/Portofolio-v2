import React from "react";

const SkillsPage = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(
    new Set()
  );

  const Images = [
    {
      name: "HTML",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
      alt: "html",
    },
    {
      name: "CSS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
      alt: "css",
    },
    {
      name: "Javascript",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
      alt: "javascript",
    },
    {
      name: "ReactJS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      alt: "reactjs",
    },
    {
      name: "NextJS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
      alt: "nextjs",
    },
    {
      name: "NodeJS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg",
      alt: "NodeJS",
    },
    {
      name: "ExpressJS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
      alt: "ExpressJS",
    },
    {
      name: "Tailwind CSS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
      alt: "TailwindCSS",
    },
    {
      name: "Bootstrap",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg",
      alt: "Bootstrap",
    },
    {
      name: "C#",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg",
      alt: "C#",
    },
    {
      name: "MySQL",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original-wordmark.svg",
      alt: "MySQL",
    },
    {
      name: "MongoDB",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg",
      alt: "MongoDB",
    },
    {
      name: "Unity",
      src: "https://cdn-icons-png.flaticon.com/512/5969/5969347.png",
      alt: "unity",
    },
  ];

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

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
              {[...Images, ...Images].map((img, idx) => (
                <div
                  key={idx}
                  className="shrink-0 flex flex-col items-center gap-2 group transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(idx % Images.length)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative">
                    {!loadedImages.has(idx % Images.length) && (
                      <div className="lg:h-24 lg:w-24 md:h-20 md:w-20 h-16 w-16 bg-gray-200 animate-pulse rounded-lg"></div>
                    )}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className={`lg:h-24 lg:w-24 md:h-20 md:w-20 h-16 w-16 object-contain transition-all duration-300 group-hover:scale-110 ${
                        loadedImages.has(idx % Images.length)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(idx % Images.length)}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center absolute -top-3 justify-center">
                    <span
                      className={`bg-surface px-2 py-1 rounded-2xl text-xs font-semibold text-accent text-center transition-all duration-300 ${
                        hoveredIndex === idx % Images.length
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    >
                      {img.name}
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
