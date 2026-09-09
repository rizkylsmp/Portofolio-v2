import { createApp } from "./src/app.js";
import { initializeDatabase } from "./src/db/init.js";

let databaseInitialization;

function ensureDatabaseInitialized() {
  if (!databaseInitialization) {
    databaseInitialization = initializeDatabase().catch((error) => {
      databaseInitialization = undefined;
      throw error;
    });
  }

  return databaseInitialization;
}

async function initializeDatabaseMiddleware(_req, _res, next) {
  try {
    await ensureDatabaseInitialized();
    next();
  } catch (error) {
    next(error);
  }
}

const app = createApp({ beforeRoutes: initializeDatabaseMiddleware });

export default app;
