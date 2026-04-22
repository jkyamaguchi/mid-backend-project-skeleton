/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  // order
  // - user_id is required (NOT NULL): only authenticated users can place orders
  const hasOrder = await knex.schema.hasTable("order");
  if (!hasOrder) {
    await knex.schema.createTable("order", (t) => {
      t.increments("id").primary();

      t.integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("RESTRICT");

      t.decimal("total_price", 10, 2).notNullable();
      t.string("currency", 3).notNullable();

      t.timestamps(true, true); // created_at, updated_at
    });
  } // end if (!hasOrder)

  // order_item
  // - order_id required (CASCADE delete when order is removed)
  // - event_id required (RESTRICT delete so event data is preserved in order history)
  const hasOrderItem = await knex.schema.hasTable("order_item");
  if (!hasOrderItem) {
    await knex.schema.createTable("order_item", (t) => {
      t.increments("id").primary();

      t.integer("order_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("order")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      t.integer("event_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("event")
        .onUpdate("CASCADE")
        .onDelete("RESTRICT");

      t.integer("quantity").notNullable().checkPositive();
      t.decimal("price_at_purchase", 10, 2).notNullable();
      t.string("currency", 3).notNullable();
    });
  } // end if (!hasOrderItem)
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("order_item");
  await knex.schema.dropTableIfExists("order");
}
