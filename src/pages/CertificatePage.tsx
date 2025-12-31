import { useState } from "react";
import SertifBNSP from "../assets/images/certificate/s_bnsp/certif_bnsp.jpg";
import SertifACA from "../assets/images/certificate/s_alibaba/Sertifikat ACA.jpg";
import SertifAlibaba from "../assets/images/certificate/s_alibaba/Sertifikat Alibaba.jpg";
import SertifMSIB from "../assets/images/certificate/s_msib/Sertifikat MSIB 5_1.jpg";
import SertifMSIB2 from "../assets/images/certificate/s_msib/Sertifikat MSIB 5_2.jpg";
import SertifICEI1 from "../assets/images/certificate/s_icei/Sertifikat ICEI Introduction to Unity Game Engine.jpg";
import SertifICEI2 from "../assets/images/certificate/s_icei/Sertifikat ICEI Pong 2D.jpg";
import SertifICEI3 from "../assets/images/certificate/s_icei/Sertifikat ICEI Top-Down Shooter 2D.jpg";
import SertifICEI4 from "../assets/images/certificate/s_icei/Sertifikat ICEI Side Scrolling Platformer 2D.jpg";
import SertifICEI5 from "../assets/images/certificate/s_icei/Sertifikat ICEI FPS 3D.jpg";
import SertifICEI6 from "../assets/images/certificate/s_icei/Sertifikat ICEI TPS 3D.jpg";
import SertifICEI7 from "../assets/images/certificate/s_icei/Sertifikat ICEI Game Monetization.jpg";
import SertifCP1 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan HTML_1.jpg";
import SertifCP2 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan CSS_1.jpg";
import SertifCP3 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan Javascript_1.jpg";
import SertifCP4 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan Javascript Konsep OOP_1.jpg";
import SertifCP5 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan Javascript DOM_1.jpg";
import SertifCP6 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan Javascript Asynchronous_1.jpg";
import SertifCP7 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan AJAX & Web API_1.jpg";
import SertifCP8 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan Bootstrap_1.jpg";
import SertifCP9 from "../assets/images/certificate/s_codepolitan/Sertifikat Codepolitan ReactJS.jpg";
import SertifCP10 from "../assets/images/certificate/s_codepolitan/s-cp-tw.jpg";
import { BiChevronDown } from "react-icons/bi";


interface CertificateGroup {
  title: string;
  icon: string;
  images: string[];
  count: number;
  color: string;
  description: string;
}

const Certificate = () => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("BNSP");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const certificateGroups: CertificateGroup[] = [
    {
      title: "BNSP",
      icon: "🏆",
      images: [SertifBNSP],
      count: 1,
      color: "from-blue-500 to-blue-600",
      description: "Sertifikat Kompetensi Profesional",
    },
    {
      title: "Alibaba Cloud",
      icon: "☁️",
      images: [SertifAlibaba, SertifACA],
      count: 2,
      color: "from-orange-500 to-orange-600",
      description: "Cloud Computing & Architecture",
    },
    {
      title: "MSIB 5",
      icon: "🚀",
      images: [SertifMSIB, SertifMSIB2],
      count: 2,
      color: "from-purple-500 to-purple-600",
      description: "Magang Bersertifikat Internasional",
    },
    {
      title: "ICEI (Unity)",
      icon: "🎮",
      images: [
        SertifICEI1,
        SertifICEI2,
        SertifICEI3,
        SertifICEI4,
        SertifICEI5,
        SertifICEI6,
        SertifICEI7,
      ],
      count: 7,
      color: "from-red-500 to-red-600",
      description: "Game Development dengan Unity Engine",
    },
    {
      title: "Codepolitan",
      icon: "💻",
      images: [
        SertifCP1,
        SertifCP2,
        SertifCP3,
        SertifCP4,
        SertifCP5,
        SertifCP6,
        SertifCP7,
        SertifCP8,
        SertifCP9,
        SertifCP10,
      ],
      count: 10,
      color: "from-green-500 to-green-600",
      description: "Web Development & Programming",
    },
  ];

  const toggleExpand = (title: string) => {
    setExpandedGroup(expandedGroup === title ? null : title);
  };
  return (
    <div className="border-t-2 dark:border-color-4 p-10 py-28 bg-linear-to-b from-transparent to-color-surface-tertiary dark:to-color-3">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div
          data-aos="fade-up"
          className="text-center mb-16"
        >
          <h1 className="font-bold md:text-5xl text-4xl text-accent mb-4">
            CERTIFICATE
          </h1>
        </div>

        {/* Certificate Groups */}
        <div className="space-y-4">
          {certificateGroups.map((group, index) => (
            <div
              key={group.title}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group"
            >
              {/* Group Header - Clickable */}
              <button
                onClick={() => toggleExpand(group.title)}
                className="w-full p-6 bg-linear-to-l from-white to-surface-secondary rounded-lg border-2 border-border hover:shadow-lg transition-all duration-300 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-3xl">{group.icon}</span>
                    <div>
                      <h2 className="font-bold text-lg md:text-xl text-accent group-hover:translate-x-2 transition-transform">
                        {group.title}
                      </h2>
                      <p className="text-sm text-text-secondary dark:text-text-secondary">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-linear-to-r ${group.color}`}>
                      {group.count}
                    </span>
                    <BiChevronDown
                      size={24}
                      className={`text-accent dark:text-surface transition-transform duration-300 ${
                        expandedGroup === group.title ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Certificate Images - Expandable */}
              {expandedGroup === group.title && (
                <div className="mt-4 p-6 bg-color-surface dark:bg-color-2 rounded-lg border-2 border-border border-color-border animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative group/card cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${group.title} Certificate ${imgIndex + 1}`}
                          className="w-full h-48 object-cover group-hover/card:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover/card:opacity-100 transition-opacity text-sm font-semibold">
                            Click to View
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Certificates", value: "22" },
            { label: "Different Programs", value: "5" },
            { label: "Training Hours", value: "500+" },
            { label: "Organizations", value: "5" },
          ].map((stat, index) => (
            <div
              key={index}
              data-aos="zoom-in"
              data-aos-delay={index * 50}
              className="p-4 bg-surface dark:bg-color-2 rounded-lg border-2 border-border text-center hover:shadow-lg transition-shadow"
            >
              <p className="text-2xl md:text-3xl font-bold text-accent mb-2">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-text-secondary dark:text-text-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white dark:bg-color-2 rounded-lg max-w-3xl w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Certificate Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;
