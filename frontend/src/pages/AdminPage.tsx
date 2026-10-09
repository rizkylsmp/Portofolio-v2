// ==========================================
// Admin Panel - Portfolio Content Management
// ==========================================

import { useEffect, useState, useRef, useId, cloneElement, isValidElement } from "react";
import { AdminForm } from "../components/AdminForm";
import { confirmAdminLeave } from "../utils/adminLeave";
import { validatePortfolio } from "../validation/portfolio.js";
import { useNavigate, useBlocker } from "react-router-dom";
import { AdminBackups } from "../components/AdminBackups";
import { logout } from "../services/authService";
import type { Experience, Project, Certificate, Profile, SocialMedia, Skill, ContactConfig, ContactLink } from "../types/content";
import {
  TECH_ICONS,
  PROJECT_AOS_OPTIONS,
  SOCIAL_MEDIA_TYPES,
} from "../types/content";
import {
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  reorderProjects,
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
} from "../services/storageService";
import { uploadImages } from "../services/uploadService";
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
  MdImage,
  MdRemoveCircle,
  MdAddCircle,
  MdContactMail,
  MdDragIndicator,
  MdContentPaste,
  MdHistory,
} from "react-icons/md";
import { GiSkills } from "react-icons/gi";
import {
  PiDesktopBold,
  PiGameControllerBold,
  PiWarningCircleBold,
} from "react-icons/pi";

type Tab = "profile" | "skills" | "experience" | "projects" | "certificates" | "contact";

function getAdminErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Gagal menyimpan data ke database.";
}

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Data states
  const [profile, setProfile] = useState<Profile | null>(() => getProfile());
  const [skills, setSkills] = useState<Skill[]>(() => getSkills());
  const [experiences, setExperiences] = useState<Experience[]>(() => getExperiences());
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [certificates, setCertificates] = useState<Certificate[]>(() => getCertificates());
  const [contactConfig, setContactConfig] = useState<ContactConfig | null>(() => getContactConfig());

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{ text: string; counts: Record<string, number> } | null>(null);
  const [showBackups, setShowBackups] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const blocker = useBlocker(() => !!document.querySelector('form[data-admin-dirty="true"], form[data-admin-busy="true"]'));
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirmAdminLeave()) blocker.proceed(); else blocker.reset();
  }, [blocker]);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (notificationTimer.current) clearTimeout(notificationTimer.current); }, []);

  // Load data
  const refreshData = () => {
    setProfile(getProfile());
    setSkills(getSkills());
    setExperiences(getExperiences());
    setProjects(getProjects());
    setCertificates(getCertificates());
    setContactConfig(getContactConfig());
  };

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    notificationTimer.current = setTimeout(() => setNotification(null), type === "error" ? 12000 : 3000);
  };

  const openFormModal = (id: string | null) => {
    setEditingId(id);
    setShowModal(true);
  };

  const closeFormModal = (force = false): boolean => {
    if (!force && !confirmAdminLeave()) {
      return false;
    }

    setShowModal(false);
    setEditingId(null);
    return true;
  };


  // ---- Export / Import ----
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
    if (file.size > 2 * 1024 * 1024) { notify("Ukuran JSON maksimal 2 MB.", "error"); e.target.value = ""; return; }
    reader.onerror = () => notify("File tidak dapat dibaca.", "error");
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const data = validatePortfolio(JSON.parse(text)) as Record<string, unknown>;
        setPendingImport({ text, counts: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0])) });
      } catch (err) {
        notify(getAdminErrorMessage(err), "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
      <div className="bg-accent text-surface px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <button
              aria-label="Kembali ke portofolio"
              onClick={() => navigate("/")}
              className="p-2 hover:bg-surface/20 rounded-lg transition-colors cursor-pointer"
            >
              <MdArrowBack size={24} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-surface/70 text-sm">Kelola konten portofolio</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-2 bg-surface/20 hover:bg-surface/30 rounded-lg text-sm transition-colors cursor-pointer"
              title="Export Data"
            >
              <MdFileDownload /> <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => { if (confirmAdminLeave()) fileInputRef.current?.click(); }}
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
            <button title="Backup" aria-label="Backup" onClick={() => { if (confirmAdminLeave()) setShowBackups(true); }} className="p-2 rounded-lg hover:bg-surface/30"><MdHistory size={22} /></button>
            <div className="w-px h-6 bg-surface/30 mx-1" />
            <button
              onClick={() => { if (confirmAdminLeave()) { logout(); navigate(0); } }}
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
          role={notification.type === "error" ? "alert" : "status"}
          className={`fixed top-4 right-4 z-[100] max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto break-words px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-right duration-300 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto min-w-0 px-4 sm:px-6 pt-4">
          <div className="overflow-x-auto overflow-y-hidden [scrollbar-width:thin]" role="tablist">
            <div className="flex w-max min-w-full flex-nowrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  id={`admin-tab-${tab.key}`}
                  aria-label={tab.label}
                  aria-controls={`admin-panel-${tab.key}`}
                  tabIndex={activeTab === tab.key ? 0 : -1}
                  aria-selected={activeTab === tab.key}
                  onKeyDown={(event) => {
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    if (!confirmAdminLeave()) return;
                    const index = tabs.findIndex((item) => item.key === tab.key);
                    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                    setActiveTab(tabs[next].key);
                    document.getElementById(`admin-tab-${tabs[next].key}`)?.focus();
                  }}
                  onClick={() => {
                    if (activeTab === tab.key || !confirmAdminLeave()) return;
                    if (showModal) closeFormModal(true);
                    setActiveTab(tab.key);
                  }}
                  className={`flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-t-xl border border-b-0 px-3 py-3 font-medium transition-colors cursor-pointer sm:px-5 ${
                    activeTab === tab.key
                      ? "bg-surface-secondary border-border text-accent"
                      : "border-transparent text-text-secondary hover:text-accent hover:bg-surface-secondary/50"
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
        </div>
      </div>

      {/* Content */}
      <div role="tabpanel" id={`admin-panel-${activeTab}`} aria-labelledby={`admin-tab-${activeTab}`} className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ProfileForm
            key={profile ? JSON.stringify(profile) : "empty-profile"}
            profile={profile}
            onSaved={() => { refreshData(); notify("Profile berhasil disimpan!"); }}
            onError={(err) => notify(getAdminErrorMessage(err), "error")}
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
            key={contactConfig ? JSON.stringify(contactConfig) : "empty-contact"}
            config={contactConfig}
            onSaved={() => { refreshData(); notify("Contact berhasil disimpan!"); }}
            onError={(err) => notify(getAdminErrorMessage(err), "error")}
          />
        )}

        {/* Other Tabs - Add Button */}
        {activeTab !== "profile" && activeTab !== "skills" && activeTab !== "contact" && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
              <h2 className="text-2xl font-bold text-accent">
                {activeTab === "experience" && "Pengalaman Kerja"}
                {activeTab === "projects" && "Project Portofolio"}
                {activeTab === "certificates" && "Sertifikat"}
              </h2>
              <button
                onClick={() => openFormModal(null)}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer"
              >
                <MdAdd size={20} /> Tambah
              </button>
            </div>

        {/* List */}
        {activeTab === "experience" && (
          <ExperienceList
            items={experiences}
            onEdit={(id) => openFormModal(id)}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onReorder={async (nextItems) => {
              setExperiences(nextItems);
              try {
                await reorderExperiences(nextItems);
                refreshData();
              } catch (err) {
                notify(getAdminErrorMessage(err), "error");
                refreshData();
              }
            }}
          />
        )}
        {activeTab === "projects" && (
          <ProjectList
            items={projects}
            onEdit={(id) => openFormModal(id)}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onReorder={async (nextItems) => {
              setProjects(nextItems);
              try {
                await reorderProjects(nextItems);
                refreshData();
              } catch (err) {
                notify(getAdminErrorMessage(err), "error");
                refreshData();
              }
            }}
          />
        )}
        {activeTab === "certificates" && (
          <CertificateList
            items={certificates}
            onEdit={(id) => openFormModal(id)}
            onDelete={(id) => setShowDeleteConfirm(id)}
          />
        )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <Modal
          onClose={() => { closeFormModal(); }}
          closeOnBackdrop={false}
          maxWidthClass={activeTab === "experience" ? "max-w-5xl" : "max-w-3xl"}
        >
          {activeTab === "experience" && (
            <ExperienceForm
              editId={editingId}
              onSaved={() => { closeFormModal(true); refreshData(); notify("Experience berhasil disimpan!"); }}
              onError={(err) => notify(getAdminErrorMessage(err), "error")}
              onCancel={() => { closeFormModal(); }}
            />
          )}
          {activeTab === "projects" && (
            <ProjectForm
              editId={editingId}
              onSaved={() => { closeFormModal(true); refreshData(); notify("Project berhasil disimpan!"); }}
              onError={(err) => notify(getAdminErrorMessage(err), "error")}
              onCancel={() => { closeFormModal(); }}
            />
          )}
          {activeTab === "certificates" && (
            <CertificateForm
              editId={editingId}
              onSaved={() => { closeFormModal(true); refreshData(); notify("Sertifikat berhasil disimpan!"); }}
              onError={(err) => notify(getAdminErrorMessage(err), "error")}
              onCancel={() => { closeFormModal(); }}
            />
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Modal onClose={() => { if (confirmAdminLeave()) setShowDeleteConfirm(null); }}>
          <AdminForm onSubmit={async () => {
            try {
              if (activeTab === "experience") await deleteExperience(showDeleteConfirm);
              if (activeTab === "projects") await deleteProject(showDeleteConfirm);
              if (activeTab === "certificates") await deleteCertificate(showDeleteConfirm);
              setShowDeleteConfirm(null); refreshData(); notify("Data berhasil dihapus!"); return true;
            } catch (error) { notify(getAdminErrorMessage(error), "error"); return false; }
          }}>
          <div className="text-center p-4 sm:p-6">
            <PiWarningCircleBold className="mx-auto mb-4 text-5xl text-red-500" />
            <h3 className="text-xl font-bold text-accent mb-2">Hapus Data?</h3>
            <p className="text-text-secondary mb-6">Data ini akan dihapus. Salinan sebelumnya disimpan dalam backup.</p>
            <div className="flex flex-col-reverse gap-3 justify-center sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full px-5 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer sm:w-auto"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer sm:w-auto"
              >
                Hapus
              </button>
            </div>
          </div>
          </AdminForm>
        </Modal>
      )}
      {pendingImport && <Modal onClose={() => { if (confirmAdminLeave()) setPendingImport(null); }}>
        <AdminForm onSubmit={async () => {
          try {
            if (!await importAllData(pendingImport.text)) throw new Error("File tidak valid.");
            refreshData(); setPendingImport(null); notify("Data berhasil di-import!"); return true;
          } catch (error) { notify(getAdminErrorMessage(error), "error"); return false; }
        }}>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Ganti Data Portofolio?</h2>
            <p>Seluruh bagian akan diganti dengan isi file berikut.</p>
            <dl>{Object.entries(pendingImport.counts).map(([key, count]) => <div key={key} className="flex justify-between"><dt>{key}</dt><dd>{count}</dd></div>)}</dl>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setPendingImport(null)}>Batal</button>
              <button type="submit" className="px-4 py-2 bg-accent text-surface rounded-lg">Import dan Ganti Data</button>
            </div>
          </div>
        </AdminForm>
      </Modal>}
      {showBackups && <Modal onClose={() => { if (confirmAdminLeave()) setShowBackups(false); }}>
        <AdminBackups onSaved={() => { refreshData(); setShowBackups(false); notify("Backup berhasil dipulihkan!"); }} />
      </Modal>}
    </div>
  );
};

