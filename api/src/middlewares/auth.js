import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-me";

/**
 * Require a valid Bearer token and attach payload to req.auth.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        status: 401,
        message: "Missing or invalid Authorization header",
      },
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({
      error: { status: 401, message: "Invalid or expired token" },
    });
  }
}

/**
 * If a Bearer token is present, validate it and attach payload to req.auth.
 * If no token is present, continue as guest.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        status: 401,
        message: "Missing or invalid Authorization header",
      },
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({
      error: { status: 401, message: "Invalid or expired token" },
    });
  }
}
