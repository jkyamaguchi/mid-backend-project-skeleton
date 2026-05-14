import db from "#configs/database.js";
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
  const rows = await transaction("cart_item")
    .where({ cart_id: cartId })
    .select("price_at_addition", "quantity", "currency");

  if (rows.length === 0) return null;

  const subtotal = rows.reduce(
    (sum, row) => sum + Number(row.price_at_addition) * Number(row.quantity),
    0,
  );
  const totalQuantity = rows.reduce(
    (sum, row) => sum + Number(row.quantity),
    0,
  );

  return {
    subtotal,
    currency: rows[0].currency,
    line_count: rows.length,
    total_quantity: totalQuantity,
  };
}
