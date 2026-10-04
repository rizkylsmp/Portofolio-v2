import { useEffect, useState, useRef } from "react";
import {
  getCertificates,
  getContactConfig,
  getExperiences,
  getProfile,
  getProjects,
  getSkills,
} from "../services/storageService";

const sectionClass = "pdf-section border-t border-slate-300 pt-3";
const headingClass = "mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500";
const cardClass = "pdf-card rounded-lg border border-slate-200 bg-white p-3";

function asList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

function PortfolioPdfPage() {
  const [imagesReady, setImagesReady] = useState(false);
  const printed = useRef(false);
  const profile = getProfile();
  const skills = getSkills();
  const experiences = getExperiences();
  const projects = getProjects();
  const certificates = getCertificates();
  const contact = getContactConfig();

  useEffect(() => {
    if (!imagesReady || printed.current || new URLSearchParams(window.location.search).get("print") !== "1") return;
    printed.current = true;
    window.print();
  }, [imagesReady]);

  useEffect(() => {
    let cancelled = false;
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
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!cancelled) setImagesReady(true);
          });
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      data-pdf-ready={imagesReady ? "true" : "false"}
    >
      <style>{`
        @page {
          size: A4;
          margin: 8mm;
        }

        @media print {
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
          border-radius: 14px;
          padding: 18px;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 68%);
        }

        .pdf-hero::before {
          position: absolute;
          inset: 0 auto 0 0;
          width: 5px;
          background: #0f172a;
          content: "";
        }

        .pdf-section,
        .pdf-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pdf-image-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }

        .pdf-image {
          width: 100%;
          height: 82px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .pdf-certificate-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .pdf-certificate-card {
          min-height: 146px;
        }

        .pdf-certificate-card:last-child:nth-child(odd) {
          grid-column: 1 / -1;
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
                      {workImages.slice(0, 3).map((image, index) => (
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
          <h2 className={headingClass}>Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => {
              const featuredImages = project.images.slice(0, 3);

              return (
              <article key={`${project.title}-${project.category}`} className={`${cardClass} pdf-project-card`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{project.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {project.category}
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
                {project.techIcons.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Tech: {project.techIcons.join(", ")}
                  </p>
                )}
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
                {certificate.images.length > 0 && (
                  <img
                    src={certificate.images[0]}
                    alt={`${certificate.title} preview`}
                    loading="eager"
                    decoding="sync"
                    className="pdf-image mt-3 max-w-[220px]"
                  />
                )}
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

        <footer className="border-t border-slate-300 pt-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
          RLSMP / Portfolio 2026
        </footer>
      </div>
    </main>
  );
}

export default PortfolioPdfPage;
