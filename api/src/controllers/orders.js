import db from "#configs/database.js";
import { listOrdersByUser, findOrderById, createOrderFromCart } from "#models/orders.js";
import { findOrCreateActiveCart, findActiveCartByUser } from "#models/carts.js";

export async function getOrders(req, res, next) {
  try {
    const userId = Number(req.auth?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: { status: 401, message: "Authentication required" },
      });
    }

    const orders = await listOrdersByUser(userId);

    return res.status(200).json({ data: orders });
  } catch (error) {
    return next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const userId = Number(req.auth?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: { status: 401, message: "Authentication required" },
      });
    }

    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        error: { status: 400, message: "orderId must be a positive integer" },
      });
    }

    const result = await findOrderById(orderId);

    if (!result) {
      return res.status(404).json({
        error: { status: 404, message: "Order not found" },
      });
    }

    if (result.order.user_id !== userId) {
      return res.status(403).json({
        error: { status: 403, message: "Forbidden" },
      });
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/checkout
 * Converts the user's active cart to an order, then creates a fresh cart.
 */
export async function postCheckout(req, res, next) {
  try {
    const userId = Number(req.auth?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: { status: 401, message: "Authentication required" },
      });
    }

    const result = await db.transaction(async (transaction) => {
      // 1. Find the user's active cart
      const cart = await findActiveCartByUser(userId, { transaction });

      if (!cart) {
        throw new Error("No active cart found");
      }

      // 2. Convert cart to order (handles order creation, order items, and cart deactivation)
      const { order, items } = await createOrderFromCart(
        { userId, cartId: cart.id },
        { transaction },
      );

      // 3. Create a new active cart for future shopping
      const newCart = await findOrCreateActiveCart(
        { userId },
        { transaction },
      );

      return { order, items, newCart };
    });

    return res.status(201).json({
      data: {
        order: result.order,
        items: result.items,
        newCart: result.newCart,
      },
    });
  } catch (error) {
    // Handle specific error case: empty cart
    if (error.message === "Cannot create order from an empty cart") {
      return res.status(400).json({
        error: {
          status: 400,
          message: "Cannot checkout with an empty cart",
        },
      });
    }

    if (error.message === "No active cart found") {
      return res.status(404).json({
        error: { status: 404, message: "No active cart found" },
      });
    }

    return next(error);
  }
}
