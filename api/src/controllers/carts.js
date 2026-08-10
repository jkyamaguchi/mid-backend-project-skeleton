import db from "#configs/database.js";
import z from "zod";
import { findEventById } from "#models/events.js";
import { findOrCreateActiveCart } from "#models/carts.js";
import {
  addCartItem,
  deleteCartItem,
  findCartItemByCartAndEvent,
  findCartItemById,
  getCartSubtotal,
  listCartItems,
  updateCartItemQuantity,
} from "#models/cart_items.js";

const cartItemCreateSchema = z.object({
  eventId: z.coerce
    .number()
    .int("eventId must be an integer")
    .positive("eventId must be a positive integer"),
  quantity: z.coerce
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be a positive integer")
    .default(1),
});

const cartItemUpdateSchema = z.object({
  quantity: z.coerce
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be a positive integer"),
});

const cartItemPathSchema = z.object({
  itemId: z.coerce
    .number()
    .int("itemId must be an integer")
    .positive("itemId must be a positive integer"),
});

function sendValidationError(res, error) {
  return res.status(400).json({
    error: {
      status: 400,
      message: error.issues[0]?.message ?? "Invalid request payload",
    },
  });
}

function getCartIdentity(req) {
  const userId = Number(req.auth?.sub);
  const hasUser = Number.isInteger(userId) && userId > 0;

  const sessionId = String(req.headers["x-session-id"] ?? "").trim();
  const hasSession = sessionId.length > 0;

  if (hasUser) {
    return { userId, sessionId: null };
  }

  if (hasSession) {
    return { userId: null, sessionId };
  }

  return null;
}

async function buildCartResponse(cart, { transaction = db } = {}) {
  const items = await listCartItems(cart.id, { transaction });
  const subtotal = await getCartSubtotal(cart.id, { transaction });

  return {
    cart,
    items,
    summary: subtotal ?? {
      subtotal: 0,
      currency: null,
      line_count: 0,
      total_quantity: 0,
    },
  };
}

/**
 * GET /api/cart
 */
export async function getCart(req, res, next) {
  try {
    const identity = getCartIdentity(req);

    if (!identity) {
      return res.status(400).json({
        error: {
          status: 400,
          message:
            "Cart identity required: provide a Bearer token or x-session-id header",
        },
      });
    }

    const cart = await findOrCreateActiveCart(identity);

    const data = await buildCartResponse(cart);

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/cart/items
 */
export async function postCartItem(req, res, next) {
  try {
    const identity = getCartIdentity(req);

    if (!identity) {
      return res.status(400).json({
        error: {
          status: 400,
          message:
            "Cart identity required: provide a Bearer token or x-session-id header",
        },
      });
    }

    const bodyResult = cartItemCreateSchema.safeParse(req.body ?? {});
    if (!bodyResult.success) {
      return sendValidationError(res, bodyResult.error);
    }

    const { eventId, quantity } = bodyResult.data;

    const event = await findEventById(eventId);
    if (!event) {
      return res.status(404).json({
        error: { status: 404, message: "Event not found" },
      });
    }

    const result = await db.transaction(async (transaction) => {
      const cart = await findOrCreateActiveCart(identity, { transaction });
      const existingLine = await findCartItemByCartAndEvent(cart.id, eventId, {
        transaction,
      });

      let statusCode = 201;
      let line;

      if (existingLine) {
        line = await updateCartItemQuantity(
          existingLine.id,
          existingLine.quantity + quantity,
          {
            transaction,
          },
        );
        statusCode = 200;
      } else {
        line = await addCartItem(
          {
            cartId: cart.id,
            eventId,
            quantity,
            priceAtAddition: event.price,
            currency: event.currency,
          },
          { transaction },
        );
      }

      const data = await buildCartResponse(cart, { transaction });

      return {
        statusCode,
        line,
        data,
      };
    });

    return res.status(result.statusCode).json({
      data: {
        ...result.data,
        line: result.line,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/cart/items/{itemId}
 * itemId is the cart line id (cart_item.id).
 */
export async function putCartItem(req, res, next) {
  try {
    const identity = getCartIdentity(req);

    if (!identity) {
      return res.status(400).json({
        error: {
          status: 400,
          message:
            "Cart identity required: provide a Bearer token or x-session-id header",
        },
      });
    }

    const paramsResult = cartItemPathSchema.safeParse(req.params ?? {});
    if (!paramsResult.success) {
      return sendValidationError(res, paramsResult.error);
    }

    const bodyResult = cartItemUpdateSchema.safeParse(req.body ?? {});
    if (!bodyResult.success) {
      return sendValidationError(res, bodyResult.error);
    }

    const { itemId } = paramsResult.data;
    const { quantity } = bodyResult.data;

    const result = await db.transaction(async (transaction) => {
      const cart = await findOrCreateActiveCart(identity, { transaction });

      const line = await findCartItemById(itemId, { transaction });

      if (!line || line.cart_id !== cart.id) {
        return null;
      }

      const updatedLine = await updateCartItemQuantity(itemId, quantity, {
        transaction,
      });
      const data = await buildCartResponse(cart, { transaction });

      return {
        updatedLine,
        data,
      };
    });

    if (!result) {
      return res.status(404).json({
        error: { status: 404, message: "Cart item not found" },
      });
    }

    return res.json({
      data: {
        ...result.data,
        line: result.updatedLine,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/cart/items/{itemId}
 * itemId is the cart line id (cart_item.id).
 */
export async function deleteCartItemHandler(req, res, next) {
  try {
    const identity = getCartIdentity(req);

    if (!identity) {
      return res.status(400).json({
        error: {
          status: 400,
          message:
            "Cart identity required: provide a Bearer token or x-session-id header",
        },
      });
    }

    const paramsResult = cartItemPathSchema.safeParse(req.params ?? {});
    if (!paramsResult.success) {
      return sendValidationError(res, paramsResult.error);
    }

    const { itemId } = paramsResult.data;

    const result = await db.transaction(async (transaction) => {
      const cart = await findOrCreateActiveCart(identity, { transaction });

      const line = await findCartItemById(itemId, { transaction });

      if (!line || line.cart_id !== cart.id) {
        return null;
      }

      await deleteCartItem(itemId, { transaction });
      const data = await buildCartResponse(cart, { transaction });

      return {
        deletedLine: line,
        data,
      };
    });

    if (!result) {
      return res.status(404).json({
        error: { status: 404, message: "Cart item not found" },
      });
    }

    return res.json({
      data: {
        ...result.data,
        line: result.deletedLine,
      },
    });
  } catch (error) {
    return next(error);
  }
}
