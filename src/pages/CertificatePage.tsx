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
import {
  BiChevronDown,
  BiX,
  BiZoomIn,
  BiAward,
  BiCode,
  BiGame,
} from "react-icons/bi";
import { FaUniversity, FaCertificate, FaCode, FaGamepad } from "react-icons/fa";

interface CertificateGroup {
  title: string;
  icon: React.ReactNode;
  images: string[];
  count: number;
  color: string;
  description: string;
  category: string;
}

const Certificate = () => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  const certificateGroups: CertificateGroup[] = [
    {
      title: "BNSP",
      icon: <FaCertificate />,
      images: [SertifBNSP],
      count: 1,
      color: "from-blue-500 to-blue-600",
      description:
        "Sertifikat Kompetensi Profesional Badan Nasional Sertifikasi Profesi",
      category: "professional",
    },
    {
      title: "Alibaba Cloud",
      icon: <FaUniversity />,
      images: [SertifACA, SertifAlibaba],
      count: 2,
      color: "from-orange-500 to-red-500",
      description: "Cloud Computing & Infrastructure Certification",
      category: "cloud",
    },
    {
      title: "MSIB Batch 5",
      icon: <BiAward />,
      images: [SertifMSIB, SertifMSIB2],
      count: 2,
      color: "from-green-500 to-green-600",
      description: "Magang dan Studi Independen Bersertifikat Program",
      category: "education",
    },
    {
      title: "ICEI - Game Development",
      icon: <FaGamepad />,
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
      color: "from-purple-500 to-pink-500",
      description: "Game Development with Unity Engine Certification Series",
      category: "gamedev",
    },
    {
      title: "Codepolitan - Web Development",
      icon: <FaCode />,
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
      color: "from-indigo-500 to-purple-600",
      description: "Complete Web Development Learning Path",
      category: "webdev",
    },
  ];

  const filterCategories = [
    { id: "all", label: "All Certificates", icon: <BiAward /> },
    { id: "professional", label: "Professional", icon: <FaCertificate /> },
    { id: "cloud", label: "Cloud Computing", icon: <FaUniversity /> },
    { id: "education", label: "Education", icon: <BiAward /> },
    { id: "gamedev", label: "Game Development", icon: <FaGamepad /> },
    { id: "webdev", label: "Web Development", icon: <FaCode /> },
  ];

  const filteredGroups =
    activeFilter === "all"
      ? certificateGroups
      : certificateGroups.filter((group) => group.category === activeFilter);

  const totalCertificates = certificateGroups.reduce(
    (sum, group) => sum + group.count,
    0
  );

  const handleImageLoad = (imageSrc: string) => {
    setImageLoading((prev) => ({ ...prev, [imageSrc]: false }));
  };

  const handleImageLoadStart = (imageSrc: string) => {
    setImageLoading((prev) => ({ ...prev, [imageSrc]: true }));
  };
  return (
    <div className="border-t border-border text-accent py-28 px-10 md:px-20 bg-gradient-to-b from-transparent to-surface-tertiary">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div data-aos="fade-up" className="text-center mb-16">
          <h1 className="font-bold md:text-5xl text-4xl text-accent mb-6">
            CERTIFICATES & ACHIEVEMENTS
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            A collection of professional certifications and learning
            achievements that demonstrate my commitment to continuous skill
            development.
          </p>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-surface border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold text-accent mb-2">
                {totalCertificates}
              </div>
              <div className="text-text-secondary text-sm">
                Total Certificates
              </div>
            </div>
            <div className="bg-surface border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold text-accent mb-2">
                {certificateGroups.length}
              </div>
              <div className="text-text-secondary text-sm">Institutions</div>
            </div>
            <div className="bg-surface border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold text-accent mb-2">5+</div>
              <div className="text-text-secondary text-sm">Skill Areas</div>
            </div>
            <div className="bg-surface border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold text-accent mb-2">2023</div>
              <div className="text-text-secondary text-sm">Latest Year</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div data-aos="fade-up" data-aos-delay="100" className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 p-2 bg-surface/50 rounded-2xl border border-accent/20 max-w-fit mx-auto">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === category.id
                    ? "bg-accent text-surface shadow-lg scale-105"
                    : "text-accent hover:bg-accent/10 hover:scale-105"
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Certificate Groups Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredGroups.map((group, index) => (
            <div
              key={group.title}
              data-aos="fade-up"
              data-aos-delay={index * 150}
              className="group"
            >
              {/* Group Header */}
              <div
                className="bg-surface border border-accent/30 rounded-2xl p-8 hover:border-accent/60 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() =>
                  setExpandedGroup(
                    expandedGroup === group.title ? null : group.title
                  )
                }
              >
                <div className="flex items-start gap-6 mb-6">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${group.color} text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {group.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-xl md:text-2xl text-accent group-hover:text-accent-hover transition-colors">
                        {group.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r ${group.color} shadow-lg`}
                        >
                          {group.count} Cert{group.count > 1 ? "s" : ""}
                        </span>
                        <BiChevronDown
                          className={`text-2xl text-accent transition-transform duration-300 ${
                            expandedGroup === group.title ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <p className="text-text-secondary leading-relaxed mb-4">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-accent">
                      <BiZoomIn />
                      <span>
                        {expandedGroup === group.title
                          ? "Click to collapse"
                          : "Click to view certificates"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate Preview (First 3 images) */}
                {expandedGroup !== group.title && (
                  <div className="flex gap-3 overflow-hidden">
                    {group.images.slice(0, 3).map((image, imgIndex) => (
                      <div key={imgIndex} className="relative group/preview">
                        <img
                          src={image}
                          alt={`${group.title} Certificate Preview ${
                            imgIndex + 1
                          }`}
                          className="w-24 h-16 object-cover rounded-lg border-2 border-accent/20 group-hover/preview:border-accent/60 transition-all duration-300 shadow-md"
                          loading="lazy"
                        />
                      </div>
                    ))}
                    {group.count > 3 && (
                      <div className="w-24 h-16 bg-accent/10 border-2 border-accent/20 rounded-lg flex items-center justify-center text-accent font-bold text-sm">
                        +{group.count - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Certificate Grid */}
              {expandedGroup === group.title && (
                <div className="mt-6 bg-surface-secondary border border-accent/30 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {group.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative group/card cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
                        onClick={() => {
                          setSelectedImage(image);
                          handleImageLoadStart(image);
                        }}
                      >
                        {/* Loading State */}
                        {imageLoading[image] && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center z-10">
                            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                          </div>
                        )}

                        <img
                          src={image}
                          alt={`${group.title} Certificate ${imgIndex + 1}`}
                          className="w-full h-48 object-cover group-hover/card:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onLoad={() => handleImageLoad(image)}
                          onLoadStart={() => handleImageLoadStart(image)}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                          <div className="p-4 text-white text-center">
                            <BiZoomIn className="mx-auto mb-2 text-2xl" />
                            <span className="text-sm font-semibold">
                              View Full Size
                            </span>
                          </div>
                        </div>

                        {/* Certificate Number Badge */}
                        <div className="absolute top-3 right-3 bg-accent text-surface w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {imgIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="text-center mt-16 pt-12 border-t border-accent/20"
        >
          <h3 className="text-2xl font-bold text-accent mb-4">
            Continuous Learning Journey
          </h3>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            These certifications represent my commitment to staying current with
            industry trends and best practices. I'm always looking to expand my
            skill set with new technologies and methodologies.
          </p>
        </div>
      </div>

      {/* Modal for Full Image View */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full z-10 transition-colors duration-200"
            >
              <BiX size={24} />
            </button>

            <img
              src={selectedImage}
              alt="Certificate Full View"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;
