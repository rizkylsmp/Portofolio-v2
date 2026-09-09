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
} from "react-icons/fa";
import { getProfile } from "../services/storageService";
import type { Profile } from "../types/content";

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
    <div className="relative flex h-auto min-h-svh items-center overflow-hidden border-t border-border bg-surface px-5 py-16 text-text-primary sm:px-8 md:px-12 lg:min-h-svh lg:px-12 lg:py-8 xl:px-20 2xl:px-32">
      <div className="flex w-full max-h-none flex-col items-center justify-center gap-10 py-6 sm:gap-12 md:py-10 lg:max-h-[calc(100svh-4rem)] lg:flex-row lg:gap-12 lg:py-6 xl:gap-20">
        <div className="flex w-full justify-center lg:w-[38%] lg:justify-start" data-aos="fade-right">
          <div className="relative w-[min(100%,25rem)] rounded-[2rem] border border-border bg-[color-mix(in_srgb,var(--color-surface-secondary)_82%,transparent)] p-2 shadow-[0_1.5rem_4rem_color-mix(in_srgb,var(--color-accent)_12%,transparent)] lg:w-[min(100%,clamp(17rem,28vw,22rem))]">
            <img
              src={profile.photo}
              alt={`${profile.name} - ${profile.position.replace(/<[^>]*>/g, "")}`}
              className="block aspect-[4/5] w-full rounded-[1.55rem] object-cover object-top saturate-[0.92] contrast-[1.03] transition-[transform,filter] duration-400 hover:saturate-100 hover:contrast-[1.04]"
            />
          </div>
        </div>
        <div
          className="flex w-full min-w-0 flex-col gap-5 text-sm sm:text-base lg:w-[62%] lg:text-lg"
          data-aos="fade-left"
        >
          <div className="flex flex-col gap-2 text-accent transition-all duration-300">
            <p className="portfolio-kicker">Profile / 01</p>
            <h2 className="-ml-[0.035em] break-words text-[clamp(2.25rem,4.8vw,5rem)] font-medium leading-[0.92] tracking-[-0.055em] text-accent lg:text-[clamp(2rem,3.8vw,4.25rem)]">{profile.name}</h2>
            <div dangerouslySetInnerHTML={{ __html: profile.position }} />
            <p className="relative text-justify lg:text-[clamp(0.82rem,1vw,1rem)] lg:leading-[1.55]">{profile.description}</p>
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
            {profile.resumeUrl && (
              <span className="pt-2">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-12 w-fit items-center gap-2 overflow-hidden rounded-none border border-border bg-surface px-3 py-1 font-mono text-[0.68rem] uppercase text-text-primary transition-colors hover:border-accent hover:text-accent"
                >
                  {profile.resumeLabel || "Resume"}
                  <FaExternalLinkAlt />
                </a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
