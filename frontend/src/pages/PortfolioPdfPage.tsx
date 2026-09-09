import { useEffect, useState } from "react";
import {
  getCertificates,
  getContactConfig,
  getExperiences,
  getProfile,
  getProjects,
  getSkills,
} from "../services/storageService";

const sectionClass = "pdf-section border-t border-slate-200 pt-3";
const headingClass = "mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500";
const cardClass = "pdf-card rounded-lg border border-slate-200 bg-white p-3";

function asList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

function PortfolioPdfPage() {
  const [imagesReady, setImagesReady] = useState(false);
  const profile = getProfile();
  const skills = getSkills();
  const experiences = getExperiences();
  const projects = getProjects();
  const certificates = getCertificates();
  const contact = getContactConfig();

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

        .pdf-section,
        .pdf-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pdf-image-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
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

        @media print {
          .pdf-shell {
            max-width: none;
            padding: 0;
          }

          .pdf-image-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>

      <div className="pdf-shell space-y-4">
        <header className="pdf-section border-t-0 pt-0">
          <div className="flex items-start gap-4">
            {profile.photo && (
              <img
                src={profile.photo}
                alt={profile.name}
                loading="eager"
                decoding="sync"
                className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Portfolio
              </p>
              <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
                {profile.name}
              </h1>
              <p
                className="mt-0.5 text-base font-semibold text-slate-700"
                dangerouslySetInnerHTML={{ __html: profile.position }}
              />
              <p className="mt-2 text-xs leading-5 text-slate-700">{profile.description}</p>
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
          <h2 className={headingClass}>Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <article key={`${project.title}-${project.category}`} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{project.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {project.category}
                    </p>
                  </div>
                  {project.link && project.link !== "#" && (
                    <p className="max-w-[320px] break-all text-right text-xs text-slate-500">
                      {project.link}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-700">{project.description}</p>
                {project.techIcons.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Tech: {project.techIcons.join(", ")}
                  </p>
                )}
                {project.images.length > 0 && (
                  <div className="pdf-image-grid mt-3">
                    {project.images.map((image, index) => (
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
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Certificates</h2>
          <div className="space-y-3">
            {certificates.map((certificate) => (
              <article key={certificate.title} className={cardClass}>
                <h3 className="text-sm font-bold text-slate-950">{certificate.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-700">{certificate.description}</p>
                {certificate.images.length > 0 && (
                  <div className="pdf-image-grid mt-3">
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
                    <span className="font-semibold">{link.label}:</span> {link.href}
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
