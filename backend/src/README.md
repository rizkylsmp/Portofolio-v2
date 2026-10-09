# Backend Structure

```text
backend/
  package.json          # Dependensi dan perintah khusus backend
  eslint.config.js      # Pemeriksaan kode JavaScript backend
  uploads/              # Kompatibilitas upload lokal lama
  output/               # Hasil generator PDF
  src/
    index.js              # Entry point: init database, start Express
    app.js                # Vercel Express default export
    createApp.js          # Shared Express app composition
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
      cloudinaryService.js # Upload gambar ke Cloudinary
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

Images uploaded from the admin panel are stored in Cloudinary, then referenced
by HTTPS URL in MySQL. Social media, resume, project, contact, and other external
links are also stored in their corresponding MySQL tables. Use
`frontend/public/images` only for assets shipped with the frontend build.

For Vercel, configure this folder (`backend`) as the project's Root Directory.
The root-level `index.js` exports the Express serverless handler and this
folder's `vercel.json` clears any static Output Directory override. The local
development server continues to use `src/index.js`.
The seed JSON is statically imported so it is included in the Vercel bundle;
`vercel.json` also allowlists it explicitly for the Express function.

## Admin safety

- Sessions are hashed and stored in `admin_sessions`. Login attempts and expiry
  are stored in `admin_login_attempts`, shared across serverless instances.
- GET `/api/portfolio` includes `_versions` for each section. PATCH and PUT must
  send these versions. A stale section returns HTTP 409 without changing data.
  Different sections can be edited independently. All writes acquire the
  `portfolio_write_lock` row inside a transaction before reading and modifying data.
- Before each write, a full snapshot is stored in `portfolio_backups` within the
  same transaction. Only the latest 30 snapshots are retained. No admin save
  depends on writing into `/var/task` or `/tmp`.
- The admin Backup button lists snapshots, downloads JSON, and offers a
  confirmation before restoring all sections. Restore also creates a new backup
  and requires current versions. The API additionally exposes authenticated
  GET `/api/admin/backups`, GET `/api/admin/backups/:id`, and POST
  `/api/admin/backups/:id/restore` with `{ confirmed: true, _versions: ... }`.
- JSON imports are schema-validated on both sides, previewed before replacement,
  and need `_replaceConfirmed: true` to explicitly clear multiple sections.
  FE and BE ship their own identical `src/validation/portfolio.js` so Vercel root
  directories can deploy independently. The schema parity test prevents drift;
  update both copies when changing the content contract.
- Bootstrap creates the new tables without dropping existing content. Existing
  in-memory sessions cannot migrate; sign in again after deploying FE and BE.
  MySQL must permit CREATE/SELECT/INSERT/UPDATE/DELETE on these tables.
- These snapshots protect against accidental edits, not loss of the database
  itself. Keep independent scheduled database backups with your hosting provider.
- Run `npm test --workspace backend` from the repository root (Node 22+ with
  experimental module mocks). Tests use an in-memory SQL adapter, not the real DB.

## Managed MySQL connections

Managed databases always use one connection per BE instance, whether configured
through `DB_*` or `MYSQL_ADDON_*`. mysql2 queues work for that connection and the
BE closes it immediately when no borrowers remain; it does not depend on a
serverless idle timer. Schema bootstrap borrows one connection for its complete
query batch. Pool initialization reuses a singleton instead of closing an active
pool during retries. Static paths such as `/robots.txt` do not initialize MySQL.

Connection acquisition retries capacity errors up to four times with bounded
backoff and jitter. SQL statements and transactions are not replayed by this
retry. Persistent capacity exhaustion returns HTTP 503 with `Retry-After: 2`.
The database user's five-connection quota is shared across all BE instances,
deployments and other clients; a one-connection pool is not a global semaphore.
For more than five simultaneous instances, a database connection proxy or a
higher provider limit may still be necessary. Existing idle connections from an
older deployment must close before their slots become available. Do not reset
or reseed content to resolve a connection-capacity issue.
