import { createApp } from "./createApp.js";
import { initializeDatabase } from "./db/init.js";

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

const serverlessApp = createApp({ beforeRoutes: initializeDatabaseMiddleware });

export default serverlessApp;
