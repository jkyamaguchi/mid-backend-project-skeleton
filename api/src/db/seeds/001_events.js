/**
 * @param {import("knex").Knex} knex
 */
export async function seed(knex) {
  // Delete in dependency order so RESTRICT FK constraints don't block event deletion
  await knex("order_item").del();
  await knex("order").del();
  await knex("cart_item").del();
  await knex("cart").del();
  await knex("event").del();
  await knex.raw("ALTER SEQUENCE event_id_seq RESTART WITH 1");

  await knex("event")
    .insert([
      {
        id: 1,
        created_by_user_id: 1,
        price: 100,
        currency: "DKK",
        title: "Copenhagen Coffee Crawl",
        description:
          "A relaxed Saturday walk between 4 specialty cafés. Includes tasting notes, small pastry, and a guide to brewing styles.",
      },
      {
        id: 2,
        created_by_user_id: 1,
        price: 150,
        currency: "DKK",
        title: "After-Work Board Games Night",
        description:
          "Drop in with friends or come solo. We’ll teach quick games, set you up at a table, and keep the vibe cozy and social.",
      },
      {
        id: 3,
        created_by_user_id: 1,
        price: 250,
        currency: "DKK",
        title: "Beginner Pasta Workshop",
        description:
          "Hands-on workshop: mix dough, roll sheets, shape pasta, and finish with a simple sauce. You’ll leave with a small take-home pack.",
      },
      {
        id: 4,
        created_by_user_id: 1,
        price: 0,
        currency: "DKK",
        title: "Sunday Park Run & Stretch",
        description:
          "Easy-paced community run (5K-ish) followed by guided stretching. All levels welcome—walkers included.",
      },
      {
        id: 5,
        created_by_user_id: 1,
        price: 75,
        currency: "DKK",
        title: "Indie Film Screening: Short Nights",
        description:
          "A curated set of local short films with a short Q&A after. Seats are limited—arrive early for the best spots.",
      },
      {
        id: 6,
        created_by_user_id: 1,
        price: 180,
        currency: "DKK",
        title: "Photography Walk: City Lights",
        description:
          "Evening photo walk focused on street scenes and reflections. Bring any camera—even a phone—and we’ll share tips on composition and exposure.",
      },
      {
        id: 7,
        created_by_user_id: 1,
        price: 120,
        currency: "DKK",
        title: "Bread & Butter Tasting",
        description:
          "Taste 6 breads and 5 butters (classic + flavored). Learn what makes a good crumb, crust, and fermentation—and why butter matters.",
      },
      {
        id: 8,
        created_by_user_id: 1,
        price: 300,
        currency: "DKK",
        title: "Live Jazz Trio at the Loft",
        description:
          "An intimate set with modern standards and originals. Ticket includes a welcome drink; doors open 19:00.",
      },
    ])
    .onConflict("id")
    .merge();
}
