import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import z from "zod";
import { createUser, findUserByEmail, findUserById } from "#models/auth.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-me";
const JWT_EXPIRES_IN = "7d";

const signupSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z
    .string()
    .trim()
    .min(1, "email is required")
    .email("email must be a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "email is required")
    .email("email must be a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "password is required"),
});

function sendValidationError(res, error) {
  return res.status(400).json({
    error: {
      status: 400,
      message: error.issues[0]?.message ?? "Invalid request payload",
    },
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

/**
 * POST /api/auth/signup
 */
export async function signup(req, res, next) {
  try {
    const bodyResult = signupSchema.safeParse(req.body ?? {});
    if (!bodyResult.success) {
      return sendValidationError(res, bodyResult.error);
    }

    const { name, email, password } = bodyResult.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: { status: 409, message: "Email is already registered" },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash });
    const token = issueToken(user);

    return res.status(201).json({
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const bodyResult = loginSchema.safeParse(req.body ?? {});
    if (!bodyResult.success) {
      return sendValidationError(res, bodyResult.error);
    }

    const { email, password } = bodyResult.data;

    const user = await findUserByEmail(email);

    if (!user?.password_hash) {
      return res.status(401).json({
        error: { status: 401, message: "Invalid email or password" },
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: { status: 401, message: "Invalid email or password" },
      });
    }

    const token = issueToken(user);

    return res.json({
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res, next) {
  try {
    const userId = Number(req.auth?.sub);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(401).json({
        error: { status: 401, message: "Invalid token payload" },
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: { status: 404, message: "User not found" },
      });
    }

    return res.json({ data: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}
