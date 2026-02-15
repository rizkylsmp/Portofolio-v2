import RPL1 from "../assets/images/experience/rpl_work1.jpeg";
import RPL_Icon from "../assets/images/icons/raindo.png";
import { MdWork, MdAccessTime, MdLocationOn } from "react-icons/md";
import { FaCode, FaDatabase, FaNetworkWired } from "react-icons/fa";

const ExperiencePage = () => {
  const responsibilities = [
    {
      icon: <FaCode />,
      title: "Website Development",
      description:
        "Mengembangkan dan memelihara website perusahaan menggunakan teknologi web modern",
    },
    {
      icon: <FaDatabase />,
      title: "Data Management",
      description:
        "Mengelola database dan sistem informasi untuk mendukung operasional perusahaan",
    },
    {
      icon: <FaNetworkWired />,
      title: "IT Infrastructure",
      description:
        "Menangani troubleshooting dan maintenance infrastruktur IT perusahaan",
    },
  ];

  return (
    <div className="border-t border-border text-accent md:px-16 lg:px-36 p-10 py-24">
      <div
        data-aos="fade-up"
        className="font-bold md:text-5xl text-4xl p-10 text-center mb-16"
      >
        EXPERIENCE
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Timeline Line - Left Side */}
        <div className="hidden lg:block absolute left-8 top-0 h-full w-0.5 bg-accent/30">
          <div className="absolute top-0 w-4 h-4 bg-accent rounded-full -translate-x-1/2"></div>
          <div className="absolute bottom-0 w-4 h-4 bg-accent rounded-full -translate-x-1/2"></div>
        </div>

        {/* Experience Card - Full Width with Left Margin for Timeline */}
        <div data-aos="flip-left" className="lg:ml-20 w-full">
          {/* Timeline Connector for Desktop */}
          <div className="hidden lg:block absolute left-8 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <div className="w-6 h-6 bg-accent rounded-full border-4 border-surface shadow-lg"></div>
          </div>

          <div className="border border-accent/30 rounded-2xl p-8 md:p-10 hover:border-accent/60 hover:bg-accent/5 transition-all duration-500 shadow-xl hover:shadow-2xl bg-surface-secondary/50 backdrop-blur-sm">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Company Info - Now takes more space */}
              <div className="xl:w-2/3 w-full">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <img
                    src={RPL_Icon}
                    alt="RPL Icon"
                    className="w-12 h-10 object-contain rounded-lg bg-white p-1"
                  />
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-accent">
                      PT RAINDO PUTRA LESTARI
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Industrial Garments Company
                    </p>
                  </div>
                </div>

                {/* Position & Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-lg">
                    <MdWork className="text-accent" />
                    <span className="font-semibold text-accent">Staff IT</span>
                  </div>

                  <div className="flex items-center gap-3 text-text-secondary">
                    <MdAccessTime className="text-accent" />
                    <span>Juli 2024 - Sekarang</span>
                  </div>

                  <div className="flex items-center gap-3 text-text-secondary">
                    <MdLocationOn className="text-accent" />
                    <span>Pasuruan, Jawa Timur</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed mb-6">
                  Bertanggung jawab dalam mengembangkan solusi teknologi
                  informasi untuk mendukung operasional perusahaan. Membangun
                  sistem web-based dan mengelola infrastruktur IT.
                </p>

                {/* Key Responsibilities */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent text-lg">
                    Key Responsibilities:
                  </h4>
                  <div className="grid lg:grid-cols-2 gap-4">
                    {responsibilities.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors duration-300"
                      >
                        <div className="text-accent text-xl mt-1">
                          {item.icon}
                        </div>
                        <div>
                          <h5 className="font-medium text-accent mb-1">
                            {item.title}
                          </h5>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Section - Responsive sizing */}
              <div className="xl:w-1/3 w-full">
                <div className="relative group">
                  <img
                    src={RPL1}
                    alt="Working at Raindo Putra Lestari"
                    className="object-cover rounded-xl hover:scale-105 duration-500 w-full h-72 xl:h-96 shadow-lg group-hover:shadow-xl"
                  />
                  <div className="absolute inset-0 bg-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Floating Badge */}
                  <div className="absolute -top-3 -right-3 bg-accent text-surface px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Professional Experience
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Gained Section */}
            <div className="mt-8 pt-6 border-t border-accent/20">
              <h4 className="font-semibold text-accent text-lg mb-4">
                Skills & Technologies Used:
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Web Development",
                  "Database Management",
                  "IT Support",
                  "System Administration",
                  "Problem Solving",
                ].map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent text-surface rounded-full text-sm font-medium hover:bg-accent-hover transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;
