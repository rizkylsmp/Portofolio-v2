import React from "react";
import { FaReact, FaNodeJs, FaUnity } from "react-icons/fa";
import { SiExpress, SiTailwindcss, SiMysql, SiSharp } from "react-icons/si";
import { RiNextjsLine } from "react-icons/ri";
import { getImagesFromFolder } from "../utils/imageMapper";

// WEBSITE IMPORT IMAGE
import DaftarPegawai_1 from "../assets/images/projects/Website_DaftarPegawai_1.png";
import Sertikom_1 from "../assets/images/projects/Website_Sertikom_1.png";
import Sertikom_2 from "../assets/images/projects/Website_Sertikom_2.png";
import Sertikom_3 from "../assets/images/projects/Website_Sertikom_3.png";
import KychiStory_1 from "../assets/images/projects/Website_KychiStory.jpg";

// GAME IMPORT IMAGE
import PaketExpress_1 from "../assets/images/projects/Game_PaketExpress_1.png";
import PaketExpress_2 from "../assets/images/projects/Game_PaketExpress_2.jpeg";
import PONG2D_1 from "../assets/images/projects/Game_Pong2D_1.png";
import PONG2D_2 from "../assets/images/projects/Game_Pong2D_2.png";
import PONG2D_3 from "../assets/images/projects/Game_Pong2D_3.png";
import SS2D_1 from "../assets/images/projects/Game_SS2D_1.png";
import SS2D_2 from "../assets/images/projects/Game_SS2D_2.png";
import SS2D_3 from "../assets/images/projects/Game_SS2D_3.png";

const projectFolders = {
  sinkrona: import.meta.glob<{ default: string }>(
    "../assets/images/projects/sinkrona/*.{png,jpg,jpeg}",
    { eager: true }
  ),
  renwa: import.meta.glob<{ default: string }>(
    "../assets/images/projects/renwa/*.{png,jpg,jpeg}",
    { eager: true }
  ),
};

const sinkronaImages = getImagesFromFolder(projectFolders.sinkrona);
const renwaImages = getImagesFromFolder(projectFolders.renwa);

export interface ProjectCard {
  images: string[];
  alt: string;
  judul: string;
  ket: string;
  icon: React.ReactNode[];
  link: string;
  button?: string;
  aos: string;
}

const createWebsiteCards = (): ProjectCard[] => [
  {
    images: sinkronaImages,
    alt: "Sinkrona",
    judul: "Sinkrona",
    ket: "Game yang menggabungkan elemen puzzle dan strategi dengan visual yang menawan dan gameplay yang adiktif.",
    icon: [<FaUnity key="unity" />, <SiSharp key="sharp" />],
    link: "#",
    aos: "fade-left",
  },
  {
    images: renwaImages,
    alt: "Pencatatan Butik Renwa",
    judul: "Pencatatan Butik RenWa",
    ket: "Website untuk merubah metode pencatatan yang ada pada toko Butik RenWa Kab. Jember menjadi digital guna mempermudah pencatatan agar lebih tepat dan flexibel.",
    icon: [
      <FaReact key="react" />,
      <FaNodeJs key="nodejs" />,
      <SiExpress key="express" />,
      <SiTailwindcss key="tailwind" />,
      <SiMysql key="mysql" />,
    ],
    link: "https://butikrenwa.xyz/",
    button: "LIVE VIEW",
    aos: "fade-right",
  },
  {
    images: [Sertikom_1, Sertikom_2, Sertikom_3],
    alt: "Pelatihan Sertifikasi Kompetensi",
    judul: "Pelatihan Sertifikasi Kompetensi",
    ket: "Website yang dikerjakan saat pelatihan sertifikasi kompetensi. Aplikasi ini merupakan website CRUD pengarsipan surat.",
    icon: [
      <FaReact key="react" />,
      <FaNodeJs key="nodejs" />,
      <SiExpress key="express" />,
      <SiTailwindcss key="tailwind" />,
      <SiMysql key="mysql" />,
    ],
    link: "https://github.com/rizkylsmp/Sertikom",
    button: "SOURCE CODE",
    aos: "fade-left",
  },
  {
    images: [DaftarPegawai_1],
    alt: "Daftar Nama Pegawai",
    judul: "Daftar Nama Pegawai",
    ket: "Website CRUD daftar nama pegawai.",
    icon: [
      <FaReact key="react" />,
      <FaNodeJs key="nodejs" />,
      <SiExpress key="express" />,
      <SiTailwindcss key="tailwind" />,
      <SiMysql key="mysql" />,
    ],
    link: "https://github.com/rizkylsmp/DaftarPegawai",
    button: "SOURCE CODE",
    aos: "fade-right",
  },
  {
    images: [KychiStory_1],
    alt: "Kychi Story",
    judul: "Kychi Story",
    ket: "Website novel dan manga menggunakan data rest api open source.",
    icon: [<RiNextjsLine key="nextjs" />, <SiTailwindcss key="tailwind" />],
    link: "https://kychistory.my.id",
    button: "LIVE VIEW",
    aos: "fade-left",
  },
];

const createGameCards = (): ProjectCard[] => [
  {
    images: [PaketExpress_1, PaketExpress_2],
    alt: "Paket Express: Tantang Waktu",
    judul: "Paket Express: Tantang Waktu",
    ket: "Game 3D simulasi menjadi seorang kurir yang mengantar paket ke tujuan dengan waktu yang sudah ditentukan.",
    icon: [<FaUnity key="unity" />, <SiSharp key="sharp" />],
    link: "https://rockmoon.itch.io/paket-express-tantang-waktu",
    aos: "fade-right",
  },
  {
    images: [PONG2D_1, PONG2D_2, PONG2D_3],
    alt: "Pong 2D",
    judul: "Battle of Pong 2D",
    ket: "Game ping pong yang dapat dimainkan secara multiplayer atau singleplayer dalam 2D.",
    icon: [<FaUnity key="unity" />, <SiSharp key="sharp" />],
    link: "https://rizkylsmp.itch.io/battle-of-pong-2d",
    aos: "fade-left",
  },
  {
    images: [SS2D_1, SS2D_2, SS2D_3],
    alt: "Side Scrolling 2D",
    judul: "Side Scrolling 2D",
    ket: "Game basic side scrolling / platformer yang dapat dimainkan dalam 2D dengan mengkonfigurasi animasi, tilemap, dan mekanik game seperti movement, health system, dan attack.",
    icon: [<FaUnity key="unity" />, <SiSharp key="sharp" />],
    link: "#",
    aos: "fade-right",
  },
];

export const WebsiteCards = createWebsiteCards();
export const GameCards = createGameCards();
