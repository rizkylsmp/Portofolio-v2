import { useState } from "react";
import { IoIosMail } from "react-icons/io";
import {
  FaExternalLinkAlt,
  FaWhatsapp,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaGlobe,
  FaPrint,
} from "react-icons/fa";
import { getProfile } from "../services/storageService";
import type { Profile } from "../types/content";
import ElasticProfileCard from "../components/ElasticProfileCard";

const socialMediaIconMap: Record<string, React.ReactNode> = {
  email: <IoIosMail />,
  whatsapp: <FaWhatsapp />,
  linkedin: <FaLinkedin />,
  github: <FaGithub />,
  instagram: <FaInstagram />,
  twitter: <FaTwitter />,
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  website: <FaGlobe />,
};

const ProfilePage = () => {
  const [profile] = useState<Profile | null>(() => getProfile());

  if (!profile) return null;

  return (
    <div className="relative flex h-auto min-h-svh items-center overflow-hidden border-t border-border bg-transparent px-5 py-16 text-text-primary sm:px-8 md:px-12 lg:min-h-svh lg:px-12 lg:py-8 xl:px-20 2xl:px-32">
      <div className="flex w-full max-h-none flex-col items-center justify-center gap-10 py-6 sm:gap-12 md:py-10 lg:max-h-[calc(100svh-4rem)] lg:flex-row lg:gap-12 lg:py-6 xl:gap-20">
        <div className="flex w-full justify-center lg:w-[38%] lg:justify-start" data-aos="fade-right">
          <ElasticProfileCard photo={profile.photo} name={profile.name} />
        </div>
        <div
          className="flex w-full min-w-0 flex-col gap-5 text-sm sm:text-base lg:w-[62%] lg:text-lg"
          data-aos="fade-left"
        >
          <div className="flex flex-col gap-2 text-accent transition-all duration-300">
            <p className="portfolio-kicker">Profile / 01</p>
            <h2 className="-ml-[0.035em] break-words text-[clamp(2.25rem,4.8vw,5rem)] font-medium leading-[0.92] tracking-[-0.055em] text-accent lg:text-[clamp(2rem,3.8vw,4.25rem)]">{profile.name}</h2>
            <p className="text-base font-medium text-text-primary sm:text-lg">
              Web Developer &amp; IT Support
            </p>
            <p className="w-full text-left text-sm leading-relaxed text-text-secondary">
              Saya mengembangkan website lewat Naki Code, dari merancang tampilan
              hingga menghubungkan API dan database. Pengalaman sebagai Staff IT
              membantu saya memahami kebutuhan pengguna dan menemukan solusi
              untuk masalah yang mereka hadapi sehari-hari.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {profile.socialMedia.map((sm, index) => (
                <a
                  key={index}
                  href={sm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid min-h-11 min-w-11 place-items-center rounded-none border border-border bg-surface px-2 py-2 font-mono text-10 uppercase text-text-primary transition-colors hover:border-accent hover:text-accent"
                >
                  {socialMediaIconMap[sm.type] || <FaGlobe />}
                </a>
              ))}
            </div>
              <div className="flex items-center gap-3 pt-2">
                {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-12 w-fit items-center gap-2 overflow-hidden rounded-none border border-border bg-surface px-3 py-1 font-mono text-[0.68rem] uppercase text-text-primary transition-colors hover:border-accent hover:text-accent"
                >
                  {profile.resumeLabel || "Resume"}
                  <FaExternalLinkAlt />
                </a>
                )}
                <a
                  href="/portfolio-pdf?print=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Cetak ke PDF"
                  title="Cetak ke PDF"
                  className="grid h-12 w-12 shrink-0 place-items-center border border-border bg-surface text-base text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <FaPrint aria-hidden="true" />
                </a>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
