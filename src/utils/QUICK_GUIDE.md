## 📸 Image Mapping untuk Multiple Folders

### Current Setup

```
✅ Sinkrona (10 gambar)
✅ Renwa (3 gambar)
```

### Cara Menambah Folder Baru (Contoh: myNewGame)

#### Step 1: Organisir Gambar
```
assets/images/projects/
└── myNewGame/
    ├── myNewGame001.png
    ├── myNewGame002.png
    └── myNewGame003.png
```

#### Step 2: Update projectsData.tsx (3 baris)

```typescript
// 1. Tambah di projectFolders object
const projectFolders = {
  sinkrona: import.meta.glob(...),
  renwa: import.meta.glob(...),
  myNewGame: import.meta.glob<{ default: string }>(    // ← BARIS 1
    "../assets/images/projects/myNewGame/*.{png,jpg,jpeg}",
    { eager: true }
  ),
};

// 2. Generate variable
const myNewGameImages = getImagesFromFolder(projectFolders.myNewGame); // ← BARIS 2

// 3. Gunakan di card
{
  images: myNewGameImages, // ← BARIS 3
  ...
}
```

### Utility Functions

#### `getImagesFromFolder(modules)` → `string[]`
```typescript
const sinkronaImages = getImagesFromFolder(projectFolders.sinkrona);
// Result: ["sinkrona001.png", "sinkrona002.png", ..., "sinkrona010.png"]
```

### Keuntungan

| Feature | Manual Import | Automatic Mapping |
|---------|---|---|
| Tambah 10 gambar | Tulis 10 import ❌ | 1 glob ✅ |
| Sorting numeric | Manual ❌ | Otomatis ✅ |
| Add 1 gambar | Update import ❌ | Auto-detect ✅ |

### Quick Reference

```typescript
// projectFolders object
projectFolders: {
  [folderName]: import.meta.glob<{ default: string }>(
    "../assets/images/projects/[folderName]/*.{png,jpg,jpeg}",
    { eager: true }
  )
}

// Generate images
const [folderName]Images = getImagesFromFolder(projectFolders.[folderName]);

// Use in card
images: [folderName]Images
```
