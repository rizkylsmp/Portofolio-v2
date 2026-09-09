import React from "react";
import { BiX, BiZoomIn } from "react-icons/bi";
import { MdArrowForward, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { PiDesktopBold, PiGameControllerBold, PiGridFourBold } from "react-icons/pi";
import { getProjects } from "../services/storageService";
import { renderIcons } from "../utils/iconRenderer";
import type { Project } from "../types/content";

type CategoryFilter = "all" | Project["category"];
type GridColumns = 3 | 4 | 5;

type PreviewState = {
  project: Project;
  imageIndex: number;
};

const filters: Array<{
  value: CategoryFilter;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: "all", label: "All", icon: <PiGridFourBold /> },
  { value: "website", label: "Website", icon: <PiDesktopBold /> },
  { value: "game", label: "Game", icon: <PiGameControllerBold /> },
];

const ProjectsPage = () => {
  const [filter, setFilter] = React.useState<CategoryFilter>("all");
  const [gridColumns, setGridColumns] = React.useState<GridColumns>(3);
  const [preview, setPreview] = React.useState<PreviewState | null>(null);
  const [cardImageIndexes, setCardImageIndexes] = React.useState<Record<string, number>>({});
  const projects = getProjects();
  const visibleProjects = filter === "all"
    ? projects
    : projects.filter((project) => project.category === filter);
  const gridClass = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-3 xl:grid-cols-4",
    5: "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  }[gridColumns];

  React.useEffect(() => {
    if (!preview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
      if (event.key === "ArrowLeft") {
        setPreview((current) => current ? {
          ...current,
          imageIndex: (current.imageIndex - 1 + current.project.images.length) % current.project.images.length,
        } : null);
      }
      if (event.key === "ArrowRight") {
        setPreview((current) => current ? {
          ...current,
          imageIndex: (current.imageIndex + 1) % current.project.images.length,
        } : null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [preview]);

  const changePreviewImage = (direction: -1 | 1) => {
    setPreview((current) => {
      if (!current || current.project.images.length < 2) return current;
      return {
        ...current,
        imageIndex: (current.imageIndex + direction + current.project.images.length) % current.project.images.length,
      };
    });
  };

  const changeCardImage = (projectId: string, imageCount: number, direction: -1 | 1) => {
    setCardImageIndexes((current) => {
      const activeIndex = current[projectId] ?? 0;
      return {
        ...current,
        [projectId]: (activeIndex + direction + imageCount) % imageCount,
      };
    });
  };

  return (
    <div className="min-h-svh overflow-hidden border-t border-border bg-surface text-text-primary">
      <div className="mx-auto w-full max-w-[104rem] px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 md:px-10 lg:px-12 lg:pb-28 lg:pt-32 xl:px-16 2xl:px-[5.5rem]">
        <header className="mb-20 lg:mb-[clamp(5rem,11vw,10rem)]" data-aos="fade-up">
          <p className="mb-6 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-text-tertiary">Selected experiments / {String(projects.length).padStart(2, "0")}</p>
          <h1 className="-ml-[0.035em] max-w-full text-[clamp(3rem,15vw,14rem)] font-medium leading-[0.8] tracking-[-0.075em] text-accent">Playground</h1>
          <div className="mt-10 flex w-full flex-col items-start justify-between gap-6 lg:ml-auto lg:mt-12 lg:w-[82%] lg:flex-row lg:items-end lg:gap-8 xl:mt-16 xl:w-[72%] xl:gap-12">
            <p className="max-w-[35rem] text-[clamp(0.72rem,1vw,0.86rem)] leading-[1.65] text-text-secondary">
              Ruang untuk menampilkan proyek, eksperimen, dan ide yang saya
              kembangkan melalui web maupun game. Setiap karya adalah bagian
              dari proses belajar, mencoba, dan menyelesaikan masalah.
            </p>
            <div className="flex w-full flex-wrap items-end justify-start gap-6 lg:w-auto lg:flex-nowrap lg:justify-end">
              <div className="grid gap-2">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-text-tertiary">Category</span>
                <div className="flex flex-wrap justify-start gap-2" role="group" aria-label="Filter kategori playground">
                  {filters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      aria-pressed={filter === item.value}
                      className={`inline-flex min-h-11 items-center gap-2 border px-3 py-2 font-mono text-[0.66rem] uppercase transition-colors duration-200 ${filter === item.value ? "border-accent bg-accent text-surface" : "border-border bg-surface text-text-primary hover:border-accent hover:bg-accent hover:text-surface"}`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden grid gap-2 lg:grid">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-text-tertiary">Grid</span>
                <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Jumlah kolom grid">
                  {([3, 4, 5] as GridColumns[]).map((columns) => (
                    <button
                      key={columns}
                      type="button"
                      onClick={() => setGridColumns(columns)}
                      aria-pressed={gridColumns === columns}
                      className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-3 py-2 font-mono text-[0.66rem] uppercase transition-colors duration-200 ${gridColumns === columns ? "border-accent bg-accent text-surface" : "border-border bg-surface text-text-primary hover:border-accent hover:bg-accent hover:text-surface"}`}
                      aria-label={`${columns} kolom`}
                    >
                      {columns}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={`grid grid-cols-1 items-start gap-x-4 gap-y-16 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-20 ${gridClass}`} aria-live="polite">
          {visibleProjects.map((project, index) => {
            const coverImage = project.images[0];
            const hasLink = Boolean(project.link && project.link !== "#" && project.link !== "-");

            return (
              <article
                key={project.id}
                className="flex h-full min-w-0 flex-col border border-border p-3 transition-colors duration-200 hover:border-accent"
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 60, 240)}
              >
                <div className="mb-2 flex justify-between gap-4 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-text-tertiary">
                  <span>[{String(index + 1).padStart(3, "0")}]</span>
                  <span>{project.category}</span>
                </div>

                <button
                  type="button"
                  className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden border border-border bg-surface-tertiary disabled:cursor-default"
                  onClick={() => coverImage && setPreview({ project, imageIndex: cardImageIndexes[project.id] ?? 0 })}
                  disabled={!coverImage}
                  aria-label={coverImage ? `Lihat galeri ${project.title}` : `${project.title} tidak memiliki gambar`}
                >
                  {coverImage ? (
                    <img
                      src={project.images[cardImageIndexes[project.id] ?? 0] || coverImage}
                      alt={`${project.title} ${(cardImageIndexes[project.id] ?? 0) + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover saturate-[0.78] transition-[filter,opacity] duration-300 group-hover:saturate-100"
                    />
                  ) : (
                    <span className="grid min-h-48 place-items-center text-xs text-text-muted">No preview available</span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-9 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-sm:opacity-100">
                    <span><BiZoomIn /> View project</span>
                    {project.images.length > 1 && <small>{project.images.length} images</small>}
                  </span>
                  {project.images.length > 1 && (
                    <>
                      <span
                        role="button"
                        tabIndex={0}
                        className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-2xl text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          changeCardImage(project.id, project.images.length, -1);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            changeCardImage(project.id, project.images.length, -1);
                          }
                        }}
                        aria-label="Foto sebelumnya"
                      >
                        <MdChevronLeft />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-2xl text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          changeCardImage(project.id, project.images.length, 1);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            changeCardImage(project.id, project.images.length, 1);
                          }
                        }}
                        aria-label="Foto berikutnya"
                      >
                        <MdChevronRight />
                      </span>
                      <span className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {project.images.map((_, imageIndex) => (
                          <span key={imageIndex} className={`h-1.5 w-1.5 rounded-full ${imageIndex === (cardImageIndexes[project.id] ?? 0) ? "bg-white" : "bg-white/50"}`} />
                        ))}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex flex-1 flex-col pt-4">
                  <div>
                    <h2 className="text-[clamp(1rem,1.5vw,1.35rem)] font-bold leading-tight">{project.title}</h2>
                    <p className="mt-2 line-clamp-2 max-w-[32rem] text-[0.72rem] leading-[1.55] text-text-secondary">{project.description}</p>
                  </div>
                  {hasLink && (
                    <a className="mt-3 inline-flex min-h-11 min-w-max items-center gap-2 border-b border-accent font-mono text-[0.66rem] font-bold uppercase hover:[&_svg]:translate-x-1" href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`Buka ${project.title} di tab baru`}>
                      {project.buttonText || "Visit project"}
                      <MdArrowForward />
                    </a>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 font-mono text-[0.95rem] text-text-tertiary" aria-label={`Teknologi ${project.title}`}>
                  {renderIcons(project.techIcons).map((icon, iconIndex) => (
                    <span key={iconIndex}>{icon}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {visibleProjects.length === 0 && (
          <p className="py-24 text-center text-sm text-text-secondary">Belum ada karya pada kategori ini.</p>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri ${preview.project.title}`}
        >
          <div className="max-h-[94vh] w-full max-w-[76rem] overflow-y-auto bg-surface text-text-primary" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-8 p-4 sm:px-5">
              <div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-text-tertiary">{preview.project.category}</span>
                <h2 className="text-[clamp(1.25rem,2vw,2rem)] font-bold">{preview.project.title}</h2>
              </div>
              <button className="grid h-11 w-11 place-items-center text-3xl" type="button" onClick={() => setPreview(null)} aria-label="Tutup galeri">
                <BiX />
              </button>
            </div>

            <div className="relative grid min-h-[min(62vh,42rem)] place-items-center overflow-hidden bg-[#090909]">
              <img
                src={preview.project.images[preview.imageIndex]}
                alt={`${preview.project.title} ${preview.imageIndex + 1}`} className="max-h-[68vh] max-w-full object-contain"
              />
              {preview.project.images.length > 1 && (
                <>
                  <button type="button" className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-black/65 text-3xl text-white" onClick={() => changePreviewImage(-1)} aria-label="Gambar sebelumnya">
                    <MdChevronLeft />
                  </button>
                  <button type="button" className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-black/65 text-3xl text-white" onClick={() => changePreviewImage(1)} aria-label="Gambar berikutnya">
                    <MdChevronRight />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:gap-8 sm:px-5">
              <span className="min-w-max font-mono text-[0.65rem] uppercase tracking-[0.08em]">{String(preview.imageIndex + 1).padStart(2, "0")} / {String(preview.project.images.length).padStart(2, "0")}</span>
              <p className="max-w-[45rem] text-[0.78rem] leading-relaxed text-text-secondary">{preview.project.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
