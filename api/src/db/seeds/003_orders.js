/**
 * @param {import("knex").Knex} knex
 */
export async function seed(knex) {
  // Remove in dependency order to avoid FK violations
  await knex("order_item").del();
  await knex("order").del();
  await knex.raw("ALTER SEQUENCE order_item_id_seq RESTART WITH 1");
  await knex.raw("ALTER SEQUENCE order_id_seq RESTART WITH 1");

  // order 1: placed by user 1 (completed purchase)
  // order 2: placed by user 2
  await knex("order").insert([
    {
      id: 1,
      user_id: 1,
      total_price: 350,
      currency: "DKK",
    },
    {
      id: 2,
      user_id: 2,
      total_price: 180,
      currency: "DKK",
    },
  ]);

  await knex("order_item").insert([
    // Order 1: two events
    {
      id: 1,
      order_id: 1,
      event_id: 2,
      quantity: 1,
      price_at_purchase: 150,
      currency: "DKK",
    },
    {
      id: 2,
      order_id: 1,
      event_id: 8,
      quantity: 1,
      price_at_purchase: 300,
      currency: "DKK",
    },
    // Order 2: one event
    {
      id: 3,
      order_id: 2,
      event_id: 6,
      quantity: 1,
      price_at_purchase: 180,
      currency: "DKK",
    },
  ]);

  await knex.raw(
    "SELECT setval('order_id_seq', (SELECT MAX(id) FROM \"order\"))",
  );
  await knex.raw(
    "SELECT setval('order_item_id_seq', (SELECT MAX(id) FROM order_item))",
  );
}
