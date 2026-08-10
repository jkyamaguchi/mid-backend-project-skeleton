import express from "express";
import { getOrders, getOrderById, postCheckout } from "#controllers/orders.js";
import { requireAuth } from "#middlewares/auth.js";

const ordersRouter = express.Router();

ordersRouter.use(requireAuth);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Missing or invalid token
 */
ordersRouter.get("/", getOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order with its items
 *       400:
 *         description: Invalid orderId
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Order belongs to a different user
 *       404:
 *         description: Order not found
 */
ordersRouter.get("/:orderId", getOrderById);

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Checkout the active cart and convert to order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order successfully created from cart
 *       400:
 *         description: Empty cart or invalid request
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: No active cart found
 */
ordersRouter.post("/checkout", postCheckout);

export default ordersRouter;
