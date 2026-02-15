import React from "react";
import IMG from "../assets/images/profile/Footer.jpg";
import {
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaWhatsapp,
  FaArrowRight,
  FaPaperPlane,
  FaUser,
  FaEnvelopeOpen,
} from "react-icons/fa";

interface ContactLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  description: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage = () => {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<
    "idle" | "success" | "error"
  >("idle");

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
      description: "Send me an email directly",
    },
    {
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      href: "https://wa.link/379fob",
      color: "from-green-500 to-green-600",
      description: "Quick message via WhatsApp",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create mailto link as fallback
      const mailtoLink = `mailto:rizkylsmp@gmail.com?subject=${encodeURIComponent(
        formData.subject
      )}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;
      window.location.href = mailtoLink;

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };
  return (
    <div className="bg-gradient-to-br from-accent via-accent to-accent-hover text-surface py-16 md:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-surface rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-surface/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-surface rotate-45"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div data-aos="fade-up" className="text-center mb-16">
          <h2 className="font-bold md:text-5xl text-4xl mb-4 drop-shadow-lg">
            LET'S CREATE SOMETHING AMAZING
          </h2>
          <p className="text-surface/90 text-lg max-w-2xl mx-auto leading-relaxed">
            Ready to bring your ideas to life? Let's discuss your project and
            explore how we can work together.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div data-aos="fade-right" className="order-2 lg:order-1">
            <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-8 border border-surface/20 hover:border-surface/40 transition-all duration-300 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaPaperPlane className="text-xl" />
                Send Me a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface/60" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-surface/20 border border-surface/30 rounded-xl text-surface placeholder-surface/60 focus:bg-surface/30 focus:border-surface focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Email Input */}
                <div className="relative">
                  <FaEnvelopeOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface/60" />
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-surface/20 border border-surface/30 rounded-xl text-surface placeholder-surface/60 focus:bg-surface/30 focus:border-surface focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Subject Input */}
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Project Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 bg-surface/20 border border-surface/30 rounded-xl text-surface placeholder-surface/60 focus:bg-surface/30 focus:border-surface focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell me about your project ideas, goals, or any questions you have..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 bg-surface/20 border border-surface/30 rounded-xl text-surface placeholder-surface/60 focus:bg-surface/30 focus:border-surface focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                    isSubmitting
                      ? "bg-surface/30 text-surface/50 cursor-not-allowed"
                      : "bg-surface text-accent hover:bg-surface/90 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <FaArrowRight />
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-100 p-4 rounded-xl">
                    ✓ Message sent successfully! I'll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl">
                    ✗ Failed to send message. Please try again or contact me
                    directly.
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Contact Info & Profile */}
          <div data-aos="fade-left" className="order-1 lg:order-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-8 border border-surface/20 hover:border-surface/40 transition-all duration-300 shadow-2xl">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-surface rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <img
                    src={IMG}
                    alt="Rizky Lanang Sadana Mulyono Putra"
                    className="relative h-32 w-32 rounded-full object-cover border-4 border-surface/50 group-hover:border-surface transition-all duration-300 shadow-xl"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Rizky Lanang S.M.P
                  </h3>
                  <p className="text-surface/80 mb-4">Full Stack Developer</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <span className="px-3 py-1 bg-surface/20 rounded-full text-sm">
                      React
                    </span>
                    <span className="px-3 py-1 bg-surface/20 rounded-full text-sm">
                      Next.js
                    </span>
                    <span className="px-3 py-1 bg-surface/20 rounded-full text-sm">
                      Node.js
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Methods */}
            <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-8 border border-surface/20 space-y-4">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Quick Contact
              </h4>

              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-surface/10 hover:bg-surface/20 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div
                    className={`p-3 rounded-full bg-gradient-to-r ${method.color} text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{method.label}</div>
                    <div className="text-surface/70 text-sm">
                      {method.description}
                    </div>
                  </div>
                  <FaArrowRight className="text-surface/60 group-hover:text-surface group-hover:translate-x-1 transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-8 border border-surface/20">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">🌐</span>
                Follow Me
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 bg-surface/10 hover:bg-surface/20 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div
                      className={`p-3 rounded-full bg-gradient-to-r ${link.color} text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{link.label}</div>
                      <div className="text-surface/70 text-sm">
                        {link.description}
                      </div>
                    </div>
                    <FaArrowRight className="text-surface/60 group-hover:text-surface group-hover:translate-x-1 transition-all duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="text-center mt-16 pt-8 border-t border-surface/20"
        >
          <p className="text-surface/70">
            🚀 Looking forward to collaborating with you! I typically respond
            within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
