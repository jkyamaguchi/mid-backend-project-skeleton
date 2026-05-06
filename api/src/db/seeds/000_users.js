/**
 * @param {import("knex").Knex} knex
 */
export async function seed(knex) {
  // Local test password for seeded users: test12345
  const seededPasswordHash =
    "$2a$10$GEay9nvSTpRHVrbNFVdFOOQmd8tZARmp0gfCIiRlgm/Bl9oOuzuPW";

  await knex("user")
    .insert([
      {
        id: 1,
        name: "Test User",
        email: "test.user@example.com",
        password_hash: seededPasswordHash,
      },
      {
        id: 2,
        name: "Alice Jensen",
        email: "alice.jensen@example.com",
        password_hash: seededPasswordHash,
      },
    ])
    .onConflict("id")
    .merge();

  // Reset sequence so next auto-generated id doesn't clash with seeded ids
  await knex.raw(
    "SELECT setval('user_id_seq', (SELECT MAX(id) FROM \"user\"))",
  );
}
