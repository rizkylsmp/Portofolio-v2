// ==========================================
// Admin Panel - Portfolio Content Management
// ==========================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import type { Experience, Project, Certificate, Profile, Responsibility, SocialMedia, Skill, ContactConfig, ContactLink } from "../types/content";
import {
  TECH_ICONS,
  RESPONSIBILITY_ICONS,
  CERTIFICATE_ICONS,
  CERTIFICATE_COLORS,
  CERTIFICATE_CATEGORIES,
  PROJECT_AOS_OPTIONS,
  SOCIAL_MEDIA_TYPES,
  CONTACT_LINK_COLORS,
} from "../types/content";
import {
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getCertificates,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getProfile,
  saveProfile,
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  getContactConfig,
  saveContactConfig,
  exportAllData,
  importAllData,
  resetAllData,
} from "../services/storageService";
import { renderIcon } from "../utils/iconRenderer";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdWork,
  MdCode,
  MdSchool,
  MdPerson,
  MdSave,
  MdClose,
  MdFileDownload,
  MdFileUpload,
  MdRestartAlt,
  MdImage,
  MdRemoveCircle,
  MdAddCircle,
  MdContactMail,
} from "react-icons/md";
import { GiSkills } from "react-icons/gi";

type Tab = "profile" | "skills" | "experience" | "projects" | "certificates" | "contact";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Data states
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [contactConfig, setContactConfig] = useState<ContactConfig | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  const refreshData = () => {
    setProfile(getProfile());
    setSkills(getSkills());
    setExperiences(getExperiences());
    setProjects(getProjects());
    setCertificates(getCertificates());
    setContactConfig(getContactConfig());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ---- Export / Import / Reset ----
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Data berhasil di-export!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importAllData(text)) {
        refreshData();
        notify("Data berhasil di-import!");
      } else {
        notify("Gagal import data. File tidak valid.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    resetAllData();
    window.location.reload();
  };

  // ---- Tab config ----
  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "profile", label: "Profile", icon: <MdPerson /> },
    { key: "skills", label: "Skills", icon: <GiSkills />, count: skills.length },
    { key: "experience", label: "Experience", icon: <MdWork />, count: experiences.length },
    { key: "projects", label: "Projects", icon: <MdCode />, count: projects.length },
    { key: "certificates", label: "Certificates", icon: <MdSchool />, count: certificates.length },
    { key: "contact", label: "Contact", icon: <MdContactMail /> },
  ];

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {/* Header */}
      <div className="bg-accent text-surface px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-surface/20 rounded-lg transition-colors cursor-pointer"
            >
              <MdArrowBack size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-surface/70 text-sm">Kelola konten portofolio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-2 bg-surface/20 hover:bg-surface/30 rounded-lg text-sm transition-colors cursor-pointer"
              title="Export Data"
            >
              <MdFileDownload /> <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-2 bg-surface/20 hover:bg-surface/30 rounded-lg text-sm transition-colors cursor-pointer"
              title="Import Data"
            >
              <MdFileUpload /> <span className="hidden sm:inline">Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-3 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm transition-colors cursor-pointer"
              title="Reset Data"
            >
              <MdRestartAlt /> <span className="hidden sm:inline">Reset</span>
            </button>
            <div className="w-px h-6 bg-surface/30 mx-1" />
            <button
              onClick={() => { logout(); navigate(0); }}
              className="flex items-center gap-1 px-3 py-2 bg-surface/20 hover:bg-surface/30 rounded-lg text-sm transition-colors cursor-pointer"
              title="Logout"
            >
              <MdArrowBack /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-right duration-300 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto flex gap-1 px-6 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowModal(false); setEditingId(null); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-surface-secondary border border-b-0 border-border text-accent"
                  : "text-text-secondary hover:text-accent hover:bg-surface-secondary/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ProfileForm
            profile={profile}
            onSaved={() => { refreshData(); notify("Profile berhasil disimpan!"); }}
          />
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <SkillsManager
            skills={skills}
            onRefresh={() => { refreshData(); }}
            notify={notify}
          />
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <ContactConfigForm
            config={contactConfig}
            onSaved={() => { refreshData(); notify("Contact berhasil disimpan!"); }}
          />
        )}

        {/* Other Tabs - Add Button */}
        {activeTab !== "profile" && activeTab !== "skills" && activeTab !== "contact" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent">
                {activeTab === "experience" && "Pengalaman Kerja"}
                {activeTab === "projects" && "Project Portofolio"}
                {activeTab === "certificates" && "Sertifikat"}
              </h2>
              <button
                onClick={() => { setEditingId(null); setShowModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer"
              >
                <MdAdd size={20} /> Tambah
              </button>
            </div>

        {/* List */}
        {activeTab === "experience" && (
          <ExperienceList
            items={experiences}
            onEdit={(id) => { setEditingId(id); setShowModal(true); }}
            onDelete={(id) => setShowDeleteConfirm(id)}
          />
        )}
        {activeTab === "projects" && (
          <ProjectList
            items={projects}
            onEdit={(id) => { setEditingId(id); setShowModal(true); }}
            onDelete={(id) => setShowDeleteConfirm(id)}
          />
        )}
        {activeTab === "certificates" && (
          <CertificateList
            items={certificates}
            onEdit={(id) => { setEditingId(id); setShowModal(true); }}
            onDelete={(id) => setShowDeleteConfirm(id)}
          />
        )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditingId(null); }}>
          {activeTab === "experience" && (
            <ExperienceForm
              editId={editingId}
              onSaved={() => { setShowModal(false); setEditingId(null); refreshData(); notify("Experience berhasil disimpan!"); }}
              onCancel={() => { setShowModal(false); setEditingId(null); }}
            />
          )}
          {activeTab === "projects" && (
            <ProjectForm
              editId={editingId}
              onSaved={() => { setShowModal(false); setEditingId(null); refreshData(); notify("Project berhasil disimpan!"); }}
              onCancel={() => { setShowModal(false); setEditingId(null); }}
            />
          )}
          {activeTab === "certificates" && (
            <CertificateForm
              editId={editingId}
              onSaved={() => { setShowModal(false); setEditingId(null); refreshData(); notify("Sertifikat berhasil disimpan!"); }}
              onCancel={() => { setShowModal(false); setEditingId(null); }}
            />
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(null)}>
          <div className="text-center p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-accent mb-2">Hapus Data?</h3>
            <p className="text-text-secondary mb-6">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-5 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (activeTab === "experience") deleteExperience(showDeleteConfirm);
                  if (activeTab === "projects") deleteProject(showDeleteConfirm);
                  if (activeTab === "certificates") deleteCertificate(showDeleteConfirm);
                  if (activeTab === "skills") deleteSkill(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                  refreshData();
                  notify("Data berhasil dihapus!");
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <Modal onClose={() => setShowResetConfirm(false)}>
          <div className="text-center p-6">
            <div className="text-red-500 text-5xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-accent mb-2">Reset Semua Data?</h3>
            <p className="text-text-secondary mb-6">
              Semua data akan dihapus dan dikembalikan ke data default awal.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// Modal Component
// ==========================================

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ==========================================
// Reusable Form Components
// ==========================================

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-secondary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors";

const selectClass =
  "w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors cursor-pointer";

// ==========================================
// Image URL List Manager
// ==========================================

function ImageUrlList({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const addImage = () => onChange([...images, ""]);
  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const updateImage = (idx: number, val: string) => {
    const copy = [...images];
    copy[idx] = val;
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      {images.map((img, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <div className="flex-1 flex gap-2 items-center">
            {img && (
              <img
                src={img}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <input
              type="text"
              value={img}
              onChange={(e) => updateImage(idx, e.target.value)}
              placeholder="URL gambar atau path lokal..."
              className={inputClass + " flex-1"}
            />
          </div>
          <button
            type="button"
            onClick={() => removeImage(idx)}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <MdRemoveCircle size={20} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addImage}
        className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
      >
        <MdAddCircle size={18} /> Tambah Gambar
      </button>
    </div>
  );
}

// ==========================================
// Experience List & Form
// ==========================================

function ExperienceList({
  items,
  onEdit,
  onDelete,
}: {
  items: Experience[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <MdWork size={48} className="mx-auto mb-4 opacity-30" />
        <p>Belum ada pengalaman kerja. Klik "Tambah" untuk menambahkan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-5 bg-surface-secondary border border-border rounded-xl hover:border-accent/30 transition-colors"
        >
          {item.companyLogo && (
            <img
              src={item.companyLogo}
              alt={item.company}
              className="w-12 h-12 rounded-lg object-contain bg-white p-1 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-accent truncate">{item.company}</h3>
            <p className="text-text-secondary text-sm">{item.position} • {item.period}</p>
            <p className="text-text-tertiary text-sm">{item.location}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => onEdit(item.id)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
              <MdEdit size={20} />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
              <MdDelete size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceForm({
  editId,
  onSaved,
  onCancel,
}: {
  editId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const existing = editId ? getExperiences().find((e) => e.id === editId) : null;

  const [company, setCompany] = useState(existing?.company || "");
  const [companyDescription, setCompanyDescription] = useState(existing?.companyDescription || "");
  const [position, setPosition] = useState(existing?.position || "");
  const [period, setPeriod] = useState(existing?.period || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [companyLogo, setCompanyLogo] = useState(existing?.companyLogo || "");
  const [image, setImage] = useState(existing?.image || "");
  const [badge, setBadge] = useState(existing?.badge || "⭐ Professional Experience");
  const [skills, setSkills] = useState<string[]>(existing?.skills || [""]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>(
    existing?.responsibilities || [{ icon: "code", title: "", description: "" }]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      company,
      companyDescription,
      position,
      period,
      location,
      description,
      companyLogo,
      image,
      badge,
      skills: skills.filter(Boolean),
      responsibilities: responsibilities.filter((r) => r.title),
    };
    if (editId) {
      updateExperience(editId, data);
    } else {
      addExperience(data);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-xl font-bold text-accent">
          {editId ? "Edit Experience" : "Tambah Experience"}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer">
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Perusahaan" required>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} required />
          </FormField>
          <FormField label="Deskripsi Perusahaan">
            <input type="text" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} className={inputClass} placeholder="e.g. Industrial Garments Company" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Posisi" required>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} required />
          </FormField>
          <FormField label="Periode" required>
            <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputClass} placeholder="e.g. Juli 2024 - Sekarang" required />
          </FormField>
          <FormField label="Lokasi">
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="e.g. Pasuruan, Jawa Timur" />
          </FormField>
        </div>

        <FormField label="Deskripsi" required>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-24 resize-none"} required />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Logo Perusahaan (URL)">
            <div className="flex gap-2 items-center">
              {companyLogo && <img src={companyLogo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1" onError={(e) => (e.currentTarget.style.display = "none")} />}
              <input type="text" value={companyLogo} onChange={(e) => setCompanyLogo(e.target.value)} className={inputClass} />
            </div>
          </FormField>
          <FormField label="Foto Kerja (URL)">
            <div className="flex gap-2 items-center">
              {image && <img src={image} alt="" className="w-10 h-10 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />}
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} />
            </div>
          </FormField>
        </div>

        <FormField label="Badge">
          <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className={inputClass} />
        </FormField>

        {/* Responsibilities */}
        <FormField label="Tanggung Jawab">
          <div className="space-y-3">
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="flex gap-2 items-start p-3 bg-surface-tertiary/50 rounded-xl">
                <select
                  value={resp.icon}
                  onChange={(e) => {
                    const copy = [...responsibilities];
                    copy[idx] = { ...copy[idx], icon: e.target.value };
                    setResponsibilities(copy);
                  }}
                  className={selectClass + " w-28 flex-shrink-0"}
                >
                  {RESPONSIBILITY_ICONS.map((ic) => (
                    <option key={ic.value} value={ic.value}>{ic.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={resp.title}
                  onChange={(e) => {
                    const copy = [...responsibilities];
                    copy[idx] = { ...copy[idx], title: e.target.value };
                    setResponsibilities(copy);
                  }}
                  placeholder="Judul"
                  className={inputClass + " w-40 flex-shrink-0"}
                />
                <input
                  type="text"
                  value={resp.description}
                  onChange={(e) => {
                    const copy = [...responsibilities];
                    copy[idx] = { ...copy[idx], description: e.target.value };
                    setResponsibilities(copy);
                  }}
                  placeholder="Deskripsi"
                  className={inputClass + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  <MdRemoveCircle size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setResponsibilities([...responsibilities, { icon: "code", title: "", description: "" }])}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              <MdAddCircle size={18} /> Tambah Tanggung Jawab
            </button>
          </div>
        </FormField>

        {/* Skills */}
        <FormField label="Skills">
          <div className="space-y-2">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const copy = [...skills];
                    copy[idx] = e.target.value;
                    setSkills(copy);
                  }}
                  placeholder="Nama skill"
                  className={inputClass + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <MdRemoveCircle size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSkills([...skills, ""])}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              <MdAddCircle size={18} /> Tambah Skill
            </button>
          </div>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 p-6 border-t border-border">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer">
          Batal
        </button>
        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer">
          <MdSave size={18} /> Simpan
        </button>
      </div>
    </form>
  );
}

// ==========================================
// Project List & Form
// ==========================================

function ProjectList({
  items,
  onEdit,
  onDelete,
}: {
  items: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <MdCode size={48} className="mx-auto mb-4 opacity-30" />
        <p>Belum ada project. Klik "Tambah" untuk menambahkan.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-5 bg-surface-secondary border border-border rounded-xl hover:border-accent/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            {item.images[0] && (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-accent truncate">{item.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.category === "website"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-purple-500/10 text-purple-500"
                }`}>
                  {item.category === "website" ? "💻 Website" : "🎮 Game"}
                </span>
              </div>
              <p className="text-text-secondary text-sm line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1 text-text-tertiary">
                  {item.techIcons.slice(0, 4).map((icon, i) => (
                    <span key={i} className="text-sm">{renderIcon(icon)}</span>
                  ))}
                  {item.techIcons.length > 4 && (
                    <span className="text-xs text-text-muted">+{item.techIcons.length - 4}</span>
                  )}
                </div>
                <span className="text-text-muted text-xs flex items-center gap-1">
                  <MdImage size={14} /> {item.images.length}
                </span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEdit(item.id)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                <MdEdit size={18} />
              </button>
              <button onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                <MdDelete size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectForm({
  editId,
  onSaved,
  onCancel,
}: {
  editId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const existing = editId ? getProjects().find((p) => p.id === editId) : null;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [images, setImages] = useState<string[]>(existing?.images || [""]);
  const [techIcons, setTechIcons] = useState<string[]>(existing?.techIcons || []);
  const [link, setLink] = useState(existing?.link || "");
  const [buttonText, setButtonText] = useState(existing?.buttonText || "View");
  const [category, setCategory] = useState<"website" | "game">(existing?.category || "website");
  const [aos, setAos] = useState(existing?.aos || "fade-left");

  const toggleTech = (val: string) => {
    setTechIcons((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      images: images.filter(Boolean),
      techIcons,
      link,
      buttonText,
      category,
      aos,
    };
    if (editId) {
      updateProject(editId, data);
    } else {
      addProject(data);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-xl font-bold text-accent">
          {editId ? "Edit Project" : "Tambah Project"}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer">
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <FormField label="Judul Project" required>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </FormField>

        <FormField label="Deskripsi" required>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-24 resize-none"} required />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kategori" required>
            <select value={category} onChange={(e) => setCategory(e.target.value as "website" | "game")} className={selectClass}>
              <option value="website">💻 Website</option>
              <option value="game">🎮 Game</option>
            </select>
          </FormField>
          <FormField label="Animasi AOS">
            <select value={aos} onChange={(e) => setAos(e.target.value)} className={selectClass}>
              {PROJECT_AOS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Link Project">
            <input type="text" value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} placeholder="https://..." />
          </FormField>
          <FormField label="Teks Tombol">
            <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className={inputClass} placeholder="e.g. LIVE VIEW, SOURCE CODE" />
          </FormField>
        </div>

        <FormField label="Tech Stack">
          <div className="flex flex-wrap gap-2">
            {TECH_ICONS.map((tech) => (
              <button
                key={tech.value}
                type="button"
                onClick={() => toggleTech(tech.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
                  techIcons.includes(tech.value)
                    ? "bg-accent text-surface"
                    : "bg-surface-tertiary text-text-secondary hover:bg-accent/10"
                }`}
              >
                {renderIcon(tech.value)}
                {tech.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Gambar Project">
          <ImageUrlList images={images} onChange={setImages} />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 p-6 border-t border-border">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer">
          Batal
        </button>
        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer">
          <MdSave size={18} /> Simpan
        </button>
      </div>
    </form>
  );
}

// ==========================================
// Certificate List & Form
// ==========================================

function CertificateList({
  items,
  onEdit,
  onDelete,
}: {
  items: Certificate[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <MdSchool size={48} className="mx-auto mb-4 opacity-30" />
        <p>Belum ada sertifikat. Klik "Tambah" untuk menambahkan.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-5 bg-surface-secondary border border-border rounded-xl hover:border-accent/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white text-xl flex-shrink-0`}>
              {renderIcon(item.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-accent truncate">{item.title}</h3>
              <p className="text-text-secondary text-sm line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-2 text-text-tertiary text-xs">
                <span className="flex items-center gap-1"><MdImage size={14} /> {item.count} sertifikat</span>
                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full">{item.category}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEdit(item.id)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                <MdEdit size={18} />
              </button>
              <button onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                <MdDelete size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificateForm({
  editId,
  onSaved,
  onCancel,
}: {
  editId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const existing = editId ? getCertificates().find((c) => c.id === editId) : null;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [images, setImages] = useState<string[]>(existing?.images || [""]);
  const [icon, setIcon] = useState(existing?.icon || "certificate");
  const [color, setColor] = useState(existing?.color || CERTIFICATE_COLORS[0].value);
  const [category, setCategory] = useState(existing?.category || "professional");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredImages = images.filter(Boolean);
    const data = {
      title,
      description,
      images: filteredImages,
      count: filteredImages.length,
      icon,
      color,
      category,
    };
    if (editId) {
      updateCertificate(editId, data);
    } else {
      addCertificate(data);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-xl font-bold text-accent">
          {editId ? "Edit Sertifikat" : "Tambah Sertifikat"}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer">
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <FormField label="Judul Sertifikat" required>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </FormField>

        <FormField label="Deskripsi" required>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-20 resize-none"} required />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Icon">
            <select value={icon} onChange={(e) => setIcon(e.target.value)} className={selectClass}>
              {CERTIFICATE_ICONS.map((ic) => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Warna">
            <select value={color} onChange={(e) => setColor(e.target.value)} className={selectClass}>
              {CERTIFICATE_COLORS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Kategori">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              {CERTIFICATE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Gambar Sertifikat">
          <ImageUrlList images={images} onChange={setImages} />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 p-6 border-t border-border">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer">
          Batal
        </button>
        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer">
          <MdSave size={18} /> Simpan
        </button>
      </div>
    </form>
  );
}

// ==========================================
// Profile Form (Inline - Singleton)
// ==========================================

function ProfileForm({
  profile,
  onSaved,
}: {
  profile: Profile | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile?.name || "");
  const [position, setPosition] = useState(profile?.position || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [photo, setPhoto] = useState(profile?.photo || "");
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>(profile?.socialMedia || []);
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || "");
  const [resumeLabel, setResumeLabel] = useState(profile?.resumeLabel || "Resume");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPosition(profile.position);
      setDescription(profile.description);
      setPhoto(profile.photo);
      setSocialMedia(profile.socialMedia || []);
      setResumeUrl(profile.resumeUrl);
      setResumeLabel(profile.resumeLabel);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      name,
      position,
      description,
      photo,
      socialMedia,
      resumeUrl,
      resumeLabel,
    });
    onSaved();
  };

  const addSocialMedia = () => {
    setSocialMedia([...socialMedia, { type: "email", url: "" }]);
  };

  const removeSocialMedia = (idx: number) => {
    setSocialMedia(socialMedia.filter((_, i) => i !== idx));
  };

  const updateSocialMedia = (idx: number, field: keyof SocialMedia, val: string) => {
    const copy = [...socialMedia];
    copy[idx] = { ...copy[idx], [field]: val };
    setSocialMedia(copy);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent">Edit Profile</h2>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <MdSave size={20} /> Simpan
        </button>
      </div>

      <div className="bg-surface-secondary border border-border rounded-2xl divide-y divide-border">
        {/* Photo & Name */}
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border bg-surface">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                  <MdImage size={40} />
                </div>
              )}
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="URL foto profil..."
                className={inputClass + " text-xs"}
              />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <FormField label="Nama Lengkap" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap..."
                className={inputClass}
                required
              />
            </FormField>
            <FormField label="Position / Tagline" required>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder='contoh: a Junior <b>Full Stack Developer</b>'
                className={inputClass}
                required
              />
              <p className="text-xs text-text-tertiary mt-1">Bisa menggunakan tag HTML seperti &lt;b&gt; untuk bold</p>
            </FormField>
          </div>
        </div>

        {/* Description */}
        <div className="p-6">
          <FormField label="Deskripsi / Bio" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang diri anda..."
              className={inputClass + " min-h-[120px] resize-y"}
              rows={5}
              required
            />
          </FormField>
        </div>

        {/* Social Media */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-accent">Media Sosial</h3>
            <button
              type="button"
              onClick={addSocialMedia}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              <MdAddCircle size={18} /> Tambah
            </button>
          </div>
          {socialMedia.length === 0 && (
            <p className="text-text-tertiary text-sm">Belum ada media sosial. Klik "Tambah" untuk menambahkan.</p>
          )}
          <div className="space-y-3">
            {socialMedia.map((sm, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={sm.type}
                  onChange={(e) => updateSocialMedia(idx, "type", e.target.value)}
                  className={selectClass + " w-36 flex-shrink-0"}
                >
                  {SOCIAL_MEDIA_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={sm.url}
                  onChange={(e) => updateSocialMedia(idx, "url", e.target.value)}
                  placeholder={sm.type === "email" ? "mailto:email@example.com" : "https://..."}
                  className={inputClass + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => removeSocialMedia(idx)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  <MdRemoveCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resume / CV */}
        <div className="p-6">
          <h3 className="font-semibold text-accent mb-4">Resume / CV</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="URL Resume">
              <input
                type="text"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/... atau URL lainnya"
                className={inputClass}
              />
            </FormField>
            <FormField label="Label Tombol">
              <input
                type="text"
                value={resumeLabel}
                onChange={(e) => setResumeLabel(e.target.value)}
                placeholder="Resume"
                className={inputClass}
              />
            </FormField>
          </div>
        </div>
      </div>
    </form>
  );
}

// ==========================================
// Skills Manager (List + Inline CRUD)
// ==========================================

function SkillsManager({
  skills,
  onRefresh,
  notify,
}: {
  skills: Skill[];
  onRefresh: () => void;
  notify: (msg: string, type?: "success" | "error") => void;
}) {
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSrc("");
    setAlt("");
    setEditingSkill(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setSrc(skill.src);
    setAlt(skill.alt);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) {
      updateSkill(editingSkill.id, { name, src, alt });
      notify("Skill berhasil diupdate!");
    } else {
      const maxOrder = skills.length > 0 ? Math.max(...skills.map((s) => s.order)) + 1 : 0;
      addSkill({ name, src, alt, order: maxOrder });
      notify("Skill berhasil ditambahkan!");
    }
    resetForm();
    onRefresh();
  };

  const handleDelete = (id: string) => {
    deleteSkill(id);
    setShowDeleteId(null);
    onRefresh();
    notify("Skill berhasil dihapus!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent">Skills</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <MdAdd size={20} /> Tambah Skill
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-surface-secondary border border-border rounded-xl p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-accent">{editingSkill ? "Edit Skill" : "Tambah Skill Baru"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Nama Skill" required>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="React" className={inputClass} required />
            </FormField>
            <FormField label="URL Icon" required>
              <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://cdn.jsdelivr.net/..." className={inputClass} required />
            </FormField>
            <FormField label="Alt Text" required>
              <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="react" className={inputClass} required />
            </FormField>
          </div>
          {src && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Preview:</span>
              <img src={src} alt={alt} className="w-12 h-12 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer">
              <MdSave size={18} /> Simpan
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <GiSkills size={48} className="mx-auto mb-4 opacity-30" />
          <p>Belum ada skill. Klik "Tambah Skill" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="relative group bg-surface-secondary border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:border-accent/30 transition-colors"
            >
              <img
                src={skill.src}
                alt={skill.alt}
                className="w-16 h-16 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="text-sm font-medium text-accent text-center">{skill.name}</span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(skill)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                  <MdEdit size={16} />
                </button>
                <button onClick={() => setShowDeleteId(skill.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteId && (
        <Modal onClose={() => setShowDeleteId(null)}>
          <div className="text-center p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-accent mb-2">Hapus Skill?</h3>
            <p className="text-text-secondary mb-6">Skill ini akan dihapus dari daftar.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteId(null)} className="px-5 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={() => handleDelete(showDeleteId)} className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer">
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==========================================
// Contact Config Form (Singleton)
// ==========================================

function ContactConfigForm({
  config,
  onSaved,
}: {
  config: ContactConfig | null;
  onSaved: () => void;
}) {
  const [heading, setHeading] = useState(config?.heading || "");
  const [subheading, setSubheading] = useState(config?.subheading || "");
  const [profileImage, setProfileImage] = useState(config?.profileImage || "");
  const [profileName, setProfileName] = useState(config?.profileName || "");
  const [profileTitle, setProfileTitle] = useState(config?.profileTitle || "");
  const [profileTags, setProfileTags] = useState<string[]>(config?.profileTags || []);
  const [tagInput, setTagInput] = useState("");
  const [footerNote, setFooterNote] = useState(config?.footerNote || "");
  const [contactEmail, setContactEmail] = useState(config?.contactEmail || "");
  const [links, setLinks] = useState<ContactLink[]>(config?.links || []);

  useEffect(() => {
    if (config) {
      setHeading(config.heading);
      setSubheading(config.subheading);
      setProfileImage(config.profileImage);
      setProfileName(config.profileName);
      setProfileTitle(config.profileTitle);
      setProfileTags(config.profileTags || []);
      setFooterNote(config.footerNote);
      setContactEmail(config.contactEmail);
      setLinks(config.links || []);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveContactConfig({
      heading,
      subheading,
      profileImage,
      profileName,
      profileTitle,
      profileTags,
      footerNote,
      contactEmail,
      links,
    });
    onSaved();
  };

  const addTag = () => {
    if (tagInput.trim() && !profileTags.includes(tagInput.trim())) {
      setProfileTags([...profileTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (idx: number) => {
    setProfileTags(profileTags.filter((_, i) => i !== idx));
  };

  const addLink = () => {
    setLinks([...links, { type: "website", label: "", href: "", color: "from-blue-500 to-blue-700", description: "", category: "social" }]);
  };

  const removeLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const updateLink = (idx: number, field: keyof ContactLink, val: string) => {
    const copy = [...links];
    copy[idx] = { ...copy[idx], [field]: val };
    setLinks(copy);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent">Edit Contact Page</h2>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <MdSave size={20} /> Simpan
        </button>
      </div>

      <div className="bg-surface-secondary border border-border rounded-2xl divide-y divide-border">
        {/* Header Section */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-accent">Header</h3>
          <FormField label="Heading" required>
            <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="LET'S CREATE SOMETHING AMAZING" className={inputClass} required />
          </FormField>
          <FormField label="Subheading">
            <textarea value={subheading} onChange={(e) => setSubheading(e.target.value)} placeholder="Deskripsi singkat..." className={inputClass + " min-h-[80px] resize-y"} rows={3} />
          </FormField>
        </div>

        {/* Contact Email (for form) */}
        <div className="p-6">
          <FormField label="Email untuk Contact Form" required>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" className={inputClass} required />
            <p className="text-xs text-text-tertiary mt-1">Email ini digunakan untuk tujuan mailto pada form kontak</p>
          </FormField>
        </div>

        {/* Profile Card */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-accent">Profile Card</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama">
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Title">
              <input type="text" value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} placeholder="Full Stack Developer" className={inputClass} />
            </FormField>
          </div>
          <FormField label="Foto Profil URL">
            <div className="flex gap-3 items-center">
              {profileImage && (
                <img src={profileImage} alt="" className="w-12 h-12 rounded-full object-cover border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
              <input type="text" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} placeholder="URL foto..." className={inputClass + " flex-1"} />
            </div>
          </FormField>
          <FormField label="Tags (skill badges)">
            <div className="flex flex-wrap gap-2 mb-2">
              {profileTags.map((tag, idx) => (
                <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500 cursor-pointer">
                    <MdClose size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Tambah tag..."
                className={inputClass + " flex-1"}
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer">
                <MdAdd size={18} />
              </button>
            </div>
          </FormField>
        </div>

        {/* Contact Links */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-accent">Link Kontak & Sosial Media</h3>
            <button type="button" onClick={addLink} className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer">
              <MdAddCircle size={18} /> Tambah
            </button>
          </div>
          {links.length === 0 && (
            <p className="text-text-tertiary text-sm">Belum ada link kontak.</p>
          )}
          <div className="space-y-4">
            {links.map((link, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-accent">Link #{idx + 1}</span>
                  <button type="button" onClick={() => removeLink(idx)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                    <MdRemoveCircle size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FormField label="Tipe">
                    <select value={link.type} onChange={(e) => updateLink(idx, "type", e.target.value)} className={selectClass}>
                      {SOCIAL_MEDIA_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Label">
                    <input type="text" value={link.label} onChange={(e) => updateLink(idx, "label", e.target.value)} placeholder="Instagram" className={inputClass} />
                  </FormField>
                  <FormField label="Kategori">
                    <select value={link.category} onChange={(e) => updateLink(idx, "category", e.target.value)} className={selectClass}>
                      <option value="social">Social (Follow Me)</option>
                      <option value="contact">Contact (Quick Contact)</option>
                    </select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="URL">
                    <input type="text" value={link.href} onChange={(e) => updateLink(idx, "href", e.target.value)} placeholder="https://..." className={inputClass} />
                  </FormField>
                  <FormField label="Deskripsi">
                    <input type="text" value={link.description} onChange={(e) => updateLink(idx, "description", e.target.value)} placeholder="Follow my journey..." className={inputClass} />
                  </FormField>
                </div>
                <FormField label="Warna Gradient">
                  <select value={link.color} onChange={(e) => updateLink(idx, "color", e.target.value)} className={selectClass}>
                    {CONTACT_LINK_COLORS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-6">
          <FormField label="Footer Note">
            <input type="text" value={footerNote} onChange={(e) => setFooterNote(e.target.value)} placeholder="🚀 Looking forward to..." className={inputClass} />
          </FormField>
        </div>
      </div>
    </form>
  );
}

export default AdminPage;
