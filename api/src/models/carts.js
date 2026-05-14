import db from "#configs/database.js";

// ─── Cart ────────────────────────────────────────────────────────────────────

/**
 * Find a cart row by id.
 *
 * @param {number} cartId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object|null>}
 */
export async function findCartById(cartId, { transaction = db } = {}) {
  const row = await transaction("cart").where({ id: cartId }).first();
  return row ?? null;
}

/**
 * Find the active cart for an authenticated user.
 *
 * @param {number} userId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object|null>}
 */
export async function findActiveCartByUser(userId, { transaction = db } = {}) {
  const row = await transaction("cart")
    .where({ user_id: userId, is_active: true })
    .first();
  return row ?? null;
}

/**
 * Find an active guest cart by session id.
 *
 * @param {string} sessionId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object|null>}
 */
export async function findActiveCartBySession(
  sessionId,
  { transaction = db } = {},
) {
  const row = await transaction("cart")
    .where({ session_id: sessionId, is_active: true })
    .first();
  return row ?? null;
}

/**
 * Create a new active cart.
 *
 * @param {{ userId?: number|null, sessionId?: string|null }} params
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object>}
 */
export async function createCart(
  { userId = null, sessionId = null },
  { transaction = db } = {},
) {
  const [row] = await transaction("cart")
    .insert({ user_id: userId, session_id: sessionId, is_active: true })
    .returning("*");

  return row;
}

/**
 * Find an active cart by owner identity, creating one when none exists.
 *
 * @param {{ userId?: number|null, sessionId?: string|null }} params
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object>}
 */
export async function findOrCreateActiveCart(
  { userId = null, sessionId = null },
  { transaction = db } = {},
) {
  if (userId) {
    const existing = await findActiveCartByUser(userId, { transaction });
    if (existing) return existing;
    return createCart({ userId, sessionId: null }, { transaction });
  }

  if (sessionId) {
    const existing = await findActiveCartBySession(sessionId, { transaction });
    if (existing) return existing;
    return createCart({ userId: null, sessionId }, { transaction });
  }

  throw new Error("Either userId or sessionId is required to resolve a cart");
}

// Cart items

/**
 * Get all items in a cart, joined with basic event info.
 *
 * SQL equivalent:
 *   SELECT ci.*, e.title, e.currency AS event_currency
 *   FROM cart_item ci
 *   JOIN event e ON e.id = ci.event_id
 *   WHERE ci.cart_id = :cartId
 *   ORDER BY ci.id ASC
 *
 * @param {number} cartId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Array<Object>>}
 */
export async function listCartItems(cartId, { transaction = db } = {}) {
  return transaction("cart_item as ci")
    .join("event as e", "e.id", "ci.event_id")
    .where("ci.cart_id", cartId)
    .orderBy("ci.id", "asc")
    .select(
      "ci.id",
      "ci.cart_id",
      "ci.event_id",
      "e.title as event_title",
      "ci.quantity",
      "ci.price_at_addition",
      "ci.currency",
      "ci.added_at",
    );
}

/**
 * Find a cart line by its primary key id.
 *
 * @param {number} cartItemId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object|null>}
 */
export async function findCartItemById(cartItemId, { transaction = db } = {}) {
  const row = await transaction("cart_item").where({ id: cartItemId }).first();
  return row ?? null;
}

/**
 * Find an existing line in a cart for a specific event.
 *
 * @param {number} cartId
 * @param {number} eventId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object|null>}
 */
export async function findCartItemByCartAndEvent(
  cartId,
  eventId,
  { transaction = db } = {},
) {
  const row = await transaction("cart_item")
    .where({ cart_id: cartId, event_id: eventId })
    .first();
  return row ?? null;
}

/**
 * Insert a new cart line.
 *
 * @param {{ cartId: number, eventId: number, quantity: number, priceAtAddition: number|string, currency: string }} params
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object>}
 */
export async function addCartItem(
  { cartId, eventId, quantity, priceAtAddition, currency },
  { transaction = db } = {},
) {
  const [row] = await transaction("cart_item")
    .insert({
      cart_id: cartId,
      event_id: eventId,
      quantity,
      price_at_addition: priceAtAddition,
      currency,
    })
    .returning("*");

  return row;
}

/**
 * Update quantity for a cart line by cart line id.
 *
 * @param {number} cartItemId
 * @param {number} quantity
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Object|null>}
 */
export async function updateCartItemQuantity(
  cartItemId,
  quantity,
  { transaction = db } = {},
) {
  const [row] = await transaction("cart_item")
    .where({ id: cartItemId })
    .update({ quantity })
    .returning("*");

  return row ?? null;
}

/**
 * Delete a cart item by its id.
 *
 * @param {number} cartItemId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<number>} Number of deleted rows
 */
export async function deleteCartItem(cartItemId, { transaction = db } = {}) {
  return transaction("cart_item").where({ id: cartItemId }).delete();
}

/**
 * Calculate the cart subtotal.
 *
 * SQL equivalent:
 *   SELECT
 *     SUM(ci.price_at_addition * ci.quantity) AS subtotal,
 *     MIN(ci.currency) AS currency,
 *     COUNT(*) AS line_count,
 *     SUM(ci.quantity) AS total_quantity
 *   FROM cart_item ci
 *   WHERE ci.cart_id = :cartId
 *
 * Returns null when the cart is empty.
 *
 * @param {number} cartId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<{ subtotal: number, currency: string, line_count: number, total_quantity: number }|null>}
 */
export async function getCartSubtotal(cartId, { transaction = db } = {}) {
  const row = await transaction("cart_item")
    .where({ cart_id: cartId })
    .select(
      transaction.raw("SUM(price_at_addition * quantity) AS subtotal"),
      transaction.raw("MIN(currency) AS currency"),
      transaction.raw("COUNT(*) AS line_count"),
      transaction.raw("SUM(quantity) AS total_quantity"),
    )
    .first();

  if (!row || row.line_count === "0" || row.line_count === 0) return null;

  return {
    subtotal: Number(row.subtotal),
    currency: row.currency,
    line_count: Number(row.line_count),
    total_quantity: Number(row.total_quantity),
  };
}
