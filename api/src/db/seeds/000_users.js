/**
 * @param {import("knex").Knex} knex
 */
export async function seed(knex) {
  await knex("user")
    .insert([
      {
        id: 1,
        name: "Test User",
        email: "test.user@example.com",
      },
      {
        id: 2,
        name: "Alice Jensen",
        email: "alice.jensen@example.com",
      },
    ])
    .onConflict("id")
    .merge();

  // Reset sequence so next auto-generated id doesn't clash with seeded ids
  await knex.raw(
    "SELECT setval('user_id_seq', (SELECT MAX(id) FROM \"user\"))",
  );
}
