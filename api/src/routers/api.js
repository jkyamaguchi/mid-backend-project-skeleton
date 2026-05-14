import express from "express";
import eventsRouter from "#routers/events.js";
import authRouter from "#routers/auth.js";
import cartsRouter from "#routers/carts.js";
import ordersRouter from "#routers/orders.js";

const apiRouter = express.Router();

apiRouter.use("/events", eventsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/cart", cartsRouter);
apiRouter.use("/orders", ordersRouter);

export default apiRouter;
