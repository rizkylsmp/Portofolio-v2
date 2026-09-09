import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import "../config/env.js";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const portfolioUrl = process.env.PORTFOLIO_PDF_URL || "http://localhost:5174/#/portfolio-pdf";
const outputPath = path.resolve(
  projectRoot,
  process.env.PORTFOLIO_PDF_OUTPUT || "output/pdf/rizky-lanang-portfolio.pdf"
);
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForJson(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Tidak dapat terhubung ke Chrome DevTools di ${url}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let requestId = 0;

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) return;

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    async send(method, params = {}) {
      await opened;
      requestId += 1;
      const id = requestId;
      const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
      socket.send(JSON.stringify({ id, method, params }));
      return result;
    },
    close() {
      socket.close();
    },
  };
}

async function waitForPortfolioPage(debuggingPort) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const targets = await waitForJson(`http://127.0.0.1:${debuggingPort}/json/list`, 1).catch(
      () => []
    );
    const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    if (page) return page;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Tab Chrome untuk membuat PDF tidak ditemukan.");
}

async function generatePdf() {
  const debuggingPort = await getAvailablePort();
  const profileDirectory = await mkdtemp(path.join(os.tmpdir(), "portfolio-pdf-"));
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${profileDirectory}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let cdp;
  try {
    const page = await waitForPortfolioPage(debuggingPort);
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.navigate", { url: portfolioUrl });

    const readiness = await cdp.send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: `
        (async () => {
          const waitUntil = async (predicate, timeout = 30000) => {
            const startedAt = Date.now();
            while (!predicate()) {
              if (Date.now() - startedAt > timeout) throw new Error("Timeout menunggu halaman PDF siap.");
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          };

          await waitUntil(() => document.readyState === "complete");
          await waitUntil(() => document.querySelector("[data-pdf-ready='true']"));
          await document.fonts.ready;

          const images = Array.from(document.images);
          await Promise.all(images.map((image) => image.decode().catch(() => undefined)));

          const scrollHeight = document.documentElement.scrollHeight;
          const step = Math.max(400, Math.floor(window.innerHeight * 0.75));
          for (let y = 0; y < scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
          window.scrollTo(0, scrollHeight);
          await new Promise((resolve) => setTimeout(resolve, 500));
          window.scrollTo(0, 0);
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

          const brokenImages = images
            .filter((image) => !image.complete || image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src);

          return { imageCount: images.length, brokenImages, scrollHeight };
        })()
      `,
    });

    if (readiness.exceptionDetails) {
      throw new Error(readiness.exceptionDetails.exception?.description || "Halaman PDF gagal disiapkan.");
    }
    if (readiness.result.value.brokenImages.length > 0) {
      throw new Error(`Gambar gagal dimuat: ${readiness.result.value.brokenImages.join(", ")}`);
    }

    await cdp.send("Emulation.setEmulatedMedia", { media: "print" });
    const pdf = await cdp.send("Page.printToPDF", {
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      scale: 0.92,
    });

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, Buffer.from(pdf.data, "base64"));
    console.log(
      `[portfolio-pdf] Berhasil membuat ${outputPath} dengan ${readiness.result.value.imageCount} gambar.`
    );
  } finally {
    cdp?.close();
    if (chrome.exitCode === null) {
      chrome.kill();
      await Promise.race([
        once(chrome, "exit"),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
    await rm(profileDirectory, {
      recursive: true,
      force: true,
      maxRetries: 6,
      retryDelay: 250,
    });
  }
}

generatePdf().catch((error) => {
  console.error(`[portfolio-pdf] Gagal membuat PDF: ${error.message}`);
  process.exitCode = 1;
});
