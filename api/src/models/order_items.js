import db from "#configs/database.js";

/**
 * List order items for an order, including event titles.
 *
 * @param {number} orderId
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Array<Object>>}
 */
export async function listOrderItemsByOrderId(
  orderId,
  { transaction = db } = {},
) {
  return transaction("order_item as oi")
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
}

/**
 * Create order_item rows from existing cart items.
 *
 * @param {number} orderId
 * @param {Array<Object>} cartItems
 * @param {{ transaction?: import("knex").Knex }} [options]
 * @returns {Promise<Array<Object>>}
 */
export async function createOrderItemsFromCartItems(
  orderId,
  cartItems,
  { transaction = db } = {},
) {
  const rows = cartItems.map((item) => ({
    order_id: orderId,
    event_id: item.event_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_addition,
    currency: item.currency,
  }));

  return transaction("order_item").insert(rows).returning("*");
}
