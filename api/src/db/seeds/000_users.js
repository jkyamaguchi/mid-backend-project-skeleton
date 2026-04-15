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
    ])
    .onConflict("id")
    .merge();
}
