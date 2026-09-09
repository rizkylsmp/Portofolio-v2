# Portofolio v2

Portfolio full-stack dengan frontend React + TypeScript + Vite dan backend Express + MySQL.

## Struktur

```text
frontend/              # Aplikasi React, aset publik, dan konfigurasi Vite
backend/
  src/                 # API Express, integrasi MySQL, seed, dan script
  uploads/             # Kompatibilitas untuk URL upload lokal lama
  output/              # Hasil generator PDF
package.json           # Perintah bersama dan konfigurasi npm workspaces
.env.local             # Konfigurasi lokal frontend/kompatibilitas
backend/.env           # Kredensial dan konfigurasi backend (tidak masuk Git)
```

`frontend` dan `backend` memiliki `package.json` sendiri. Root menggunakan npm
workspaces agar instalasi dependensi dan perintah pengembangan tetap sederhana.

## Development

```bash
npm install
npm run dev
```

`npm run dev` menjalankan Vite dan Express bersamaan. Gunakan `npm run dev:fe`
atau `npm run dev:be` untuk menjalankan salah satunya saja.

## Environment

Frontend membaca variabel `VITE_*` dari `.env.local` di root. Backend membaca
`backend/.env`; salin `backend/.env.example` saat menyiapkan lingkungan baru.
Kedua file lokal tersebut diabaikan oleh Git.

## Backend Admin Mode

The production admin panel is enabled only when the frontend is built with:

```env
VITE_ADMIN_AUTH_MODE=server
```

Atur variabel frontend di `.env.local`:

```env
VITE_ADMIN_AUTH_MODE=server
VITE_PORTFOLIO_API_URL=
```

Atur konfigurasi server di `backend/.env`:

```env
ADMIN_PASSWORD=your-strong-password
ADMIN_PIN=123456
PORT=3000
PORTFOLIO_DATA_PATH=./backend/src/seeds/portfolioData.json
UPLOAD_DIR=./backend/uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=portfolio-v2
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio_v2
DB_CONNECTION_LIMIT=10
```

`VITE_PORTFOLIO_API_URL` dapat dikosongkan saat frontend dan backend disajikan
dari origin yang sama. Panggilan API frontend menggunakan Axios melalui
`frontend/src/services/apiClient.ts`.

Backend membuat database MySQL lokal dan tabel portofolio secara otomatis ketika
dijalankan. Jika MySQL add-on Clever Cloud terhubung, backend langsung memakai
`MYSQL_ADDON_*` tanpa mencoba membuat database baru. Kredensial add-on tersebut
memiliki prioritas lebih tinggi daripada `DB_*`. Untuk database remote lain,
gunakan `DB_MANAGED=true` agar backend tidak mencoba membuat database baru.
Untuk membuat tabel secara manual, gunakan `backend/src/schema.sql`.

Jika tabel masih kosong, backend mengisi data awal dari
`backend/src/seeds/portfolioData.json`.

## Build And Run

```bash
npm run build
npm start
```

The backend serves:

- `GET /api/portfolio` for public portfolio data
- `POST /api/auth/login` for admin login
- `POST /api/auth/logout` for admin logout
- `POST /api/admin/uploads/projects` for project image uploads
- `POST /api/admin/uploads/experiences` for experience photo uploads
- `POST /api/admin/uploads/certificates` for certificate image uploads
- `PUT /api/admin/portfolio` dan `PATCH /api/admin/portfolio` untuk menyimpan perubahan admin
- legacy static uploaded files from `/uploads`
- static frontend files from `frontend/dist`

Images uploaded from the admin panel are sent to Cloudinary. MySQL stores the
returned HTTPS URL, while `UPLOAD_DIR` remains available only for legacy local
URLs. Keep `CLOUDINARY_API_SECRET` on the backend and never expose it as a
`VITE_*` variable.

Open:

```text
http://localhost:5174/admin
```

## Vercel Deployment

Create two Vercel projects from this repository:

- Frontend: leave **Root Directory** empty. The root `vercel.json` serves
  `frontend/dist` and enables SPA deep links such as `/admin`.
- Backend: set **Root Directory** to `backend`. Its `vercel.json` clears any
  static Output Directory override and Vercel detects `index.js` as the Express
  serverless entrypoint.

Do not point both Vercel projects at the repository root. After changing the
backend Root Directory, redeploy without the previous build cache so the
backend project reads `backend/vercel.json` instead of the frontend config.

Set `VITE_PORTFOLIO_API_URL` in the frontend project to the deployed backend
origin. Set MySQL, Cloudinary, admin credentials, and `CORS_ORIGIN` only in the
backend project.

## Version And Rollback

Use Git tags for release markers:

```bash
npm version minor
git push origin main --tags
```

If a release has a problem, prefer:

```bash
git revert <bad_commit>
git push origin main
```

On platforms with deployment history, you can also rollback/promote an older deployment from the hosting dashboard.
