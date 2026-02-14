import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "../docs");
const port = Number(process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function safeResolve(urlPathname) {
  const normalized = path.normalize(urlPathname).replace(/^(\.\.[/\\])+/, "");
  const candidate = path.resolve(root, "." + normalized);
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

function send(res, status, headers = {}, body = "") {
  res.writeHead(status, headers);
  if (res.req.method === "HEAD") {
    res.end();
  } else {
    res.end(body);
  }
}

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache"
  });

  if (res.req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "500 Internal Server Error"));
  stream.pipe(res);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method || "")) {
    return send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "405 Method Not Allowed");
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  let pathname = decodeURIComponent(url.pathname || "/");

  if (pathname === "/") pathname = "/index.html";

  const requested = safeResolve(pathname);
  if (!requested) {
    const notFound = path.join(root, "404.html");
    if (fileExists(notFound)) return sendFile(res, notFound, 404);
    return send(res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "403 Forbidden");
  }

  if (fileExists(requested)) {
    return sendFile(res, requested, 200);
  }

  const dirIndex = path.join(requested, "index.html");
  if (fileExists(dirIndex)) {
    return sendFile(res, dirIndex, 200);
  }

  const notFound = path.join(root, "404.html");
  if (fileExists(notFound)) {
    return sendFile(res, notFound, 404);
  }

  return send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "404 Not Found");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Preview server: http://127.0.0.1:${port}`);
});