// ==========================================
// Modal Component
// ==========================================

function Modal({
  children,
  onClose,
  closeOnBackdrop = true,
  maxWidthClass = "max-w-3xl",
}: {
  children: React.ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  maxWidthClass?: string;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const heading = dialog.current?.querySelector("h2, h3");
    if (heading) heading.id = titleId;
    const overlay = dialog.current?.parentElement;
    const background = Array.from(overlay?.parentElement?.children || []).filter((element) => element !== overlay && !["alert", "status"].includes(element.getAttribute("role") || ""));
    const previousInert = background.map((element) => element.hasAttribute("inert"));
    background.forEach((element) => element.setAttribute("inert", ""));
    const focusable = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []).filter((item) => item.getClientRects().length);
    (focusable()[0] || dialog.current)?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); dialog.current?.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); background.forEach((element, index) => { if (!previousInert[index]) element.removeAttribute("inert"); }); document.body.style.overflow = overflow; previous?.focus(); };
  }, [titleId]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`my-3 min-w-0 w-full ${maxWidthClass} max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-200 sm:my-4 sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl`}
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
  const id = useId();
  const direct = isValidElement<{ id?: string }>(children) && typeof children.type === "string" && ["input", "textarea", "select"].includes(children.type);
  return (
    <div className="space-y-1.5">
      <label htmlFor={direct ? id : undefined} className="block text-sm font-medium text-text-secondary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {direct ? cloneElement(children, { id }) : children}
    </div>
  );
}

const inputClass =
  "w-full min-w-0 px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors";

const selectClass =
  "w-full min-w-0 px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors cursor-pointer";

// ==========================================
// Image URL List Manager
// ==========================================

