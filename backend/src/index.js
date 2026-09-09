import { createApp } from "./createApp.js";
import { config } from "./config/env.js";
import { initializeDatabase } from "./db/init.js";
import { isCredentialConfigured } from "./services/authService.js";
import { isCloudinaryConfigured } from "./services/cloudinaryService.js";

function listenOnAvailablePort(app, preferredPort, maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let port = preferredPort;
    let attempts = 0;

    const listen = () => {
      const server = app.listen(port);

      server.once("listening", () => resolve({ server, port }));
      server.once("error", (error) => {
        if (error.code !== "EADDRINUSE" || attempts >= maxAttempts) {
          reject(error);
          return;
        }

        attempts += 1;
        server.close(() => {
          port += 1;
          listen();
        });
      });
    };

    listen();
  });
}

async function startServer() {
  await initializeDatabase();

  const app = createApp();
  const { port } = await listenOnAvailablePort(app, config.port);
  console.log(`[portfolio-backend] Server running at http://localhost:${port}`);
  if (port !== config.port) {
    console.warn(
      `[portfolio-backend] Port ${config.port} is busy; switched automatically to ${port}.`
    );
  }
  {
    console.log(
      `[portfolio-backend] MySQL database: ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.name}`
    );
    console.log(`[portfolio-backend] Seed file: ${config.dataPath}`);

    if (!isCredentialConfigured()) {
      console.warn("[portfolio-backend] Set ADMIN_PASSWORD and ADMIN_PIN=6 digits before using /admin.");
    }
    if (!isCloudinaryConfigured()) {
      console.warn(
        "[portfolio-backend] Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET before uploading images."
      );
    }
  }
}

startServer().catch((err) => {
  console.error("[portfolio-backend] Failed to start server:", err);
  process.exit(1);
});
