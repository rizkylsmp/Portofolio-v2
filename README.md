# Portofolio v2

Portfolio full-stack dengan frontend React + TypeScript + Vite dan backend Express + MySQL.

## Struktur

```text
frontend/              # Aplikasi React, aset publik, dan konfigurasi Vite
backend/
  src/                 # API Express, integrasi MySQL, seed, dan script
  uploads/             # Gambar yang diunggah melalui panel admin
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

Backend membuat database MySQL dan tabel portofolio secara otomatis ketika
dijalankan. Untuk membuatnya secara manual, gunakan `backend/src/schema.sql`.

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
- static uploaded files from `/uploads`
- static frontend files from `frontend/dist`

Images uploaded from the admin panel are stored locally in `UPLOAD_DIR`
(`./backend/uploads` secara default). Ini sesuai untuk pengembangan lokal atau VPS dengan
persistent disk. For stateless deployments, use persistent object storage such
as Cloudinary, S3, or another image hosting service before relying on uploads
in production.

Open:

```text
http://localhost:5174/admin
```

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
