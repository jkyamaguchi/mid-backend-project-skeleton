import express from "express";
import apiRouter from "#routers/api.js";

const rootRouter = express.Router();

rootRouter.get("/", (req, res) => {
  res.redirect("/api/events");
});

rootRouter.use("/api", apiRouter);

// 404 handler — scoped to /api so that /docs and other app routes can fall through
rootRouter.use("/api", (req, res) => {
  res.status(404).json({ error: { status: 404, message: "Route not found" } });
});

// Global error handler — must be last, Express identifies it by the 4-argument signature
// eslint-disable-next-line no-unused-vars
rootRouter.use((err, req, res, next) => {
  console.error(err);
  const status = typeof err.status === "number" ? err.status : 500;
  res.status(status).json({
    error: { status, message: err.message ?? "Internal server error" },
  });
});

export default rootRouter;
