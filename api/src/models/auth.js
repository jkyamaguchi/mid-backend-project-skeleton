import db from "#configs/database.js";

/**
 * Find user by email.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserByEmail(email) {
  return db("user").where({ email }).first();
}

/**
 * Find user by id.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findUserById(id) {
  return db("user").where({ id }).first();
}

/**
 * Create a new user with a pre-hashed password.
 *
 * @param {{ name: string, email: string, passwordHash: string }} params
 * @returns {Promise<object>}
 */
export async function createUser({ name, email, passwordHash }) {
  const [user] = await db("user")
    .insert({
      name,
      email,
      password_hash: passwordHash,
    })
    .returning("*");

  return user;
}
