/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  // cart
  // - user_id is nullable: a cart can be created before a user logs in (guest cart)
  // - session_id is nullable: used to track guest carts; cleared when cart is claimed by a user
  // - is_active: a partial unique index enforces one active cart per authenticated user
  const hasCart = await knex.schema.hasTable("cart");
  if (!hasCart) {
    await knex.schema.createTable("cart", (t) => {
      t.increments("id").primary();

      t.integer("user_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("SET NULL");

      t.string("session_id", 255).nullable();

      t.boolean("is_active").notNullable().defaultTo(true);

      t.timestamps(true, true); // created_at, updated_at
    });

    // Enforce one active cart per authenticated user at the DB level
    // (partial unique index — only supported natively in PostgreSQL)
    await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_one_active_per_user
    ON cart (user_id)
    WHERE is_active = TRUE AND user_id IS NOT NULL
  `);
  } // end if (!hasCart)

  // cart_item
  // - cart_id required (CASCADE delete when cart is removed)
  // - event_id required (RESTRICT delete so event data is preserved for existing carts)
  // - unique constraint prevents adding the same event twice to one cart
  const hasCartItem = await knex.schema.hasTable("cart_item");
  if (!hasCartItem) {
    await knex.schema.createTable("cart_item", (t) => {
      t.increments("id").primary();

      t.integer("cart_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("cart")
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
      t.decimal("price_at_addition", 10, 2).notNullable();
      t.string("currency", 3).notNullable();
      t.timestamp("added_at").notNullable().defaultTo(knex.fn.now());

      t.unique(["cart_id", "event_id"]); // prevent duplicate events in the same cart
    });
  } // end if (!hasCartItem)
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("cart_item");
  await knex.raw("DROP INDEX IF EXISTS uq_cart_one_active_per_user");
  await knex.schema.dropTableIfExists("cart");
}
