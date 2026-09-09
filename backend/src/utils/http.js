export function getClientKey(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function readBearer(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : "";
}
