import express from "express";
import {
  deleteCartItemHandler,
  getCart,
  postCartItem,
  putCartItem,
} from "#controllers/carts.js";
import { optionalAuth } from "#middlewares/auth.js";

const cartsRouter = express.Router();

cartsRouter.use(optionalAuth);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get active cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: Optional Bearer JWT for authenticated user carts
 *       - in: header
 *         name: x-session-id
 *         required: false
 *         schema:
 *           type: string
 *           example: guest-session-abc123
 *         description: Guest cart identifier when not authenticated
 *     responses:
 *       200:
 *         description: Active cart data
 *       400:
 *         description: Missing cart identity
 *       401:
 *         description: Invalid token format or token expired
 */
cartsRouter.get("/", getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add an event to the active cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: Optional Bearer JWT for authenticated user carts
 *       - in: header
 *         name: x-session-id
 *         required: false
 *         schema:
 *           type: string
 *           example: guest-session-abc123
 *         description: Guest cart identifier when not authenticated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: integer
 *                 example: 3
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Existing line quantity incremented
 *       201:
 *         description: New line created in cart
 *       400:
 *         description: Validation or identity error
 *       404:
 *         description: Event not found
 *       401:
 *         description: Invalid token format or token expired
 */
cartsRouter.post("/items", postCartItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     summary: Update cart line quantity
 *     description: itemId is the cart line id (cart_item.id), not an event id.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart line identifier (cart_item.id)
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: Optional Bearer JWT for authenticated user carts
 *       - in: header
 *         name: x-session-id
 *         required: false
 *         schema:
 *           type: string
 *           example: guest-session-abc123
 *         description: Guest cart identifier when not authenticated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart line updated
 *       400:
 *         description: Validation or identity error
 *       404:
 *         description: Cart line not found in active cart
 *       401:
 *         description: Invalid token format or token expired
 */
cartsRouter.put("/items/:itemId", putCartItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from active cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart line identifier (cart_item.id)
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: Optional Bearer JWT for authenticated user carts
 *       - in: header
 *         name: x-session-id
 *         required: false
 *         schema:
 *           type: string
 *           example: guest-session-abc123
 *         description: Guest cart identifier when not authenticated
 *     responses:
 *       200:
 *         description: Cart item removed
 *       400:
 *         description: Validation or identity error
 *       404:
 *         description: Cart item not found in active cart
 *       401:
 *         description: Invalid token format or token expired
 */
cartsRouter.delete("/items/:itemId", deleteCartItemHandler);

export default cartsRouter;
