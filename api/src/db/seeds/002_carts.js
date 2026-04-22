/**
 * @param {import("knex").Knex} knex
 */
export async function seed(knex) {
  // Remove in dependency order to avoid FK violations
  await knex("cart_item").del();
  await knex("cart").del();
  await knex.raw("ALTER SEQUENCE cart_item_id_seq RESTART WITH 1");
  await knex.raw("ALTER SEQUENCE cart_id_seq RESTART WITH 1");

  // cart 1: active cart belonging to user 1 (authenticated)
  // cart 2: guest cart (no user, tracked by session_id)
  await knex("cart").insert([
    {
      id: 1,
      user_id: 1,
      session_id: null,
      is_active: true,
    },
    {
      id: 2,
      user_id: null,
      session_id: "guest-session-abc123",
      is_active: true,
    },
  ]);

  await knex("cart_item").insert([
    // User 1's active cart: two events
    {
      id: 1,
      cart_id: 1,
      event_id: 1,
      quantity: 2,
      price_at_addition: 100,
      currency: "DKK",
    },
    {
      id: 2,
      cart_id: 1,
      event_id: 3,
      quantity: 1,
      price_at_addition: 250,
      currency: "DKK",
    },
    // Guest cart: one event
    {
      id: 3,
      cart_id: 2,
      event_id: 5,
      quantity: 1,
      price_at_addition: 75,
      currency: "DKK",
    },
  ]);

  await knex.raw("SELECT setval('cart_id_seq', (SELECT MAX(id) FROM cart))");
  await knex.raw(
    "SELECT setval('cart_item_id_seq', (SELECT MAX(id) FROM cart_item))",
  );
}
