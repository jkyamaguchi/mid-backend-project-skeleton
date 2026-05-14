import db from "#configs/database.js";
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