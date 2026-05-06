/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  const hasUser = await knex.schema.hasTable("user");
  if (!hasUser) return;

  const hasPasswordHash = await knex.schema.hasColumn("user", "password_hash");
  if (!hasPasswordHash) {
    await knex.schema.alterTable("user", (t) => {
      t.string("password_hash", 255).nullable();
    });
  }
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  const hasUser = await knex.schema.hasTable("user");
  if (!hasUser) return;

  const hasPasswordHash = await knex.schema.hasColumn("user", "password_hash");
  if (hasPasswordHash) {
    await knex.schema.alterTable("user", (t) => {
      t.dropColumn("password_hash");
    });
  }
}
