# Image Mapper Utility - Multiple Folders Setup

Sistem otomatis untuk mapping gambar dari **multiple folder** di dalam `assets/projects`.

## 📁 Struktur Folder

```
src/assets/images/projects/
├── sinkrona/
│   ├── sinkrona001.png
│   ├── sinkrona002.png
│   └── ...
├── renwa/
│   ├── renwa001.png
│   ├── renwa002.png
│   └── ...
├── [folder-baru]/
│   ├── image1.png
│   └── ...
└── [direct files]
    ├── Game_*.png
    └── Website_*.png
```

## 🚀 Cara Setup Mapping Otomatis

### 1. **Tambah Folder Baru di projectsData.tsx**

```typescript
// AUTO MAPPING - Multiple Folders
const projectFolders = {
  sinkrona: import.meta.glob<{ default: string }>(
    "../assets/images/projects/sinkrona/*.{png,jpg,jpeg}",
    { eager: true }
  ),
  renwa: import.meta.glob<{ default: string }>(
    "../assets/images/projects/renwa/*.{png,jpg,jpeg}",
    { eager: true }
  ),
  // ✅ TAMBAH FOLDER BARU DI SINI
  newProject: import.meta.glob<{ default: string }>(
    "../assets/images/projects/newProject/*.{png,jpg,jpeg}",
    { eager: true }
  ),
};

// Generate images array dari setiap folder
const sinkronaImages = getImagesFromFolder(projectFolders.sinkrona);
const renwaImages = getImagesFromFolder(projectFolders.renwa);
// ✅ TAMBAH VARIABLE BARU DI SINI
const newProjectImages = getImagesFromFolder(projectFolders.newProject);
```

### 2. **Gunakan di Project Card**

```typescript
const createGameCards = (): ProjectCard[] => [
  // ... existing cards ...
  {
    images: newProjectImages, // ✅ Gunakan langsung
    alt: "New Project",
    judul: "New Project Title",
    ket: "Deskripsi project",
    icon: [...],
    link: "#",
    aos: "fade-left",
  },
];
```

## 📚 Utility Functions

### `getImagesFromFolder(modules)`
Mengambil semua gambar dari satu folder dan otomatis **sort numeric**.

```typescript
const images = getImagesFromFolder(projectFolders.sinkrona);
// Result: ["image1.png", "image2.png", ..., "image10.png"]
```

### `getImagesFromFolders(folderModules)`
Mapping multiple folder sekaligus dalam satu object.

```typescript
const allImages = getImagesFromFolders({
  sinkrona: import.meta.glob(...),
  renwa: import.meta.glob(...),
  myProject: import.meta.glob(...),
});
// Result: {
//   sinkrona: [...],
//   renwa: [...],
//   myProject: [...]
// }
```

## ✨ Fitur

✅ **Auto-mapping** - Tidak perlu import manual  
✅ **Multiple folders** - Unlimited folder yang bisa di-mapping  
✅ **Auto-sort numeric** - image1, image2, ..., image10 (bukan image1, image10, image2)  
✅ **Flexible formats** - Support PNG, JPG, JPEG, WebP, GIF  
✅ **Type-safe** - Full TypeScript support  
✅ **Eager loading** - Semua gambar loaded saat build time  

## 💡 Best Practices

### ✅ DO

```typescript
// 1. Konsisten naming convention
// ✅ BAIK
sinkrona001.png
sinkrona002.png
sinkrona010.png

// 2. Tentukan folder yang jelas
const projectFolders = {
  sinkrona: import.meta.glob(...),
  renwa: import.meta.glob(...),
};

// 3. Gunakan untuk banyak gambar
// ✅ Cocok untuk folder dengan 5+ gambar
const sinkronaImages = getImagesFromFolder(projectFolders.sinkrona);
```

### ❌ DON'T

```typescript
// 1. Inconsistent naming
// ❌ JANGAN
sinkrona_1.png
sinkrona-2.png
sinkrona_three.png

// 2. Jangan duplikat definisi
// ❌ JANGAN
const sinkronaModules = import.meta.glob(...);
const sinkronaModules = import.meta.glob(...); // Duplikat!

// 3. Gunakan manual import untuk folder besar
// ❌ JANGAN (untuk banyak gambar)
import img1 from "...";
import img2 from "...";
import img3 from "...";
// ... dst banyak sekali
```

## 🔧 Contoh: Menambah Folder Game Baru

**Struktur:**
```
assets/images/projects/
└── myGame/
    ├── myGame001.png
    ├── myGame002.png
    └── myGame003.png
```

**Code:**
```typescript
// 1. Tambah di projectFolders
const projectFolders = {
  sinkrona: import.meta.glob(...),
  renwa: import.meta.glob(...),
  myGame: import.meta.glob<{ default: string }>(
    "../assets/images/projects/myGame/*.{png,jpg,jpeg}",
    { eager: true }
  ),
};

// 2. Generate images variable
const myGameImages = getImagesFromFolder(projectFolders.myGame);

// 3. Gunakan di cards
const createGameCards = (): ProjectCard[] => [
  {
    images: myGameImages,
    alt: "My Game",
    judul: "My Game Title",
    ket: "Game description",
    icon: [<FaUnity />, <SiSharp />],
    link: "#",
    aos: "fade-right",
  },
];
```

## 🎯 Quick Checklist untuk Folder Baru

- [ ] Buat folder di `assets/images/projects/`
- [ ] Pindahkan semua gambar dengan naming yang konsisten (image001, image002, dll)
- [ ] Tambah glob pattern di `projectFolders` di projectsData.tsx
- [ ] Generate variable dengan `getImagesFromFolder()`
- [ ] Gunakan variable di project card
- [ ] Test di browser

## 📝 Notes

- Sorting adalah **numeric sort** (image10 > image2)
- Gambar otomatis di-**sort saat mapping**
- Support **extension**: png, jpg, jpeg, webp, gif
- **Eager loading**: semua gambar loaded saat build, jadi performa bagus

