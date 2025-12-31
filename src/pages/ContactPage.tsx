import React from "react";
import IMG from "../assets/images/profile/Footer.jpg";
import {
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaWhatsapp,
  FaArrowRight,
} from "react-icons/fa";

interface ContactLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  description: string;
}

const ContactPage = () => {
  const socialLinks: ContactLink[] = [
    {
      icon: <FaInstagram />,
      label: "Instagram",
      href: "https://www.instagram.com/rizky.ls",
      color: "from-pink-500 to-purple-600",
      description: "Follow my journey & updates",
    },
    {
      icon: <FaLinkedin />,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/rizkylsmp/",
      color: "from-blue-500 to-blue-700",
      description: "Professional profile & experience",
    },
    {
      icon: <FaGithub />,
      label: "GitHub",
      href: "https://github.com/rizkylsmp",
      color: "from-gray-600 to-gray-900",
      description: "Check out my projects & code",
    },
  ];

  const contactMethods: ContactLink[] = [
    {
      icon: <FaEnvelope />,
      label: "Email",
      href: "mailto:rizkylsmp@gmail.com",
      color: "from-red-500 to-orange-600",
      description: "Send me an email anytime",
    },
    {
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      href: "https://wa.link/379fob",
      color: "from-green-500 to-emerald-600",
      description: "Quick chat via WhatsApp",
    },
  ];

  return (
    <div className="bg-linear-to-b from-accent dark:from-color-5 to-accent dark:to-color-5 text-surface py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div data-aos="fade-up" className="text-center mb-16">
          <h2 className="font-bold md:text-5xl text-4xl mb-4 drop-shadow-lg">
            GET IN TOUCH
          </h2>
          <p className="text-surface/90 text-lg max-w-2xl mx-auto">
            Let's connect! I'm always interested in hearing about new projects
            and opportunities.
          </p>
        </div>

        {/* Profile Card */}
        <div
          data-aos="zoom-in"
          className="bg-surface/10 dark:bg-color-2/30 backdrop-blur-md rounded-2xl p-8 md:p-12 mb-16 border border-border/20 hover:border-border/40 transition-all duration-300 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Profile Image */}
            <div className="shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-accent via-transparent to-accent rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <img
                  src={IMG}
                  alt="Rizky Lanang Sadana Mulyono Putra"
                  className="relative h-48 w-48 rounded-full object-cover border-4 border-border/50 group-hover:border-border transition-all duration-300 shadow-xl"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-4 text-center md:text-left flex-1">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  Rizky Lanang
                </h1>
                <p className="text-surface/90 text-lg">
                  Full Stack Developer & Tech Enthusiast
                </p>
              </div>
              <p className="text-surface/80 leading-relaxed max-w-md">
                D-III Teknologi Informasi graduate passionate about creating
                modern web solutions and interactive experiences.
              </p>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap mt-2">
                <span className="px-3 py-1 bg-surface/20 rounded-full text-sm font-semibold">
                  React
                </span>
                <span className="px-3 py-1 bg-surface/20 rounded-full text-sm font-semibold">
                  Next.js
                </span>
                <span className="px-3 py-1 bg-surface/20 rounded-full text-sm font-semibold">
                  Full Stack
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Links Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Social Media Section */}
          <div
            data-aos="fade-right"
            data-aos-delay="100"
            className="bg-border/5 backdrop-blur-md rounded-xl p-8 border border-border/10 hover:border-border/30 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">🌐</span> Connect With Me
            </h3>
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-all duration-300 border border-border/10 hover:border-border/30">
                    <div
                      className={`p-3 rounded-lg bg-linear-to-r ${link.color} text-surface group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-xl text-accent">{link.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{link.label}</h4>
                      <p className="text-surface/70 text-sm">
                        {link.description}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaArrowRight className="text-xl" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Direct Contact Section */}
          <div
            data-aos="fade-left"
            data-aos-delay="100"
            className="bg-surface/5 backdrop-blur-md rounded-xl p-8 border border-border/10 hover:border-border/30 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">💬</span> Contact Me
            </h3>
            <div className="space-y-4">
              {contactMethods.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-surface/10 hover:bg-surface/20 transition-all duration-300 border border-surface/10 hover:border-surface/30">
                    <div
                      className={`p-3 rounded-lg bg-linear-to-r ${link.color} text-surface group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-xl text-accent">{link.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{link.label}</h4>
                      <p className="text-surface/70 text-sm">
                        {link.description}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaArrowRight className="text-xl" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        
        {/* Footer */}
        <div className="text-center pt-8 border-t border-surface/20">
          <p className="text-surface/80">
            © 2026 Rizky Lanang Sadana Mulyono Putra. All rights reserved.
          </p>
          <p className="text-surface/60 text-sm mt-2">
            Thanks for visiting my portfolio! 🙏
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
