// ==========================================
// Vite Plugin - Dev-only API to persist portfolio data
// ==========================================
// This plugin adds a POST /api/save-portfolio endpoint
// that writes data to src/data/portfolioData.json
// Only active in development mode
// ==========================================

import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export function portfolioDevApi(): Plugin {
  return {
    name: "portfolio-dev-api",
    apply: "serve", // Only active in dev mode

    configureServer(server) {
      server.middlewares.use("/api/save-portfolio", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            // Validate JSON
            const data = JSON.parse(body);

            // Write to portfolioData.json using Vite's resolved root
            const filePath = path.resolve(
              server.config.root,
              "src/data/portfolioData.json"
            );
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: "Data saved to portfolioData.json" }));

            console.log(
              "\x1b[32m%s\x1b[0m",
              "[portfolio-dev-api] ✅ portfolioData.json updated successfully"
            );
          } catch (err) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                error: "Invalid JSON data",
                details: String(err),
              })
            );
            console.error(
              "\x1b[31m%s\x1b[0m",
              "[portfolio-dev-api] ❌ Failed to save data:",
              err
            );
          }
        });
      });

      console.log(
        "\x1b[36m%s\x1b[0m",
        "[portfolio-dev-api] 📝 Dev API active: POST /api/save-portfolio"
      );
    },
  };
}