function ImageUrlList({
  images,
  onChange,
  allowUpload = false,
  uploadTarget = "projects",
  maxImages,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  allowUpload?: boolean;
  uploadTarget?: "projects" | "experiences" | "certificates";
  maxImages?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadingRef = useRef(false);
  const imagesRef = useRef(images);
  useEffect(() => { imagesRef.current = images; }, [images]);
  const canAddImage = !maxImages || images.length < maxImages;
  const addImage = () => {
    if (!canAddImage) return;
    onChange([...images, ""]);
  };
  const removeImage = (idx: number) => {
    if (maxImages === 1) {
      onChange([""]);
      return;
    }

    onChange(images.filter((_, i) => i !== idx));
  };
  const updateImage = (idx: number, val: string) => {
    const copy = [...images];
    copy[idx] = val;
    onChange(copy);
  };
  const handleFiles = async (files: File[]) => {
    if (uploadingRef.current || fileInputRef.current?.closest("fieldset")?.disabled) return;
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setUploadError("File yang dipilih harus berupa gambar.");
      return;
    }

    const selectedFiles = maxImages === 1 ? imageFiles.slice(0, 1) : imageFiles;
    if (selectedFiles.length > 10) {
      setUploadError("Maksimal 10 gambar dalam satu upload.");
      return;
    }
    if (selectedFiles.some((file) => file.size > 8 * 1024 * 1024)) {
      setUploadError("Ukuran gambar maksimal 8 MB per file.");
      return;
    }
    if (maxImages && maxImages > 1 && imagesRef.current.filter(Boolean).length + selectedFiles.length > maxImages) {
      setUploadError(`Maksimal ${maxImages} gambar.`);
      return;
    }

    uploadingRef.current = true;
    const form = fileInputRef.current?.closest("form");
    form?.dispatchEvent(new CustomEvent("admin-upload", { detail: 1 }));
    setIsUploading(true);
    setUploadError(null);
    try {
      const urls = await uploadImages(uploadTarget, selectedFiles);
      if (maxImages === 1) {
        onChange(urls[0] ? [urls[0]] : imagesRef.current);
        return;
      }

      const nextImages = [...imagesRef.current.filter(Boolean), ...urls];
      onChange(maxImages ? nextImages.slice(0, maxImages) : nextImages);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal upload gambar.");
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
      form?.dispatchEvent(new CustomEvent("admin-upload", { detail: -1 }));
    }
  };
  const pasteFromClipboard = async () => {
    if (uploadingRef.current || fileInputRef.current?.closest("fieldset")?.disabled) return;
    try {
      if (!navigator.clipboard?.read) throw new Error("Gunakan Ctrl+V pada area upload untuk paste gambar.");
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        files.push(new File([blob], `clipboard-${Date.now()}-${files.length}.${type.split("/")[1]}`, { type }));
      }
      if (!files.length) throw new Error("Clipboard tidak berisi gambar. Copy gambar atau screenshot lalu paste kembali.");
      await handleFiles(files);
    } catch (err) {
      setUploadError(err instanceof Error && err.name !== "NotAllowedError" ? err.message : "Akses clipboard tidak diizinkan. Gunakan Ctrl+V pada area upload.");
    }
  };
  const extractPastedImages = (event: React.ClipboardEvent<HTMLDivElement>): File[] => {
    const files = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) return files;

    return Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];
  };

  return (
    <div
      className="space-y-3"
      onPaste={(event) => {
        if (!allowUpload) return;
        const files = extractPastedImages(event);
        if (files.length === 0) return;
        event.preventDefault();
        void handleFiles(files);
      }}
    >
      {allowUpload && (
        <div
          tabIndex={0}
          title="Paste, drag & drop, atau pilih gambar"
          aria-label="Upload gambar"
          onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.focus(); }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleFiles(Array.from(event.dataTransfer.files));
          }}
          aria-busy={isUploading}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-6 text-center outline-none focus-visible:border-accent transition-colors ${
            isDragging
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface-secondary text-text-secondary hover:border-accent/60 hover:bg-accent/5"
          }`}
        >
          <MdFileUpload size={28} className="text-accent" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-accent">
              {isUploading ? "Mengupload gambar..." : "Upload gambar"}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm disabled:opacity-50">
              <MdImage size={18} /> Pilih gambar
            </button>
            <button type="button" disabled={isUploading} onClick={() => { void pasteFromClipboard(); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm disabled:opacity-50">
              <MdContentPaste size={18} /> Paste
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={maxImages !== 1}
            disabled={isUploading}
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              event.target.value = "";
              void handleFiles(files);
            }}
          />
        </div>
      )}
      {uploadError && (
        <p role="alert" className="text-sm text-red-500">{uploadError}</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {images.map((img, idx) => (
        <div key={idx} className="relative flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface-secondary p-2">
          <div className="flex min-w-0 flex-col gap-2">
            {img && (
              <img
                src={img}
                alt={`Preview gambar ${idx + 1}`}
                className="aspect-[4/3] w-full rounded object-contain border border-border bg-surface"
              />
            )}
            <input
              type="text"
              value={img}
              disabled={isUploading}
              onChange={(e) => updateImage(idx, e.target.value)}
              placeholder="URL gambar atau path lokal..."
              aria-label={`URL gambar ${idx + 1}`}
              className={inputClass + " text-xs"}
            />
          </div>
          <button
            type="button"
            onClick={() => removeImage(idx)}
            disabled={isUploading}
            aria-label={`Hapus gambar ${idx + 1}`}
            title="Hapus gambar"
            className="self-end sm:self-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <MdRemoveCircle size={20} />
          </button>
        </div>
      ))}
      </div>
      {canAddImage && (
        <button
          type="button"
          onClick={addImage}
          disabled={isUploading}
          className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
        >
          <MdAddCircle size={18} /> Tambah Gambar
        </button>
      )}
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
  onReorder,
}: {
  items: Experience[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: Experience[]) => void | Promise<void>;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const moveItem = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = items.findIndex((item) => item.id === draggedId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    void onReorder(nextItems);
  };

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
          draggable
          onDragStart={(event) => {
            setDraggedId(item.id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.id);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            moveItem(item.id);
            setDraggedId(null);
          }}
          onDragEnd={() => setDraggedId(null)}
          className={`flex flex-col gap-4 p-5 bg-surface-secondary border rounded-xl transition-colors sm:flex-row sm:items-center ${
            draggedId === item.id
              ? "border-accent/60 opacity-60"
              : "border-border hover:border-accent/30"
          }`}
        >
          <div className="flex items-center gap-3 text-text-tertiary sm:self-stretch">
            <MdDragIndicator
              className="cursor-grab active:cursor-grabbing"
              size={24}
              aria-label="Drag untuk mengatur urutan"
            />
          </div>
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
          <div className="flex gap-2 flex-shrink-0 self-end sm:self-auto">
            <button aria-label={`Edit ${item.company}`} title="Edit" onClick={() => onEdit(item.id)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
              <MdEdit size={20} />
            </button>
            <button aria-label={`Hapus ${item.company}`} title="Hapus" onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
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
  onError,
  onCancel,
}: {
  editId: string | null;
  onSaved: () => void;
  onError: (err: unknown) => void;
  onCancel: () => void;
}) {
  const existing = editId ? getExperiences().find((e) => e.id === editId) : null;

  const [company, setCompany] = useState(existing?.company || "");
  const [companyDescription, setCompanyDescription] = useState(existing?.companyDescription || "");
  const [position, setPosition] = useState(existing?.position || "");
  const [period, setPeriod] = useState(existing?.period || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [responsibilities, setResponsibilities] = useState<string[]>(() => {
    const existingItems = (existing?.responsibilities || [])
      .map((item) => [item.title, item.description].filter(Boolean).join(": "))
      .filter(Boolean);

    if (existingItems.length > 0) return existingItems;
    if (existing?.description) return [existing.description];
    return [""];
  });
  const [companyLogo, setCompanyLogo] = useState(existing?.companyLogo || "");
  const [images, setImages] = useState<string[]>(() => {
    const existingImages = Array.isArray(existing?.images) ? existing.images.filter(Boolean) : [];
    if (existingImages.length > 0) return existingImages;
    if (existing?.image) return [existing.image];
    return [""];
  });
  const [skills, setSkills] = useState<string[]>(existing?.skills || [""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedResponsibilities = responsibilities
      .map((item) => item.trim())
      .filter(Boolean);
    const data = {
      company,
      companyDescription,
      position,
      period,
      location,
      description: cleanedResponsibilities.join("\n\n"),
      companyLogo,
      image: images.find(Boolean) || "",
      images: images.filter(Boolean),
      skills: skills.filter(Boolean),
      responsibilities: cleanedResponsibilities.map((item) => ({
        icon: "code",
        title: "",
        description: item,
      })),
    };
    try {
      if (editId) {
        await updateExperience(editId, data);
      } else {
        await addExperience(data);
      }
      onSaved();
      return true;
    } catch (err) {
      onError(err);
      return false;
    }
  };

  return (
    <AdminForm draft={{ company, companyDescription, position, period, location, responsibilities, companyLogo, images, skills }} onSubmit={handleSubmit}>
      <div className="flex items-center justify-between p-4 border-b border-border sm:p-6">
        <h2 className="text-xl font-bold text-accent">
          {editId ? "Edit Experience" : "Tambah Experience"}
        </h2>
        <button type="button" aria-label="Tutup form" data-modal-action="close" onClick={onCancel} className="p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer">
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4 sm:p-6">
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

        <FormField label="Tanggung Jawab" required>
          <div className="space-y-3">
            {responsibilities.map((responsibility, idx) => (
              <div key={idx} className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 flex-shrink-0 rounded-full bg-accent"
                />
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => {
                    const nextResponsibilities = [...responsibilities];
                    nextResponsibilities[idx] = e.target.value;
                    setResponsibilities(nextResponsibilities);
                  }}
                  className={inputClass + " flex-1"}
                  placeholder={`Tanggung jawab ${idx + 1}`}
                  required={idx === 0}
                />
                {responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setResponsibilities((current) =>
                        current.filter((_, itemIndex) => itemIndex !== idx)
                      )
                    }
                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10 cursor-pointer"
                    aria-label={`Hapus tanggung jawab ${idx + 1}`}
                    title="Hapus"
                  >
                    <MdRemoveCircle size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setResponsibilities((current) => [...current, ""])}
              className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover cursor-pointer"
            >
              <MdAddCircle size={18} /> Tambah Tanggung Jawab
            </button>
          </div>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Logo Perusahaan">
            <ImageUrlList
              images={companyLogo ? [companyLogo] : [""]}
              onChange={(nextImages) => setCompanyLogo(nextImages.find(Boolean) || "")}
              allowUpload
              uploadTarget="experiences"
              maxImages={1}
            />
          </FormField>
          <FormField label="Foto Kerja">
            <ImageUrlList
              images={images.length > 0 ? images : [""]}
              onChange={setImages}
              allowUpload
              uploadTarget="experiences"
            />
          </FormField>
        </div>

        {/* Skills */}
        <FormField label="Skills">
          <div className="space-y-2">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex min-w-0 gap-2 items-center">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const copy = [...skills];
                    copy[idx] = e.target.value;
                    setSkills(copy);
                  }}
                  placeholder="Nama skill"
                  aria-label={`Skill pengalaman ${idx + 1}`}
                  className={inputClass + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  aria-label={`Hapus skill pengalaman ${idx + 1}`}
                  title="Hapus skill"
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

      <div className="flex flex-col-reverse gap-3 p-4 border-t border-border sm:flex-row sm:justify-end sm:p-6">
        <button type="button" data-modal-action="close" onClick={onCancel} className="w-full px-5 py-2.5 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer sm:w-auto">
          Batal
        </button>
        <button type="submit" className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto">
          <MdSave size={18} /> Simpan
        </button>
      </div>
    </AdminForm>
  );
}

// ==========================================
// Project List & Form
// ==========================================

function ProjectList({
  items,
  onEdit,
  onDelete,
  onReorder,
}: {
  items: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: Project[]) => void | Promise<void>;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const moveItem = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedItem = items.find((item) => item.id === draggedId);
    const targetItem = items.find((item) => item.id === targetId);
    if (!draggedItem || !targetItem || draggedItem.category !== targetItem.category) return;

    const categoryItems = items.filter((item) => item.category === draggedItem.category);
    const fromIndex = categoryItems.findIndex((item) => item.id === draggedId);
    const toIndex = categoryItems.findIndex((item) => item.id === targetId);
    const [movedItem] = categoryItems.splice(fromIndex, 1);
    categoryItems.splice(toIndex, 0, movedItem);

    let categoryIndex = 0;
    const nextItems = items.map((item) =>
      item.category === draggedItem.category ? categoryItems[categoryIndex++] : item
    );
    void onReorder(nextItems);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <MdCode size={48} className="mx-auto mb-4 opacity-30" />
        <p>Belum ada project. Klik "Tambah" untuk menambahkan.</p>
      </div>
    );
  }

  const sections = [
    { category: "website" as const, label: "Website", icon: <PiDesktopBold /> },
    { category: "game" as const, label: "Game", icon: <PiGameControllerBold /> },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const sectionItems = items.filter((item) => item.category === section.category);

        return (
          <section key={section.category} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xl text-accent">{section.icon}</span>
              <h3 className="font-bold text-accent">{section.label}</h3>
              <span className="text-sm text-text-tertiary">({sectionItems.length})</span>
            </div>

            {sectionItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-tertiary">
                Belum ada project {section.label.toLowerCase()}.
              </p>
            ) : (
              <div className="space-y-3">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(event) => {
                      setDraggedId(item.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      moveItem(item.id);
                      setDraggedId(null);
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    className={`flex flex-col gap-4 rounded-xl border bg-surface-secondary p-4 transition-colors sm:flex-row sm:items-center ${
                      draggedId === item.id
                        ? "border-accent/60 opacity-60"
                        : "border-border hover:border-accent/30"
                    }`}
                  >
                    <MdDragIndicator
                      className="shrink-0 cursor-grab text-text-tertiary active:cursor-grabbing"
                      size={24}
                      aria-label="Drag untuk mengatur urutan"
                    />
            {item.images[0] && (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="mb-1 truncate font-bold text-accent">{item.title}</h4>
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
            <div className="flex gap-1 flex-shrink-0 self-end sm:self-auto">
              <button aria-label={`Edit ${item.title}`} title="Edit" onClick={() => onEdit(item.id)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                <MdEdit size={18} />
              </button>
              <button aria-label={`Hapus ${item.title}`} title="Hapus" onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                <MdDelete size={18} />
              </button>
            </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ProjectForm({
  editId,
  onSaved,
  onError,
  onCancel,
}: {
  editId: string | null;
  onSaved: () => void;
  onError: (err: unknown) => void;
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      if (editId) {
        await updateProject(editId, data);
      } else {
        await addProject(data);
      }
      onSaved();
      return true;
    } catch (err) {
      onError(err);
      return false;
    }
  };

  return (
    <AdminForm draft={{ title, description, images, techIcons, link, buttonText, category, aos }} onSubmit={handleSubmit}>
      <div className="flex items-center justify-between p-4 border-b border-border sm:p-6">
        <h2 className="text-xl font-bold text-accent">
          {editId ? "Edit Project" : "Tambah Project"}
        </h2>
        <button type="button" aria-label="Tutup form" data-modal-action="close" onClick={onCancel} className="p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer">
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4 sm:p-6">
        <FormField label="Judul Project" required>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </FormField>

        <FormField label="Deskripsi" required>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-24 resize-none"} required />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kategori" required>
            <select value={category} onChange={(e) => setCategory(e.target.value as "website" | "game")} className={selectClass}>
              <option value="website">Website</option>
              <option value="game">Game</option>
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
                aria-pressed={techIcons.includes(tech.value)}
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
          <ImageUrlList images={images} onChange={setImages} allowUpload />
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-3 p-4 border-t border-border sm:flex-row sm:justify-end sm:p-6">
        <button type="button" data-modal-action="close" onClick={onCancel} className="w-full px-5 py-2.5 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer sm:w-auto">
          Batal
        </button>
        <button type="submit" className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto">
          <MdSave size={18} /> Simpan
        </button>
      </div>
    </AdminForm>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-accent truncate">{item.title}</h3>
              <p className="text-text-secondary text-sm line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-2 text-text-tertiary text-xs">
                <span className="flex items-center gap-1"><MdImage size={14} /> {item.count} sertifikat</span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0 self-end sm:self-auto">
              <button aria-label={`Edit ${item.title}`} title="Edit" onClick={() => onEdit(item.id)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                <MdEdit size={18} />
              </button>
              <button aria-label={`Hapus ${item.title}`} title="Hapus" onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
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
  onError,
  onCancel,
}: {
  editId: string | null;
  onSaved: () => void;
  onError: (err: unknown) => void;
  onCancel: () => void;
}) {
  const existing = editId ? getCertificates().find((c) => c.id === editId) : null;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [images, setImages] = useState<string[]>(existing?.images || [""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredImages = images.filter(Boolean);
    const data = {
      title,
      description,
      images: filteredImages,
      count: filteredImages.length,
    };
    try {
      if (editId) {
        await updateCertificate(editId, data);
      } else {
        await addCertificate(data);
      }
      onSaved();
      return true;
    } catch (err) {
      onError(err);
      return false;
    }
  };

  return (
    <AdminForm draft={{ title, description, images }} onSubmit={handleSubmit}>
      <div className="flex items-center justify-between p-4 border-b border-border sm:p-6">
        <h2 className="text-xl font-bold text-accent">
          {editId ? "Edit Sertifikat" : "Tambah Sertifikat"}
        </h2>
        <button type="button" aria-label="Tutup form" data-modal-action="close" onClick={onCancel} className="p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer">
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4 sm:p-6">
        <FormField label="Judul Sertifikat" required>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </FormField>

        <FormField label="Deskripsi" required>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-20 resize-none"} required />
        </FormField>

        <FormField label="Gambar Sertifikat">
          <ImageUrlList
            images={images}
            onChange={setImages}
            allowUpload
            uploadTarget="certificates"
          />
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-3 p-4 border-t border-border sm:flex-row sm:justify-end sm:p-6">
        <button type="button" data-modal-action="close" onClick={onCancel} className="w-full px-5 py-2.5 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer sm:w-auto">
          Batal
        </button>
        <button type="submit" className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto">
          <MdSave size={18} /> Simpan
        </button>
      </div>
    </AdminForm>
  );
}

// ==========================================
// Profile Form (Inline - Singleton)
// ==========================================

function ProfileForm({
  profile,
  onSaved,
  onError,
}: {
  profile: Profile | null;
  onSaved: () => void;
  onError: (err: unknown) => void;
}) {
  const [name, setName] = useState(profile?.name || "");
  const [position, setPosition] = useState(profile?.position || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [photo, setPhoto] = useState(profile?.photo || "");
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>(profile?.socialMedia || []);
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || "");
  const [resumeLabel, setResumeLabel] = useState(profile?.resumeLabel || "Resume");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile({
        name,
        position,
        description,
        photo,
        socialMedia,
        resumeUrl,
        resumeLabel,
      });
      onSaved();
      return true;
    } catch (err) {
      onError(err);
      return false;
    }
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
    <AdminForm draft={{ name, position, description, photo, socialMedia, resumeUrl, resumeLabel }} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-accent">Edit Profile</h2>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto"
        >
          <MdSave size={20} /> Simpan
        </button>
      </div>

      <div className="bg-surface-secondary border border-border rounded-2xl divide-y divide-border">
        {/* Photo & Name */}
        <div className="p-4 flex flex-col gap-6 sm:flex-row sm:p-6">
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
                aria-label="URL foto profil"
                className={inputClass + " text-xs"}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-4">
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
        <div className="p-4 sm:p-6">
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
        <div className="p-4 space-y-4 sm:p-6">
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
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-secondary/50 rounded-xl border border-border/50"
              >
                <div className="flex min-w-0 gap-2 items-center">
                  <span className="text-text-tertiary text-xs font-medium w-5 text-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <select
                    value={sm.type}
                    aria-label={`Jenis media sosial ${idx + 1}`}
                    onChange={(e) => updateSocialMedia(idx, "type", e.target.value)}
                    className={selectClass + " w-full sm:w-36 flex-shrink-0"}
                  >
                    {SOCIAL_MEDIA_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex min-w-0 flex-1 gap-2 items-center pl-7 sm:pl-0">
                  <input
                    type="text"
                    value={sm.url}
                    aria-label={`URL media sosial ${idx + 1}`}
                    onChange={(e) => updateSocialMedia(idx, "url", e.target.value)}
                    placeholder={sm.type === "email" ? "mailto:email@example.com" : "https://..."}
                    className={inputClass + " flex-1 min-w-0"}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialMedia(idx)}
                    aria-label={`Hapus media sosial ${idx + 1}`}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    title="Hapus"
                  >
                    <MdRemoveCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume / CV */}
        <div className="p-4 sm:p-6">
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
    </AdminForm>
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
    if (!confirmAdminLeave()) return;
    resetForm();
    setShowForm(true);
  };

  const openEdit = (skill: Skill) => {
    if (!confirmAdminLeave()) return;
    setEditingSkill(skill);
    setName(skill.name);
    setSrc(skill.src);
    setAlt(skill.alt);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, { name, src, alt });
        notify("Skill berhasil diupdate di database!");
      } else {
        const maxOrder = skills.length > 0 ? Math.max(...skills.map((s) => s.order)) + 1 : 0;
        await addSkill({ name, src, alt, order: maxOrder });
        notify("Skill berhasil ditambahkan ke database!");
      }
      resetForm();
      onRefresh();
      return true;
    } catch (err) {
      notify(getAdminErrorMessage(err), "error");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
      setShowDeleteId(null);
      onRefresh();
      notify("Skill berhasil dihapus dari database!");
    } catch (err) {
      notify(getAdminErrorMessage(err), "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-accent">Skills</h2>
        <button
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto"
        >
          <MdAdd size={20} /> Tambah Skill
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <AdminForm key={editingSkill?.id || "new"} draft={{ name, src, alt }} onSubmit={handleSave} contentClassName="space-y-4" className="bg-surface-secondary border border-border rounded-xl p-4 mb-6 sm:p-5">
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
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="submit" className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-accent text-surface rounded-xl hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto">
              <MdSave size={18} /> Simpan
            </button>
            <button type="button" onClick={() => { if (confirmAdminLeave()) resetForm(); }} className="w-full px-4 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer sm:w-auto">
              Batal
            </button>
          </div>
        </AdminForm>
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
              <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <button aria-label={`Edit skill ${skill.name}`} title="Edit" onClick={() => openEdit(skill)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                  <MdEdit size={16} />
                </button>
                <button aria-label={`Hapus skill ${skill.name}`} title="Hapus" onClick={() => setShowDeleteId(skill.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteId && (
        <Modal onClose={() => { if (confirmAdminLeave()) setShowDeleteId(null); }}>
          <AdminForm onSubmit={async () => handleDelete(showDeleteId)}>
          <div className="text-center p-4 sm:p-6">
            <PiWarningCircleBold className="mx-auto mb-4 text-5xl text-red-500" />
            <h3 className="text-xl font-bold text-accent mb-2">Hapus Skill?</h3>
            <p className="text-text-secondary mb-6">Skill ini akan dihapus dari daftar.</p>
            <div className="flex flex-col-reverse gap-3 justify-center sm:flex-row">
              <button type="button" onClick={() => setShowDeleteId(null)} className="w-full px-5 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer sm:w-auto">
                Batal
              </button>
              <button type="submit" className="w-full px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer sm:w-auto">
                Hapus
              </button>
            </div>
          </div>
          </AdminForm>
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
  onError,
}: {
  config: ContactConfig | null;
  onSaved: () => void;
  onError: (err: unknown) => void;
}) {
  const [heading, setHeading] = useState(config?.heading || "");
  const [subheading, setSubheading] = useState(config?.subheading || "");
  const [links, setLinks] = useState<ContactLink[]>(config?.links || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveContactConfig({
        heading,
        subheading,
        links,
      });
      onSaved();
      return true;
    } catch (err) {
      onError(err);
      return false;
    }
  };

  const addLink = () => {
    setLinks([...links, { type: "website", label: "", href: "" }]);
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
    <AdminForm draft={{ heading, subheading, links }} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-accent">Edit Contact Page</h2>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer sm:w-auto"
        >
          <MdSave size={20} /> Simpan
        </button>
      </div>

      <div className="bg-surface-secondary border border-border rounded-2xl divide-y divide-border">
        {/* Header Section */}
        <div className="p-4 space-y-4 sm:p-6">
          <h3 className="font-semibold text-accent">Header</h3>
          <FormField label="Heading" required>
            <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Get In Touch" className={inputClass} required />
          </FormField>
          <FormField label="Subheading">
            <textarea value={subheading} onChange={(e) => setSubheading(e.target.value)} placeholder="Deskripsi singkat..." className={inputClass + " min-h-[80px] resize-y"} rows={3} />
          </FormField>
        </div>

        {/* Contact Links */}
        <div className="p-4 space-y-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="flex min-w-0 justify-between items-center gap-3">
                  <span className="text-sm font-medium text-accent">Link #{idx + 1}</span>
                  <button type="button" aria-label={`Hapus link kontak ${idx + 1}`} title="Hapus" onClick={() => removeLink(idx)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                    <MdRemoveCircle size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  <FormField label="URL">
                    <input type="text" value={link.href} onChange={(e) => updateLink(idx, "href", e.target.value)} placeholder="https://..." className={inputClass} />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminForm>
  );
}

export default AdminPage;
