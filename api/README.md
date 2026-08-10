# The API package

This package sets up a [Express](https://expressjs.com/) API server and a connection to a PostgreSQL database by default using [Knex](https://knexjs.org/).

For development you can run the command `npm run dev` which uses `nodemon` to watch files and restarts the server when a change happens. You can find the API at [http://localhost:3001/api](http://localhost:3001/api).

There is an example route set up at "/" which you can implement to quickly test the connection to the database.

There is no build step, so when deploying it is enough to just run `npm run start`.

## Environment variables

You can set environment variables in the `.env` file or in the Render.com environment variables section.

When you start a fresh project, check out `.env-template` to get started. Create a file called `.env` and copy the contents of the template as a starting point (or just run `cp .env-template .env`). You should comment in/out the sections you need, and add any additional configuration as necessary.

## Database clients

The package comes installed with an SQLite, MySQL, and PostgreSQL client. Here's a quick suggestion for use cases:

1. SQLite for quick, simple file-based storage
2. MySQL for more advanced data storage (requires you to run a database service)
3. PostgreSQL, similar to MySQL and used on our recommended hosting platform Render.com

You can decide which client to use by changing the `DB_CLIENT` environment variable. See `.env-template` for more info.

## Advanced database management

You can get far with a simple `.sql` file to manage your database but if you'd prefer to manage your database with Knex, you can use [Knex Migrations](https://knexjs.org/guide/migrations.html) to set up your schema (as well as rollback schema changes across versions).

You can also use [Knex Seeds](https://knexjs.org/guide/migrations.html#seed-files) to populate your database with data.

Combined, these two techniques make it very easy to experiment with changes to your database or recover your database if something happens to it.

It also makes it possible to share temporary schema changes with others during Pull Request testing.

### Running migrations and seeds

This project includes helper scripts for running Knex migrations and seeds:

- `npm run db:migrate` – runs all pending migrations
- `npm run db:seed` – runs all seed files
- `npm run db:setup` – runs migrations and then seeds (fresh setup)

The `db:setup` command is useful when:

- You are starting the project for the first time
- You want to reset your local database
- You are running the demo version of the API

### Important for trainees

This skeleton includes a simple **MVC-style structure**:

- **Routers** define API endpoints
- **Controllers** handle HTTP request/response logic
- **Models** contain database access logic

MVC is introduced intentionally in this project, even if it has not been deeply covered as a formal pattern during the course.

The reason is to simulate a more realistic backend project environment:
you may join a codebase where the overall structure was already chosen by a more experienced developer, and your task is to understand it, follow it, and continue building within it.

At the same time, this project keeps the implementation aligned with the JavaScript level of the course:

- modules and exported functions
- no class-based OOP requirement
- no advanced framework abstractions
- SQL and Knex used in a direct and readable way

So while the **project structure** is slightly more professional and opinionated than a blank beginner project, the **coding style itself** remains intentionally simple and compatible with the modular JavaScript you have learned.

Knex migrations and seeds are also included as an **advanced database management technique** often used in professional backend projects.

For your tasks, assignments and learning purposes, you are expected to:

- design your own database schema
- write your own SQL queries
- understand how your tables are structured
- continue working within the provided MVC structure

You should not rely blindly on the provided migrations if your assignment requires you to build your own schema.  
If needed, modify or remove the existing migrations and seeds to match your database assignments.

## Deploying

> Last tested: 2025-07-08

### Deploying a PostgreSQL database

From your Render.com Dashboard page, click the tile called PostGreSQL.

![](../images/render/database/step1.png)

In the next screen, fill in the marked fields, then scroll down.

![](../images/render/database/step2.png)

Select the "Free" tier. Then click "Create".

> Your database will be automatically deleted after 90 days, if you need it for longer simply recreate it following the same steps.

![](../images/render/database/step3.png)

On the next page, scroll down to the section "Connections".

![](../images/render/database/step4.png)

We need to copy the the following fields:

- Port
- Database
- Username
- Password
- External Database URL

We can put these into our `.env` file to test our database locally.

It's important to note that we need to extract only the host name from "External Database URL".  
If the value you copied was:

> postgres://my_user:EiwuEVDpdGzoDRXTquSSXNMHoVmCh1qG@dpg-cobfi7i1hbls73e0dkt0-a.frankfurt-postgres.render.com/my_database_u9be

Then what you want to extract is:

> dpg-cobfi7i1hbls73e0dkt0-a.frankfurt-postgres.render.com

Your `.env` file should look something like this in the end:

```
PORT=3001

DB_CLIENT=pg
DB_HOST=dpg-cobfi7i1hbls73e0dkt0-a.frankfurt-postgres.render.com
DB_PORT=5432
DB_USER=my_user
DB_PASSWORD=EiwuEVDpdGzoDRXTquSSXNMHoVmCh1qG
DB_DATABASE_NAME=my_database_u9be
```

You can run `npm run dev` and visit `http://localhost:3001/api` to verify that your local API server is able to connect to your database on Render.com.

> You can use the same variables to connect to the database using a PostgreSQL management tool (such as [pgAdmin](https://www.pgadmin.org/)) to test and setup your database.

### Deploying an API server

If you go back to your Dashboard you should now see your database in your list of deployed services. From here click "New" and then select "Web Service".

![](../images/render/api/step5.png)
![](../images/render/api/step6.png)

We want to deploy from a Git repository, this is called GitOps. Each time we push a new commit to the Git repository, Render will update your deployed service.

![](../images/render/api/step7.png)

If you cannot find your Git repository, you may need to re-configure your Github account to allow Render to see the repository you want to deploy from.

![](../images/render/api/step8.png)

Click "Connect" for the repository you want to use (the one that is based on this template).

![](../images/render/api/step9.png)

In the next page, fill in all the required fields.

![](../images/render/api/step10.png)
![](../images/render/api/step11.png)

When you reach the section about "Environment variables", click the button called "Add from .env" which opens a dialog. You can copy the content of your `.env` file into this dialog (except for the PORT variable), then click "Add variables".

![](../images/render/api/step12.png)
![](../images/render/api/step13.png)

The page should look something like this after.  
It's important here to change the value of the variable DB_USE_SSL from "false" to "true".  
Finish up by clicking "Create Web Service".

![](../images/render/api/step14.png)

In the next screen you'll see the output of your build step which is downloading your code and deploying it.

![](../images/render/api/step15.png)

Once you see the text "Your service is live" you can test your API with Postman by using the deployed URL, which should be something like `https://hyf-template-api.onrender.com/api`. You should see the output the response from your "/" route.

If you've got this far, you probably want to deploy your web app next. Head over to the README.md in your app directory for instructions.

---

## Project overview

### What is this project?

A backend API for an events ticketing platform — think "buy tickets to cooking classes, yoga sessions, concerts, etc."

### What does it do?

| Feature            | What it means                                                |
| ------------------ | ------------------------------------------------------------ |
| **Events catalog** | Browse available events with pagination, search, and sorting |
| **Cart**           | Add events to a cart (works even if you're not logged in)    |
| **Orders**         | Authenticated users can place orders from their cart         |
| **Users**          | Basic user accounts                                          |

### Tech stack

| Tool                   | Role                             |
| ---------------------- | -------------------------------- |
| **Node.js + Express**  | Runs the server                  |
| **Knex.js**            | Builds SQL queries in JavaScript |
| **PostgreSQL (local)** | Local development database       |
| **Swagger UI**         | Interactive API docs at `/docs`  |

### Running locally with PostgreSQL

This project connects to a **local PostgreSQL instance** (not Render) during development. Make sure PostgreSQL is installed and running on your machine, then configure your `.env`:

```
PORT=3001

DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
DB_DATABASE_NAME=your_db_name
DB_USE_SSL=false

JWT_SECRET=your_secret_key_here
```

> `JWT_SECRET` is used to sign and verify authentication tokens. In development a fallback value is used automatically, but you should set a strong secret before deploying.

Then set up the database and start the server:

```bash
npm run db:setup   # run migrations + seeds
npm run dev        # start with auto-reload
```

### Stopping the server

If you get an `EADDRINUSE: address already in use :::3001` error, a previous server process is still holding the port. Kill it with:

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then run `npm run start` (or `npm run dev`) again.

### Testing the API

**Swagger UI** — open your browser and go to:

```
http://localhost:3001/docs
```

Every endpoint is listed there. You can fill in parameters and click "Execute" to send a live request directly from the browser.

**Postman** — create a new request and point it at:

```
GET http://localhost:3001/api/events
GET http://localhost:3001/api/events?q=music&page=0&pageSize=20
GET http://localhost:3001/api/events/:id
```

No authentication headers are needed for the public catalog endpoints.

### Key API endpoints

| Method   | URL                                      | Auth required     | What it does                               |
| -------- | ---------------------------------------- | ----------------- | ------------------------------------------ |
| `GET`    | `/api/events`                            | No                | List events (paginated, page 0 by default) |
| `GET`    | `/api/events?q=music&page=1&pageSize=20` | No                | Search + paginate events                   |
| `GET`    | `/api/events/:id`                        | No                | Get a single event by ID                   |
| `POST`   | `/api/auth/signup`                       | No                | Create a new user account                  |
| `POST`   | `/api/auth/login`                        | No                | Log in and receive a JWT token             |
| `GET`    | `/api/auth/me`                           | Yes (Bearer)      | Get the currently authenticated user       |
| `GET`    | `/api/cart`                              | Optional identity | Get active cart (authenticated or guest)   |
| `POST`   | `/api/cart/items`                        | Optional identity | Add an event to cart                       |
| `PUT`    | `/api/cart/items/{itemId}`               | Optional identity | Update quantity of a cart line             |
| `DELETE` | `/api/cart/items/{itemId}`               | Optional identity | Remove one cart line from active cart      |
| `GET`    | `/api/orders`                            | Yes (Bearer)      | List all orders for authenticated user     |
| `GET`    | `/api/orders/{orderId}`                  | Yes (Bearer)      | Get a single order with items              |
| `POST`   | `/api/orders/checkout`                   | Yes (Bearer)      | Convert active cart to order               |

### How DELETE /api/cart/items/{itemId} works

This endpoint removes one cart line (`cart_item.id`) from the caller's active cart.

Important behavior:

- `itemId` is the cart line id, not the event id
- The API resolves your active cart from identity:
- Use `Authorization: Bearer <token>` for authenticated users
- Or use `x-session-id: <session-id>` for guest carts
- The line is only deleted if it belongs to your active cart
- On success, the response returns the updated cart (`cart`, `items`, `summary`) and the deleted line snapshot in `data.line`

#### Request examples

Authenticated user:

```http
DELETE /api/cart/items/12
Authorization: Bearer <jwt-token>
```

Guest user:

```http
DELETE /api/cart/items/12
x-session-id: guest-session-abc123
```

#### Response behavior

- `200 OK`: item removed and updated cart returned
- `400 Bad Request`: missing identity or invalid `itemId`
- `404 Not Found`: item does not exist in your active cart
- `401 Unauthorized`: invalid or expired bearer token

### Cart workflow in Postman (POST -> PUT -> DELETE)

Use this mini flow to test cart line lifecycle end-to-end.

Identity setup (use one consistently in all 3 requests):

- Authenticated: `Authorization: Bearer <jwt-token>`
- Guest: `x-session-id: guest-session-abc123`

1. Add an item to cart (POST)

```http
POST http://localhost:3001/api/cart/items
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "eventId": 3,
  "quantity": 1
}
```

Save `data.line.id` from the response. This is the `itemId` for the next steps.

2. Update quantity (PUT)

```http
PUT http://localhost:3001/api/cart/items/<itemId>
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "quantity": 3
}
```

3. Remove the item (DELETE)

```http
DELETE http://localhost:3001/api/cart/items/<itemId>
Authorization: Bearer <jwt-token>
```

Expected result:

- POST returns `201` (or `200` if same event already exists in cart)
- PUT returns `200` and updated line quantity
- DELETE returns `200` and the cart no longer contains that line

### Checkout workflow (POST /api/orders/checkout)

Once a shopper has added items to their cart and is ready to purchase, they trigger checkout with a single POST request.

**Checkout requires authentication** — only logged-in users can place orders.

```http
POST http://localhost:3001/api/orders/checkout
Authorization: Bearer <jwt-token>
```

**What happens inside the checkout transaction:**

1. **Find the active cart** — the API looks up the user's current active cart
2. **Validate cart is not empty** — returns 400 if no items exist
3. **Snapshot prices** — creates order header with total price calculated from cart item prices (prevents future price changes from affecting historical data)
4. **Create order items** — copies each cart line to the new order, preserving quantity and the snapshotted price at purchase time
5. **Deactivate old cart** — marks the cart as inactive so it cannot be modified
6. **Create new active cart** — generates a fresh empty cart for future shopping
7. **Return results** — responds with the created order, order items, and the new empty cart

**All operations run inside a single database transaction** — either the full checkout succeeds or nothing is saved. This guarantees data consistency.

**Response on success (201 Created):**

```json
{
  "data": {
    "order": {
      "id": 1,
      "user_id": 5,
      "total_price": "89.97",
      "currency": "DKK",
      "created_at": "2026-05-14T10:30:00Z",
      "updated_at": "2026-05-14T10:30:00Z"
    },
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "event_id": 3,
        "quantity": 2,
        "price_at_purchase": "29.99",
        "currency": "DKK"
      },
      {
        "id": 2,
        "order_id": 1,
        "event_id": 7,
        "quantity": 1,
        "price_at_purchase": "29.99",
        "currency": "DKK"
      }
    ],
    "newCart": {
      "id": 2,
      "user_id": 5,
      "session_id": null,
      "is_active": true,
      "created_at": "2026-05-14T10:30:00Z",
      "updated_at": "2026-05-14T10:30:00Z"
    }
  }
}
```

**Error responses:**

- `400 Bad Request`: Cart is empty
- `401 Unauthorized`: No valid bearer token provided
- `404 Not Found`: User has no active cart

### Retrieving orders (GET endpoints)

**List all orders for authenticated user:**

```http
GET /api/orders
Authorization: Bearer <jwt-token>
```

Returns a list of all orders placed by the authenticated user, sorted newest first.

**Get a specific order:**

```http
GET /api/orders/:orderId
Authorization: Bearer <jwt-token>
```

Returns the order header and all its items. Returns `403 Forbidden` if the order belongs to a different user.

### Line item id strategy (cart lines and order lines)

This section clarifies how line-level identifiers are handled across cart and order flows.

#### What is implemented now

- Cart line id = `cart_item.id`
- This is correctly used as `itemId` in:
  - `PUT /api/cart/items/:itemId`
  - `DELETE /api/cart/items/:itemId`
- Cart identity is resolved from:
  - `Authorization: Bearer <token>` (authenticated user cart)
  - `x-session-id` (guest cart)
- Cart operations are consistent:
  - `POST /api/cart/items`: creates a new line or increments quantity when the same `event_id` already exists in the active cart
  - `PUT /api/cart/items/:itemId`: updates quantity by cart line id
  - `DELETE /api/cart/items/:itemId`: removes a line only if it belongs to the caller's active cart
- Price snapshot at cart stage is stored in `cart_item.price_at_addition`

#### Order line strategy in current code

`createOrderFromCart` exists in `src/models/orders.js`.

It follows the snapshot pattern:

- reads cart lines
- creates order header
- creates `order_item` lines with `price_at_purchase = price_at_addition`
- deactivates the cart
- runs all operations inside one database transaction

This means the strategy is:

- cart lines are mutable while shopping
- order lines are immutable purchase snapshots after checkout

### API documentation style: `@swagger` comments vs `openapi.yaml`

Both approaches are valid. The better choice depends on team size and workflow.

**`@swagger` annotations (inline in route files)**

- Best for small teams and trainee projects
- Keeps docs close to the route code, so updates are quick
- Reduces risk of forgetting to document a changed endpoint
- Works very well with this project setup because Swagger scans `src/routers`

**`openapi.yaml` (single contract file)**

- Best when API governance and contract review are priorities
- Easier to review API changes in one place
- Better for SDK/client generation and contract-first workflows
- Useful when multiple services or teams share one API contract

**Recommended approach for this project**

Use `@swagger` annotations as the default, because this codebase is organized around Express routers and fast iteration.

If the project grows (multiple teams, strict API versioning, generated clients), consider moving to a single `openapi.yaml` as the source of truth.

### Request validation with Zod

This API validates request payloads with **Zod** before running business logic.

Why this helps:

- Keeps validation rules in one clear schema
- Produces consistent and readable error messages
- Prevents invalid data from reaching model/database logic

Current usage in this project:

- `POST /api/cart/items` validates `eventId` and `quantity`
- `PUT /api/cart/items/{itemId}` validates both path params and body (`quantity`)
- `DELETE /api/cart/items/{itemId}` validates path params (`itemId`)
- `POST /api/auth/signup` validates `name`, `email`, and `password`
- `POST /api/auth/login` validates `email` and `password`

Validation failures return:

- HTTP status `400`
- Error shape: `{ "error": { "status": 400, "message": "..." } }`

Example pattern:

```js
import z from "zod";

const cartItemCreateSchema = z.object({
  eventId: z.coerce
    .number()
    .int("eventId must be an integer")
    .positive("eventId must be a positive integer"),
  quantity: z.coerce
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be a positive integer")
    .default(1),
});

const cartItemUpdateSchema = z.object({
  quantity: z.coerce
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be a positive integer"),
});
```

Tip: use `safeParse(...)` and return early with a 400 response when validation fails.

### Authentication

The API uses **JSON Web Tokens (JWT)** for authentication.

**Sign up** — create a new account:

```http
POST /api/auth/signup
Content-Type: application/json

{ "name": "Your Name", "email": "you@example.com", "password": "yourpassword" }
```

You can create an account directly in Swagger UI by testing the `POST /api/auth/signup` endpoint.
You can also copy the same JSON body into Postman and send the request there.

**Log in** — returns a token:

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "you@example.com", "password": "yourpassword" }
```

In **Postman**:

1. Create a new request.
2. Set the method to `POST`.
3. Use the URL `http://localhost:3001/api/auth/login`.
4. Open the **Body** tab, choose **raw**, then select **JSON**.
5. Paste your email and password JSON.
6. Click **Send**.
7. Copy the `token` value from the response.

**Access a protected endpoint** — include the token as a Bearer header:

```http
GET /api/auth/me
Authorization: Bearer <token>
```

In **Postman**:

1. Create a second request.
2. Set the method to `GET`.
3. Use the URL `http://localhost:3001/api/auth/me`.
4. Open the **Authorization** tab.
5. Set **Type** to **Bearer Token**.
6. Paste the token copied from the login response.
7. Click **Send**.

If the `Authorization` header is missing, or if the token is not prefixed as `Bearer <token>`, the API will return `401 Unauthorized`.

#### Seeded test credentials

After running `npm run db:seed` the following accounts are available immediately:

| Name         | Email                      | Password    |
| ------------ | -------------------------- | ----------- |
| Test User    | `test.user@example.com`    | `test12345` |
| Alice Jensen | `alice.jensen@example.com` | `test12345` |

#### How the seeded passwords were created

Passwords are never stored as plain text. Before a password is saved to the database it is run through **bcrypt**, a one-way hashing algorithm that is intentionally slow to make brute-force attacks impractical.

The hash stored in the seed file was generated once using:

```js
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("test12345", 10); // cost factor 10
```

The resulting string (e.g. `$2a$10$...`) is what lives in `password_hash`. At login time, `bcrypt.compare(plainPassword, storedHash)` re-hashes the attempt and checks it against the stored value — the original password cannot be recovered from the hash.

### Database tables

| Table        | Purpose                                         |
| ------------ | ----------------------------------------------- |
| `user`       | User accounts                                   |
| `event`      | Events in the catalog                           |
| `cart`       | A cart per user (or guest session)              |
| `cart_item`  | Individual events added to a cart               |
| `order`      | A completed purchase (authenticated users only) |
| `order_item` | Snapshot of each event at the time of purchase  |

### Key design decisions

- `cart.user_id` is **nullable** — carts can exist before a user logs in (guest cart)
- `cart.session_id` tracks guest carts; cleared when the cart is claimed by a logged-in user
- `cart.is_active` enforces one active cart per authenticated user
- `order_item.price_at_purchase` is a **price snapshot** — future price changes on events never alter order history
- All orders run inside a **database transaction** — either the full order is created or nothing is

---

## Database schema history

This section explains how the database grew step by step during the project.

---

### Step 1 — Start simple: users and events

We started with just two tables:

- **`user`** — holds the name and email of each person using the app
- **`event`** — holds each event in the catalog (title, price, description, etc.)

Each event has a column called `created_by_user_id` that points to the user who created it. This is called a **foreign key** — it's like a reference that links one table to another. If you try to delete a user who created events, the database will block it to avoid leaving broken data behind.

---

### Step 2 — Plan the new tables: cart, cart_item, order, order_item

Before writing any code, we drew a diagram (called an ERD — Entity Relationship Diagram) to plan out the new tables and answer some important questions:

**Can someone add items to a cart without being logged in?**
Yes. A cart can exist without a user account — we store a `session_id` instead to keep track of who the guest is. The `user_id` column is left empty (nullable) until the person logs in.

**Can a user have multiple active carts?**
No. We enforce one active cart per logged-in user using a database rule (a partial unique index on `user_id` where the cart is active).

**How do we identify items in a cart?**
Each cart item gets its own simple ID number — this makes it easier to work with in API endpoints.

**Who can place an order?**
Only logged-in users. The `user_id` on an order is always required (not nullable).

---

### Step 3 — Write the migration files

A **migration file** is a JavaScript file that tells the database what tables to create. Running `npm run db:migrate` executes these files in order.

We added two new migration files:

**`20260422120000_create_cart_tables.js`** — creates `cart` and `cart_item`

- `cart.user_id` can be empty (for guest carts)
- `cart.session_id` can be empty (for logged-in users)
- `cart.is_active` tracks whether this is the current active cart
- If a cart is deleted, all its items are automatically deleted too (CASCADE)
- The same event cannot appear twice in the same cart

**`20260422130000_create_order_tables.js`** — creates `order` and `order_item`

- `order.user_id` is always required — guests cannot place orders
- If an order is deleted, all its items are automatically deleted too (CASCADE)

Both files check if the table already exists before trying to create it, so they won't crash if you run them more than once.

---

### Step 4 — Fix a PostgreSQL ID numbering issue

When we seed (fill) the database with test data, we insert rows with specific ID numbers like `id: 1`, `id: 2`, etc.

PostgreSQL uses an internal counter called a **sequence** to automatically assign the next ID. The problem is: manually inserting IDs does not update that counter. So the next time something is inserted without an ID, PostgreSQL might try to use `id: 1` again — which crashes because it already exists.

The fix: after each seed, we tell PostgreSQL to fast-forward its counter to the highest ID already in the table:

```sql
SELECT setval('table_id_seq', (SELECT MAX(id) FROM "table"))
```

---

### Step 5 — Delete data in the right order

When re-seeding (wiping and refilling test data), we need to delete rows carefully. Because tables reference each other with foreign keys, you can't delete a parent row while child rows still point to it.

Think of it like this: you can't delete a shopping cart while it still has items in it.

The correct order to delete everything is:

```
order_item → order → cart_item → cart → event → user
```

We always delete the most "dependent" tables first, working our way back to the root tables.

---

### Step 6 — Add password authentication

To support login we needed a way to store passwords safely. We added a new migration file:

**`20260506120000_add_password_hash_to_user.js`** — adds a `password_hash` column to the `user` table.

- The column is **nullable** so that existing seeded users (created before auth existed) are not broken.
- Passwords are **never stored as plain text**. Before saving, the plain password is hashed with `bcrypt` (cost factor 10). At login, `bcrypt.compare` is used to verify the attempt against the stored hash — the original password cannot be read back.
- The column name is `password_hash` (not `password`) to make it obvious that the raw value is never stored.
- A JWT (JSON Web Token) is issued on successful signup or login. The token is signed with `JWT_SECRET` and expires after 7 days. Clients include it as `Authorization: Bearer <token>` on protected requests.

---

### Step 7 — Implement checkout and order conversion

A complete checkout transaction converts a shopper's active cart into an order, creates a fresh cart, and ensures all operations succeed or fail together as one atomic unit.

**`createOrderFromCart` in `src/models/orders.js`** implements the checkout logic:

- Loads all cart items (including price snapshot from `price_at_addition`)
- Calculates order total from snapshotted prices (not live event prices)
- Creates the `order` header row with total and currency
- Creates `order_item` rows with `price_at_purchase = price_at_addition` (the historical snapshot)
- Deactivates the old cart so it cannot be modified
- Runs all operations **inside a single database transaction** for atomicity

**`postCheckout` in `src/controllers/orders.js`** exposes this as an HTTP endpoint:

- Validates user authentication (Bearer token required)
- Calls `createOrderFromCart` to convert the active cart
- Creates a new active cart for future shopping
- Wraps both operations in a database transaction
- Returns the order, order items, and new cart on success (HTTP 201)
- Handles errors: empty cart (400), no active cart (404), unauthorized (401)

**Key design decisions:**

- **Inventory is unlimited** — no quantity checks or deductions occur
- **Price snapshot** — order preserves the exact price when items were added to cart, even if event prices change later
- **Transactional atomicity** — checkout is all-or-nothing; a crash during order creation rolls back all changes
- **One active cart per user** — after checkout, the old cart is deactivated and a new one is created immediately
- **Authenticated checkout only** — only logged-in users can place orders
