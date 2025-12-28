import RPL1 from "../assets/images/experience/rpl_work1.jpeg";
import RPL_Icon from "../assets/images/icons/raindo.png";

const ExperiencePage = () => {
  return (
    <div className="border-t-2 border-accent/30 text-accent md:px-36 p-10 py-24">
      <div
        data-aos="fade-up"
        className="font-bold md:text-5xl text-4xl p-10 text-center mb-12"
      >
        EXPERIENCE
      </div>
      
      {/* Experience Card */}
      <div
        data-aos="flip-left"
        className="border border-accent/30 rounded-xl p-8 md:p-10 hover:border-accent/60 hover:bg-accent/5 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className="flex lg:flex-row flex-col gap-8 lg:gap-10">
          {/* Decorative Star */}
          <div className="hidden lg:flex items-start justify-center">
            <div className="text-4xl text-accent">✦</div>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/4 w-full flex-shrink-0">
            <img
              src={RPL1}
              alt="Working - Raindo Putra Lestari"
              className="object-cover rounded-lg hover:scale-105 duration-300 w-full h-64 lg:h-72 shadow-md"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-4 lg:w-3/4 justify-start">
            {/* Company Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl md:text-3xl font-bold">
                PT RAINDO PUTRA LESTARI
              </h3>
              <img 
                src={RPL_Icon} 
                alt="RPL Icon" 
                className="w-10 h-8 object-contain" 
              />
            </div>

            {/* Position & Duration */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-lg">
              <span className="font-semibold text-accent">Staff IT</span>
              <span className="hidden sm:inline text-accent/50">•</span>
              <span className="text-accent/80">Juli 2024 - Sekarang</span>
            </div>

            {/* Description */}
            <ul className="space-y-3 mt-2">
              <li className="flex gap-3">
                <span className="text-accent font-bold mt-1">▸</span>
                <span className="text-base leading-relaxed">
                  Mengelola dan memperbarui data laporan export & import barang ke
                  dalam sistem guna memastikan kelancaran keluar dan masuk barang
                  kedalam maupun luar negeri.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold mt-1">▸</span>
                <span className="text-base leading-relaxed">
                  Memberikan dukungan teknis kepada pengguna terkait masalah
                  hardware, software, dan jaringan agar dapat meningkatkan
                  kelancaran pekerjaan.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;