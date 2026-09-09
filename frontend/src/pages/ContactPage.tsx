import { useState } from "react";
import { getContactConfig } from "../services/storageService";
import type { ContactConfig } from "../types/content";

const ContactPage = () => {
  const [config] = useState<ContactConfig | null>(() => getContactConfig());

  if (!config) return null;

  const whatsappHref =
    config.links.find((link) => link.type.toLowerCase() === "whatsapp")?.href ||
    "https://wa.link/379fob";

  return (
    <div className="relative flex min-h-svh items-center overflow-hidden border-t border-border bg-surface px-5 py-20 text-accent sm:px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="mx-auto w-full max-w-[104rem]">
        <header data-aos="fade-up">
          <h2 className="break-words text-[clamp(4rem,15vw,14rem)] font-medium leading-[0.8] tracking-[-0.075em] text-accent">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubungi saya melalui WhatsApp"
            >
              <span className="relative inline-block after:absolute after:inset-x-0 after:bottom-[-0.08em] after:h-[0.06em] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100">Get In Touch</span>
            </a>
          </h2>
        </header>

        <div className="mt-12 grid w-full gap-8 sm:mt-16 md:ml-auto md:w-2/3 lg:w-1/2" data-aos="fade-up" data-aos-delay="100">
          <p className="max-w-[35rem] text-sm leading-relaxed text-text-secondary">{config.subheading}</p>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.06em] text-text-secondary" aria-label="Contact and social links">
            {config.links.map((link) => (
              <a className="transition-colors hover:text-accent focus-visible:text-accent" key={`${link.type}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer">
                <span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>

        <footer className="mt-12 flex w-full flex-col gap-2 font-mono text-[0.65rem] uppercase tracking-[0.06em] text-text-tertiary sm:mt-16 md:ml-auto md:w-2/3 lg:w-1/2">
          <span>Designed &amp; developed by RLSMP</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </footer>
      </div>
    </div>
  );
};

export default ContactPage;
