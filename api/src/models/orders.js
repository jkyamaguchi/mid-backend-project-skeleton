import db from "#configs/database.js";

/**
 * Find an order by id, including its items joined with event titles.
 *
 * @param {number} orderId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<{ order: Object, items: Array<Object> }|null>}
 */
export async function findOrderById(orderId, { transaction = db } = {}) {
  const order = await transaction("order").where({ id: orderId }).first();
  if (!order) return null;

  const items = await transaction("order_item as oi")
    .join("event as e", "e.id", "oi.event_id")
    .where("oi.order_id", orderId)
    .orderBy("oi.id", "asc")
    .select(
      "oi.id",
      "oi.event_id",
      "e.title as event_title",
      "oi.quantity",
      "oi.price_at_purchase",
      "oi.currency",
    );

  return { order, items };
}

/**
 * Create an order from a cart — the "snapshot" pattern.
 *
 * Snapshots price_at_addition as price_at_purchase so future price changes
 * on the event never alter historical order data.
 *
 * All inserts run inside a single transaction so the order is either fully
 * created or not created at all.
 *
 * SQL equivalent (conceptual):
 *   INSERT INTO "order" (user_id, total_price, currency)
 *     SELECT :userId, SUM(price_at_addition * quantity), MIN(currency)
 *     FROM cart_item WHERE cart_id = :cartId;
 *
 *   INSERT INTO order_item (order_id, event_id, quantity, price_at_purchase, currency)
 *     SELECT :newOrderId, event_id, quantity, price_at_addition, currency
 *     FROM cart_item WHERE cart_id = :cartId;
 *
 *   UPDATE cart SET is_active = false WHERE id = :cartId;
 *
 * @param {{ userId: number, cartId: number }} params
 * @param {{ transaction?: import("knex").Knex }} [options]  Pass an existing transaction to compose with a larger transaction
 * @returns {Promise<{ order: Object, items: Array<Object> }>}
 */
export async function createOrderFromCart(
  { userId, cartId },
  { transaction } = {},
) {
  const run = async (t) => {
    // 1. Load cart items (price snapshot happens here — we read current cart prices)
    const cartItems = await t("cart_item").where({ cart_id: cartId });

    if (cartItems.length === 0) {
      throw new Error("Cannot create order from an empty cart");
    }

    // 2. Calculate total from snapshotted prices (not live event prices)
    const total_price = cartItems.reduce(
      (sum, item) => sum + Number(item.price_at_addition) * item.quantity,
      0,
    );
    const currency = cartItems[0].currency;

    // 3. Insert order header
    const [order] = await t("order")
      .insert({ user_id: userId, total_price, currency })
      .returning("*");

    // 4. Insert order lines — price_at_purchase = price_at_addition (the snapshot)
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      event_id: item.event_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_addition, // snapshot
      currency: item.currency,
    }));

    const insertedItems = await t("order_item")
      .insert(orderItems)
      .returning("*");

    // 5. Deactivate the cart so it can no longer be modified
    await t("cart").where({ id: cartId }).update({ is_active: false });

    return { order, items: insertedItems };
  };

  // Use caller's transaction if provided, otherwise open a new one
  if (transaction) return run(transaction);
  return db.transaction(run);
}

/**
 * List all orders for a user, newest first.
 *
 * @param {number} userId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Array<Object>>}
 */
export async function listOrdersByUser(userId, { transaction = db } = {}) {
  return transaction("order")
    .where({ user_id: userId })
    .orderBy("created_at", "desc")
    .select("*");
}
