import { useState, useEffect } from "react";
import styles from "../assets/styles/bubble.module.css";
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
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  return (
    <div className="md:px-44 p-20">
      <div className="flex md:flex-col lg:flex-row flex-col gap-16 py-20 justify-center items-center">
        <div className="" data-aos="fade-right">
          <img
            src={profile.photo}
            alt={`${profile.name} - ${profile.position.replace(/<[^>]*>/g, "")}`}
            className="min-h-80 max-w-56 object-cover rounded-full hover:scale-105 hover:shadow-xl duration-300"
          />
        </div>
        <div
          className="flex flex-col md:text-md lg:text-lg gap-5"
          data-aos="fade-left"
        >
          <div className="flex flex-col gap-2 text-accent transition-all duration-300">
            <div>
              <BubbleText text={profile.name} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: profile.position }} />
            <p className="text-justify relative">
              {profile.description}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {profile.socialMedia.map((sm, index) => (
                <a
                  key={index}
                  href={sm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-accent text-surface dark:bg-color-1 dark:text-color-4 px-2 py-2"
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
                  className="flex items-center gap-2 px-3 py-1 w-fit bg-accent rounded-xl border-color-2 relative h-12 overflow-hidden text-surface"
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

const BubbleText = ({ text }: { text: string }) => {
  return (
    <h2 className="text-4xl font-bold">
      {text.split("").map((child, idx) => (
        <span className={styles.hoverText} key={idx}>
          {child}
        </span>
      ))}
    </h2>
  );
};

export default ProfilePage;
