# Backend Structure

```text
backend/
  package.json          # Dependensi dan perintah khusus backend
  eslint.config.js      # Pemeriksaan kode JavaScript backend
  uploads/              # Penyimpanan upload lokal
  output/               # Hasil generator PDF
  src/
    index.js              # Entry point: init database, start Express
    app.js                # Express app composition
    schema.sql            # Optional manual MySQL schema
    config/
      env.js              # Environment loading and normalized config
    db/
      pool.js             # MySQL pool creation/access
      init.js             # Database/table bootstrap and seed
    middleware/
      auth.js             # Bearer token guard
      cors.js             # CORS/OPTIONS handling
      errorHandler.js     # API 404 and global error handler
    routes/
      authRoutes.js       # Login/logout endpoints
      portfolioRoutes.js  # Portfolio read/write endpoints
    services/
      authService.js      # Session, lockout, credential checks
      portfolioService.js # Portfolio MySQL read/write
    seeds/
      portfolioData.json  # Initial seed for an empty MySQL database
    scripts/
      checkPortfolio.js   # Count rows in portfolio tables
      seedPortfolio.js    # Upsert src/seeds/portfolioData.json into MySQL
    utils/
      http.js             # Request helpers
      mysql.js            # MySQL identifier helpers
```

The server stores portfolio content in separate MySQL tables:

- `profile`
- `profile_social_media`
- `skills`
- `experiences`
- `experience_responsibilities`
- `experience_skills`
- `projects`
- `project_images`
- `project_tech_icons`
- `certificates`
- `certificate_images`
- `contact`
- `contact_links`

The active schema avoids generic `data` JSON columns. Each field is stored in explicit columns, while repeating values such as images, tech icons, responsibilities, and links live in child tables.

Useful commands:

```bash
npm run db:seed
npm run db:check
```

Images and documents should be stored outside MySQL, then referenced by URL in the portfolio JSON. Use `frontend/public/images` only for assets shipped with the app build. For uploaded/admin-managed files in production, use object storage such as S3-compatible storage, Cloudinary, Supabase Storage, or a persistent VPS upload directory.
