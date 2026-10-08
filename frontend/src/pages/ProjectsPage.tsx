import React from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { BiX, BiZoomIn } from "react-icons/bi";
import { MdArrowForward, MdChevronLeft, MdChevronRight, MdRefresh } from "react-icons/md";
import { usePlaygroundProjects, type PlaygroundProject } from "../hooks/usePlaygroundProjects";
import { useImageSwipe } from "../hooks/useImageSwipe";
import { playgroundKindLabels } from "../services/nakiProjects";

type GridColumns = 3 | 4 | 5;

type PreviewState = {
  project: PlaygroundProject;
  imageIndex: number;
};

const ProjectsPage = () => {
  const [filter, setFilter] = React.useState<string | null>(null);
  const [kind, setKind] = React.useState<PlaygroundProject["kind"] | null>(null);
  const [niche, setNiche] = React.useState("");
  const [gridColumns, setGridColumns] = React.useState<GridColumns>(3);
  const [preview, setPreview] = React.useState<PreviewState | null>(null);
  const [cardImageIndexes, setCardImageIndexes] = React.useState<Record<string, number>>({});
  const gridRef = React.useRef<HTMLDivElement>(null);
  const oldPositions = React.useRef(new Map<string, DOMRect>());
  const cardAnimations = React.useRef<Array<ReturnType<typeof animate>>>([]);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previewImageRef = React.useRef<HTMLImageElement>(null);
  const sourceRef = React.useRef<HTMLButtonElement | null>(null);
  const sourceBounds = React.useRef<DOMRect | null>(null);
  const opening = React.useRef(false);
  const closing = React.useRef(false);
  const zoomAnimation = React.useRef<ReturnType<typeof animate> | null>(null);
  const overlayAnimation = React.useRef<ReturnType<typeof animate> | null>(null);
  const filterExit = React.useRef<ReturnType<typeof animate> | null>(null);
  const slideDirection = React.useRef<-1 | 0 | 1>(0);
  const { projects, loading, error, retry } = usePlaygroundProjects();
  const typedProjects = kind === null ? projects : projects.filter((project) => project.kind === kind);
  const categories = [...new Set(typedProjects.map((project) => project.category))];
  const activeFilter = filter && categories.includes(filter) ? filter : null;
  const categoryProjects = activeFilter === null ? typedProjects : typedProjects.filter((project) => project.category === activeFilter);
  const niches = [...new Set(categoryProjects.map((project) => project.niche).filter(Boolean))];
  const activeNiche = kind === "design" && niches.includes(niche) ? niche : "";
  const visibleProjects = activeNiche ? categoryProjects.filter((project) => project.niche === activeNiche) : categoryProjects;
  const gridClass = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-3 xl:grid-cols-4",
    5: "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  }[gridColumns];
  const projectKey = visibleProjects.map((project) => project.id).join(",");
  const previewOpen = preview !== null;

  React.useEffect(() => {
    if (!preview || preview.project.images.length < 2) return;
    const { images } = preview.project;
    for (const offset of [-1, 1]) {
      const nextImage = new Image();
      nextImage.src = images[(preview.imageIndex + offset + images.length) % images.length];
    }
  }, [preview]);

  const captureLayout = () => {
    oldPositions.current.clear();
    gridRef.current?.querySelectorAll<HTMLElement>("[data-project-id]").forEach((card) => {
      oldPositions.current.set(card.dataset.projectId!, card.getBoundingClientRect());
    });
    cardAnimations.current.forEach((animation) => animation.revert());
  };

  const changeFilters = (commitState: () => void) => {
    filterExit.current?.revert();
    const cards = Array.from(gridRef.current?.querySelectorAll<HTMLElement>("[data-project-id]") ?? []);
    const commit = () => {
      filterExit.current?.revert();
      captureLayout();
      oldPositions.current.clear();
      commitState();
    };
    if (!cards.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) commit();
    else filterExit.current = animate(cards, {
      opacity: 0, translateY: -8, duration: 150, ease: "in(2)", onComplete: commit,
    });
  };

  React.useEffect(() => () => { filterExit.current?.revert(); }, []);

  React.useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cardAnimations.current = Array.from(gridRef.current?.querySelectorAll<HTMLElement>("[data-project-id]") ?? []).map((card, index) => {
      const previous = oldPositions.current.get(card.dataset.projectId!);
      const current = card.getBoundingClientRect();
      return animate(card, {
        translateX: [previous ? previous.left - current.left : 0, 0],
        translateY: [previous ? previous.top - current.top : 18, 0],
        opacity: [previous ? 1 : 0, 1],
        duration: 420,
        delay: previous ? 0 : Math.min(index * 35, 140),
        ease: "out(3)",
      });
    });
    oldPositions.current.clear();
    return () => cardAnimations.current.forEach((animation) => animation.revert());
  }, [activeFilter, activeNiche, kind, gridColumns, projectKey]);

  const closePreview = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    zoomAnimation.current?.revert();
    const image = previewImageRef.current;
    const target = sourceRef.current?.getBoundingClientRect();
    if (!image || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches || target.bottom < 0 || target.top > window.innerHeight) {
      setPreview(null);
      closing.current = false;
      return;
    }
    const bounds = image.getBoundingClientRect();
    overlayAnimation.current?.pause();
    if (dialogRef.current) overlayAnimation.current = animate(dialogRef.current, {
      opacity: 0, duration: 260, ease: "inOutSine",
    });
    zoomAnimation.current = animate(image, {
      translateX: target.left + target.width / 2 - bounds.left - bounds.width / 2,
      translateY: target.top + target.height / 2 - bounds.top - bounds.height / 2,
      scaleX: target.width / Math.max(bounds.width, 1),
      scaleY: target.height / Math.max(bounds.height, 1),
      opacity: [1, 0],
      duration: 260,
      ease: "inOutSine",
      onComplete: () => { setPreview(null); closing.current = false; },
    });
  }, []);

  const animatePreviewImage = () => {
    const image = previewImageRef.current;
    if (!image || closing.current) return;
    zoomAnimation.current?.revert();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      image.style.opacity = "1";
      opening.current = false;
      return;
    }
    const bounds = image.getBoundingClientRect();
    const origin = opening.current ? sourceBounds.current : null;
    opening.current = false;
    zoomAnimation.current = animate(image, {
      translateX: [origin ? origin.left + origin.width / 2 - bounds.left - bounds.width / 2 : slideDirection.current * Math.min(bounds.width * 0.25, 180), 0],
      translateY: [origin ? origin.top + origin.height / 2 - bounds.top - bounds.height / 2 : 0, 0],
      scaleX: [origin ? origin.width / Math.max(bounds.width, 1) : 1, 1],
      scaleY: [origin ? origin.height / Math.max(bounds.height, 1) : 1, 1],
      opacity: [0, 1],
      duration: origin ? 440 : 200,
      ease: "out(3)",
    });
  };

  React.useEffect(() => {
    if (!previewOpen) return;
    if (dialogRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      overlayAnimation.current = animate(dialogRef.current, {
        opacity: [0, 1], duration: 220, ease: "out(2)",
      });
    }
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (closing.current) {
        if (event.key === "Tab") event.preventDefault();
        return;
      }
      if (event.key === "Tab") {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "ArrowLeft") {
        slideDirection.current = -1;
        setPreview((current) => current ? {
          ...current,
          imageIndex: (current.imageIndex - 1 + current.project.images.length) % current.project.images.length,
        } : null);
      }
      if (event.key === "ArrowRight") {
        slideDirection.current = 1;
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
      zoomAnimation.current?.revert();
      overlayAnimation.current?.revert();
      sourceRef.current?.focus({ preventScroll: true });
    };
  }, [previewOpen, closePreview]);

  const changePreviewImage = (direction: -1 | 1) => {
    if (closing.current) return;
    slideDirection.current = direction;
    setPreview((current) => {
      if (!current || current.project.images.length < 2) return current;
      return {
        ...current,
        imageIndex: (current.imageIndex + direction + current.project.images.length) % current.project.images.length,
      };
    });
  };
  const swipe = useImageSwipe(previewImageRef, changePreviewImage, Boolean(preview && preview.project.images.length > 1), () => zoomAnimation.current?.pause());

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
    <div className="min-h-svh overflow-hidden border-t border-border bg-transparent text-text-primary">
      <div className="mx-auto w-full max-w-[104rem] px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 md:px-10 lg:px-12 lg:pb-28 lg:pt-32 xl:px-16 2xl:px-[5.5rem]">
        <header className="mb-20 lg:mb-[clamp(5rem,11vw,10rem)]" data-aos="fade-up">
          <p className="mb-6 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-text-tertiary">Selected experiments / {String(projects.length).padStart(2, "0")}</p>
          <h1 className="-ml-[0.035em] max-w-full text-[clamp(3rem,15vw,14rem)] font-medium leading-[0.8] tracking-[-0.075em] text-accent">Playground</h1>
          <div className="mt-10 flex w-full flex-col items-start gap-6 lg:mt-12 lg:gap-8 xl:mt-16">
            <p className="max-w-[35rem] text-[clamp(0.72rem,1vw,0.86rem)] leading-[1.65] text-text-secondary">
              Ruang untuk menampilkan proyek, eksperimen, dan ide yang saya
              kembangkan melalui web maupun game. Setiap karya adalah bagian
              dari proses belajar, mencoba, dan menyelesaikan masalah.
            </p>
            <div className="flex w-full flex-wrap items-end justify-between gap-6">
              <div className="grid min-w-0 gap-3">
                <div className="flex flex-wrap gap-1 border-b border-border" role="group" aria-label="Jenis karya">
                  {([null, "company", "project", "design"] as const).map((value) => (
                    <button
                      key={value ?? "all"}
                      type="button"
                      aria-pressed={kind === value}
                      onClick={() => { if (kind !== value) changeFilters(() => { setKind(value); setFilter(null); setNiche(""); }); }}
                      className={`min-h-11 border-b-2 px-3 text-sm transition-colors ${kind === value ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-accent"}`}
                    >
                      {value === null ? "Semua" : playgroundKindLabels[value]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="grid gap-1 text-xs text-text-secondary">
                    Kategori
                    <select value={activeFilter ?? ""} onChange={(event) => {
                      const value = event.target.value;
                      changeFilters(() => { setFilter(value || null); setNiche(""); });
                    }} className="min-h-11 max-w-full border border-border bg-surface px-3 text-sm text-text-primary">
                      <option value="">Semua kategori</option>
                      {categories.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  {kind === "design" && niches.length > 0 && (
                    <label className="grid gap-1 text-xs text-text-secondary">
                      Subkategori
                      <select value={activeNiche} onChange={(event) => {
                        const value = event.target.value;
                        changeFilters(() => setNiche(value));
                      }} className="min-h-11 max-w-full border border-border bg-surface px-3 text-sm text-text-primary">
                        <option value="">Semua subkategori</option>
                        {niches.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              </div>

              <div className="hidden grid gap-2 lg:grid">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-text-tertiary">Grid</span>
                <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Jumlah kolom grid">
                  {([3, 4, 5] as GridColumns[]).map((columns) => (
                    <button
                      key={columns}
                      type="button"
                      onClick={() => {
                        filterExit.current?.revert();
                        if (gridColumns === columns) return;
                        captureLayout();
                        setGridColumns(columns);
                      }}
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

        {error && (
          <div role="alert" className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <p>{error}</p>
            <button type="button" onClick={retry} disabled={loading} className="inline-flex min-h-11 items-center gap-2 border border-border px-3 hover:border-accent disabled:opacity-50">
              <MdRefresh aria-hidden="true" /> Coba lagi
            </button>
          </div>
        )}

        {loading && projects.length === 0 && (
          <p role="status" className="py-24 text-center text-sm text-text-secondary">Memuat proyek...</p>
        )}

        <div ref={gridRef} className={`grid grid-cols-1 items-start gap-x-4 gap-y-16 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-20 ${gridClass}`} aria-live="polite" aria-busy={loading}>
          {visibleProjects.map((project, index) => {
            const coverImage = project.images[0];
            const activeImageIndex = Math.min(cardImageIndexes[project.id] ?? 0, Math.max(project.images.length - 1, 0));
            const hasLink = Boolean(project.link && project.link !== "#" && project.link !== "-");

            return (
              <article
                key={project.id}
                className="flex h-full min-w-0 flex-col border border-border p-3 transition-colors duration-200 hover:border-accent"
                data-project-id={project.id}
              >
                <div className="mb-2 flex justify-between gap-4 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-text-tertiary">
                  <span>[{String(index + 1).padStart(3, "0")}]</span>
                  <span className="min-w-0 text-right break-words">{playgroundKindLabels[project.kind]} / {project.category}{project.niche ? ` / ${project.niche}` : ""}</span>
                </div>

                <button
                  type="button"
                  className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden border border-border bg-surface-tertiary disabled:cursor-default"
                  onClick={(event) => {
                    if (!coverImage) return;
                    sourceRef.current = event.currentTarget;
                    sourceBounds.current = event.currentTarget.getBoundingClientRect();
                    opening.current = true;
                    closing.current = false;
                    setPreview({ project, imageIndex: activeImageIndex });
                  }}
                  disabled={!coverImage}
                  aria-label={coverImage ? `Lihat galeri ${project.title}` : `${project.title} tidak memiliki gambar`}
                >
                  {coverImage ? (
                    <img
                      src={project.images[activeImageIndex]}
                      alt={`${project.title} ${activeImageIndex + 1}`}
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
                          <span key={imageIndex} className={`h-1.5 w-1.5 rounded-full ${imageIndex === activeImageIndex ? "bg-white" : "bg-white/50"}`} />
                        ))}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex flex-1 flex-col pt-4">
                  <div>
                    <h2 className="text-[clamp(1rem,1.5vw,1.35rem)] font-bold leading-tight">{project.title}</h2>
                    <p className="mt-2 line-clamp-2 max-w-[32rem] text-[0.72rem] leading-[1.55] text-text-secondary">{project.description}</p>
                    {project.techStack.length > 0 && <p className="mt-3 text-xs leading-relaxed text-text-tertiary">{project.techStack.join(" / ")}</p>}
                  </div>
                  {hasLink && (
                    <a className="mt-3 inline-flex min-h-11 min-w-max items-center gap-2 border-b border-accent font-mono text-[0.66rem] font-bold uppercase hover:[&_svg]:translate-x-1" href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`Buka ${project.title} di tab baru`}>
                      Visit project
                      <MdArrowForward />
                    </a>
                  )}
                </div>

              </article>
            );
          })}
        </div>

        {!loading && !error && visibleProjects.length === 0 && (
          <p className="py-24 text-center text-sm text-text-secondary">Belum ada karya pada kategori ini.</p>
        )}
      </div>

      {preview && createPortal(
        <div
          ref={dialogRef}
          className="portfolio-motion fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri ${preview.project.title}`}
        >
          <div className="max-h-[94vh] w-full max-w-[76rem] overflow-y-auto bg-surface text-text-primary" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-8 p-4 sm:px-5">
              <div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-text-tertiary">{playgroundKindLabels[preview.project.kind]} / {preview.project.category}{preview.project.niche ? ` / ${preview.project.niche}` : ""}</span>
                <h2 className="text-[clamp(1.25rem,2vw,2rem)] font-bold">{preview.project.title}</h2>
              </div>
              <button className="grid h-11 w-11 shrink-0 place-items-center text-3xl" type="button" onClick={closePreview} aria-label="Tutup galeri">
                <BiX />
              </button>
            </div>

            <div className="relative grid min-h-[min(62vh,42rem)] place-items-center bg-[#090909]">
              <img
                ref={previewImageRef}
                {...swipe}
                draggable={false}
                key={preview.project.images[preview.imageIndex]}
                onLoad={animatePreviewImage}
                onError={() => { if (previewImageRef.current) previewImageRef.current.style.opacity = "1"; }}
                style={{ opacity: 0, transformOrigin: "center", touchAction: "pan-y", cursor: "grab" }}
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
              <div className="max-w-[45rem] text-[0.78rem] leading-relaxed text-text-secondary">
                <p>{preview.project.description}</p>
                {preview.project.techStack.length > 0 && <p className="mt-3 text-text-tertiary">{preview.project.techStack.join(" / ")}</p>}
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default ProjectsPage;
