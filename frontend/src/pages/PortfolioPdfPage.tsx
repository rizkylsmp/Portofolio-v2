import { useEffect, useState, useRef } from "react";
import {
  getCertificates,
  getContactConfig,
  getExperiences,
  getProfile,
  getSkills,
} from "../services/storageService";
import { usePlaygroundProjects } from "../hooks/usePlaygroundProjects";
import { playgroundKindLabels } from "../services/nakiProjects";

const sectionClass = "pdf-section border-t border-slate-300 pt-3";
const headingClass = "mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500";
const cardClass = "pdf-card rounded-lg border border-slate-200 bg-white p-3";

function asList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

function PortfolioPdfPage() {
  const [readyImageKey, setReadyImageKey] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState(0);
  const printed = useRef(false);
  const profile = getProfile();
  const skills = getSkills();
  const experiences = getExperiences();
  const { projects, loading, error, retry } = usePlaygroundProjects();
  const imageKey = JSON.stringify(projects.map((project) => [project.id, project.images]));
  const imagesReady = readyImageKey === imageKey;
  const ready = !loading && !error && imagesReady;
  const certificates = getCertificates();
  const contact = getContactConfig();

  useEffect(() => {
    if (!ready || failedImages || printed.current || new URLSearchParams(window.location.search).get("print") !== "1") return;
    printed.current = true;
    window.print();
  }, [ready, failedImages]);

  useEffect(() => {
    let cancelled = false;
    if (loading || error) return;
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(".portfolio-pdf img")
    );

    const waitForLoad = (image: HTMLImageElement) => {
      if (image.complete) return Promise.resolve();

      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    };

    Promise.all(images.map(waitForLoad))
      .then(() =>
        Promise.all(
          images.map((image) =>
            typeof image.decode === "function" ? image.decode().catch(() => undefined) : undefined
          )
        )
      )
      .then(() => {
        if (!cancelled) setFailedImages(images.filter((image) => !image.naturalWidth).length);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!cancelled) setReadyImageKey(imageKey);
          });
        });
      });

    return () => {
      cancelled = true;
    };
  }, [loading, error, imageKey]);

  if (!profile) {
    return (
      <main className="min-h-screen bg-white p-10 text-slate-900">
        <p>Data profile belum tersedia.</p>
      </main>
    );
  }

  return (
    <main
      className="portfolio-pdf bg-white text-slate-900"
      data-pdf-ready={ready ? "true" : "false"}
    >
      <div className="pdf-toolbar mx-auto flex max-w-[940px] flex-wrap items-center gap-3 border-b border-slate-200 p-4 text-sm" role="status">
        {loading ? <p>Memuat data terbaru...</p> : error ? <p>{error}</p> : !imagesReady ? <p>Menyiapkan gambar...</p> : <p>{projects.length} karya siap dicetak.</p>}
        {failedImages > 0 && <p role="alert">{failedImages} gambar gagal dimuat. Periksa koneksi sebelum mencetak.</p>}
        {error && <button type="button" onClick={retry} disabled={loading} className="border border-slate-300 px-3 py-2">Coba lagi</button>}
        <button type="button" disabled={!ready} onClick={() => window.print()} className="ml-auto border border-slate-300 px-3 py-2 disabled:opacity-40">Cetak PDF</button>
      </div>
      <style>{`
        @page {
          size: A4;
          margin: 8mm;
        }

        @media print {
          .pdf-toolbar { display: none !important; }
          html,
          body,
          #root {
            background: #ffffff !important;
          }

          .portfolio-pdf {
            padding: 0 !important;
          }

          .portfolio-pdf img {
            content-visibility: visible !important;
          }
        }

        .portfolio-pdf {
          color-adjust: exact;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }

        .pdf-shell {
          max-width: 940px;
          margin: 0 auto;
          padding: 24px 20px;
        }

        .pdf-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid #dbe3ee;
          border-radius: 0;
          padding: 12px;
          background: #ffffff;
        }

        .pdf-hero::before {
          position: absolute;
          inset: 0 auto 0 0;
          width: 5px;
          background: #0f172a;
          content: "";
        }

        .pdf-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pdf-section { break-inside: auto; }
        .pdf-section h2, .pdf-group-title { break-after: avoid; }
        .pdf-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .pdf-project-card { min-width: 0; overflow-wrap: anywhere; }
        .pdf-project-card .pdf-image-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .pdf-group-title { margin: 10px 0 6px; font-size: 12px; font-weight: 700; }

        .pdf-image-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }

        .pdf-image {
          width: 100%;
          height: 82px;
          object-fit: contain;
          border-radius: 2px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .pdf-certificate-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .pdf-certificate-card .pdf-image-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        @media screen and (max-width: 600px) {
          .pdf-project-grid, .pdf-certificate-grid { grid-template-columns: 1fr; }
        }

        .pdf-link {
          color: #475569;
          text-decoration: none;
        }

        .pdf-link:hover {
          text-decoration: underline;
        }

        @media print {
          .pdf-shell {
            max-width: none;
            padding: 0;
          }

          .pdf-image-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .pdf-certificate-grid {
            display: block;
            column-count: 2;
            column-gap: 8px;
          }
          .pdf-certificate-grid > article {
            display: inline-block;
            width: 100%;
            margin-bottom: 8px;
            vertical-align: top;
          }
          .pdf-project-grid { display: block; }
          .pdf-project-grid > article {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
            align-items: start;
            gap: 10px;
            margin-bottom: 8px;
          }
          .pdf-project-card .pdf-image-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 0;
          }
          .pdf-project-card .pdf-image { height: 70px; }
          .pdf-certificate-card .pdf-image { height: 64px; }
        }
      `}</style>

      <div className="pdf-shell space-y-4">
        <header className="pdf-hero">
          <div className="flex items-start gap-4">
            {profile.photo && (
              <img
                src={profile.photo}
                alt={profile.name}
                loading="eager"
                decoding="sync"
                className="h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-sm"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Portfolio
              </p>
              <h1 className="mt-1 text-[1.65rem] font-bold leading-tight tracking-[-0.025em] text-slate-950">
                {profile.name}
              </h1>
              <p
                className="mt-0.5 text-base font-semibold text-slate-700"
                dangerouslySetInnerHTML={{ __html: profile.position }}
              />
              <p className="mt-2 text-xs leading-[1.65] text-slate-700">{profile.description}</p>
            </div>
          </div>
        </header>

        <section className={sectionClass}>
          <h2 className={headingClass}>Skills</h2>
          <p className="text-xs font-semibold leading-5 text-slate-700">
            {skills.map((skill) => skill.name).join(" / ")}
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Experience</h2>
          <div className="space-y-3">
            {experiences.map((experience) => {
              const workImages = asList(
                Array.isArray(experience.images) && experience.images.length > 0
                  ? experience.images
                  : experience.image
                    ? [experience.image]
                    : []
              );
              const responsibilities = experience.responsibilities.length > 0
                ? experience.responsibilities.map((item) =>
                    [item.title, item.description].filter(Boolean).join(": ")
                  )
                : experience.description.split(/\n\s*\n/);

              return (
                <article key={`${experience.company}-${experience.period}`} className={cardClass}>
                  <div className="flex items-start gap-2.5">
                    {experience.companyLogo && (
                      <img
                        src={experience.companyLogo}
                        alt={experience.company}
                        loading="eager"
                        decoding="sync"
                        className="h-10 w-10 rounded-lg border border-slate-200 object-contain p-1"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-950">{experience.company}</h3>
                      {experience.companyDescription && (
                        <p className="text-xs text-slate-500">{experience.companyDescription}</p>
                      )}
                      <p className="text-xs font-semibold text-slate-800">
                        {experience.position}
                      </p>
                      <p className="text-xs text-slate-500">
                        {[experience.period, experience.location].filter(Boolean).join(" - ")}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-700">
                    {asList(responsibilities).map((responsibility) => (
                      <li key={responsibility} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-500" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>

                  {experience.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {experience.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {workImages.length > 0 && (
                    <div className="pdf-image-grid mt-3">
                      {workImages.map((image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt={`${experience.company} work ${index + 1}`}
                          loading="eager"
                          decoding="sync"
                          className="pdf-image"
                        />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Playground</h2>
          {(["company", "project", "design"] as const).map((kind) => {
            const group = projects.filter((project) => project.kind === kind);
            if (!group.length) return null;
            return <div key={kind}>
            <h3 className="pdf-group-title">{playgroundKindLabels[kind]} ({group.length})</h3>
            <div className="pdf-project-grid">
            {group.map((project) => {
              const featuredImages = project.images;

              return (
              <article key={project.id} className={`${cardClass} pdf-project-card`}>
                <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{project.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {[project.category, project.niche].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  {project.link && project.link !== "#" && (
                    <a
                      href={project.link}
                      className="pdf-link max-w-[320px] break-all text-right text-xs"
                    >
                      {project.link}
                    </a>
                  )}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-700">{project.description}</p>
                {project.techStack.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Tech: {project.techStack.join(", ")}
                  </p>
                )}
                </div>
                {featuredImages.length > 0 && (
                  <div className="pdf-image-grid mt-3">
                    {featuredImages.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`${project.title} ${index + 1}`}
                        loading="eager"
                        decoding="sync"
                        className="pdf-image"
                      />
                    ))}
                  </div>
                )}
              </article>
              );
            })}
            </div>
            </div>;
          })}
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Certificates</h2>
          <div className="pdf-certificate-grid">
            {certificates.map((certificate) => (
              <article key={certificate.title} className={`${cardClass} pdf-certificate-card`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-950">{certificate.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-600">
                    {certificate.images.length} certificate{certificate.images.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-700">{certificate.description}</p>
                <div className="pdf-image-grid mt-2">
                {certificate.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${certificate.title} ${index + 1}`}
                    loading="eager"
                    decoding="sync"
                    className="pdf-image"
                  />
                ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {contact && (
          <section className={sectionClass}>
            <h2 className={headingClass}>Contact</h2>
            <div className={cardClass}>
              <p className="text-sm font-bold text-slate-950">{contact.heading}</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{contact.subheading}</p>
              <div className="mt-3 grid gap-1.5 text-xs text-slate-700 sm:grid-cols-2">
                {contact.links.map((link) => (
                  <p key={`${link.type}-${link.href}`} className="break-all">
                    <span className="font-semibold">{link.label}:</span>{" "}
                    <a href={link.href} className="pdf-link">{link.href}</a>
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default PortfolioPdfPage;
