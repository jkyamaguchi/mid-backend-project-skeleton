/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable("user", (t) => {
    t.increments("id").primary();
    t.string("name", 255).notNullable();
    t.string("email", 255).notNullable().unique();
  });

  await knex.schema.createTable("event", (t) => {
    t.increments("id").primary();
    t.integer("created_by_user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("user")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
    t.decimal("price", 10, 2).notNullable();
    t.string("currency", 3).notNullable();
    t.string("title").notNullable();
    t.text("description");
    t.timestamps(true, true);
  });
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("event");
  await knex.schema.dropTableIfExists("user");
}
