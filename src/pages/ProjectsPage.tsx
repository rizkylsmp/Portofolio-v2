import React from "react";
import { MdArrowForward, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { WebsiteCards, GameCards } from "../data/projectsData.tsx";

const ProjectsPage = () => {
  const [isSwitch, setIsSwitch] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState<{ [key: string]: number }>({});

  const handlePrevImage = (cardIndex: number, totalImages: number) => {
    const currentIndex = activeImageIndex[cardIndex] || 0;
    setActiveImageIndex({
      ...activeImageIndex,
      [cardIndex]: (currentIndex - 1 + totalImages) % totalImages,
    });
  };

  const handleNextImage = (cardIndex: number, totalImages: number) => {
    const currentIndex = activeImageIndex[cardIndex] || 0;
    setActiveImageIndex({
      ...activeImageIndex,
      [cardIndex]: (currentIndex + 1) % totalImages,
    });
  };

  const renderProjectCard = (card: typeof WebsiteCards[0], cardIndex: number) => {
    const currentImageIdx = activeImageIndex[cardIndex] || 0;
    const hasMultipleImages = card.images.length > 1;

    return (
      <div
        data-aos={card.aos}
        key={cardIndex}
        className="group relative overflow-hidden rounded-2xl bg-surface border border-accent/25 transition-all duration-500"
      >
        {/* Image Section */}
        <div className="relative h-80 overflow-hidden bg-linear-to-br from-surface-tertiary to-surface-secondary">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={card.images[currentImageIdx]}
              alt={card.alt}
              className="h-full w-full object-cover transition-transform duration-500"
            />
          </div>

          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <div className="absolute inset-0 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-t from-black/40 via-transparent to-black/0">
                <button
                  onClick={() => handlePrevImage(cardIndex, card.images.length)}
                  className="flex px-2 py-6 items-center justify-center rounded-r-xl bg-accent/30 dark:bg-surface/30 text-accent dark:text-surface transition-all duration-300 hover:bg-accent-hover dark:hover:bg-surface dark:hover:text-accent hover:text-surface cursor-pointer hover:pl-3"
                >
                  <MdChevronLeft />
                </button>
                <button
                  onClick={() => handleNextImage(cardIndex, card.images.length)}
                  className="flex px-2 py-6 items-center justify-center rounded-l-xl bg-accent/30 dark:bg-surface/30 text-accent dark:text-surface transition-all duration-300 hover:bg-accent-hover dark:hover:bg-surface dark:hover:text-accent hover:text-surface cursor-pointer hover:pr-3"
                >
                  <MdChevronRight />
                </button>
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {card.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setActiveImageIndex({ ...activeImageIndex, [cardIndex]: idx })
                    }
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIdx
                        ? "w-6 bg-accent"
                        : "bg-border hover:bg-text-tertiary"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-between p-6 md:h-56 lg:h-48">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-text-primary transition-colors duration-300">
              {card.judul}
            </h3>
            <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
              {card.ket}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Tech Icons */}
            <div className="flex flex-wrap gap-3 text-lg text-text-primary">
              {card.icon.map((icon, idx) => (
                <span
                  key={idx}
                  className="transition-all duration-300 hover:scale-125 hover:text-accent"
                >
                  {icon}
                </span>
              ))}
            </div>

            {/* Button */}
            <a
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex items-center gap-2 rounded-xl border-2 border-color-accent bg-surface px-4 py-2 font-semibold text-accent transition-all duration-300 hover:gap-3 hover:bg-accent hover:text-surface"
            >
              <span className="text-xs uppercase">{card.button || "View"}</span>
              <MdArrowForward className="transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen border-t border-border  bg-surface px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header Section */}
        <div data-aos="fade-up" className="space-y-6 text-center">
          <h1 className="text-4xl font-bold md:text-6xl text-accent">
            PROJECT PORTOFOLIO
          </h1>
        </div>

        {/* Toggle Section */}
        <div data-aos="fade-up" className="flex justify-center">
          <div className="inline-flex gap-2 rounded-full bg-border p-1.5">
            <button
              onClick={() => setIsSwitch(false)}
              className={`relative px-6 py-2.5 font-semibold text-sm transition-all duration-300 rounded-full ${
                !isSwitch
                  ? "bg-surface text-accent shadow-lg"
                  : "text-accent/80 hover:text-accent hover:bg-accent/10 cursor-pointer"
              }`}
            >
              💻 Website
            </button>
            <button
              onClick={() => setIsSwitch(true)}
              className={`relative px-6 py-2.5 font-semibold text-sm transition-all duration-300 rounded-full ${
                isSwitch
                  ? "bg-surface text-accent shadow-lg"
                  : "text-accent/80 hover:text-accent hover:bg-accent/10 cursor-pointer"
              }`}
            >
              🎮 Game
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 overflow-hidden md:grid-cols-2 lg:gap-10">
          {!isSwitch &&
            WebsiteCards.map((card, cardIndex) =>
              renderProjectCard(card, cardIndex)
            )}
          {isSwitch &&
            GameCards.map((card, cardIndex) =>
              renderProjectCard(card, cardIndex)
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
