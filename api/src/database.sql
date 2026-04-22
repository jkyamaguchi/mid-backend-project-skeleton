-- PostgreSQL schema
-- Reflects the ERD in docs/ERD.md

BEGIN;

-- ------------------------------------------------------------
-- user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user" (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL CHECK (length(trim(name)) >= 2),
    email   VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%@%.%')
);

-- ------------------------------------------------------------
-- event
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event (
    id                  SERIAL PRIMARY KEY,
    created_by_user_id  INTEGER        NOT NULL,
    price               NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    currency            CHAR(3)        NOT NULL CHECK (currency = upper(currency)),
    title               VARCHAR(255)   NOT NULL CHECK (length(trim(title)) >= 3),
    description         TEXT,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    CONSTRAINT fk_event_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES "user" (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- cart
-- user_id    nullable — guest carts have no user yet
-- session_id nullable — cleared once cart is claimed by a user
-- is_active  unique partial index enforces one active cart per user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER,
    session_id  VARCHAR(255),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ,
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id)
        REFERENCES "user" (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- One active cart per authenticated user
CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_one_active_per_user
    ON cart (user_id)
    WHERE is_active = TRUE AND user_id IS NOT NULL;

-- ------------------------------------------------------------
-- cart_item  (simple PK: id)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_item (
    id                  SERIAL PRIMARY KEY,
    cart_id             INTEGER        NOT NULL,
    event_id            INTEGER        NOT NULL,
    quantity            INTEGER        NOT NULL CHECK (quantity > 0),
    price_at_addition   NUMERIC(10, 2) NOT NULL CHECK (price_at_addition >= 0),
    currency            CHAR(3)        NOT NULL CHECK (currency = upper(currency)),
    added_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cart_item_cart
        FOREIGN KEY (cart_id)
        REFERENCES cart (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_event
        FOREIGN KEY (event_id)
        REFERENCES event (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Prevent the same event appearing twice in one cart
CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_item_cart_event
    ON cart_item (cart_id, event_id);

-- ------------------------------------------------------------
-- order  (user_id required — only authenticated users can order)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "order" (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER        NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    currency    CHAR(3)        NOT NULL CHECK (currency = upper(currency)),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ,
    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES "user" (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- order_item
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_item (
    id                  SERIAL PRIMARY KEY,
    order_id            INTEGER        NOT NULL,
    event_id            INTEGER        NOT NULL,
    quantity            INTEGER        NOT NULL CHECK (quantity > 0),
    price_at_purchase   NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    currency            CHAR(3)        NOT NULL CHECK (currency = upper(currency)),
    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id)
        REFERENCES "order" (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_order_item_event
        FOREIGN KEY (event_id)
        REFERENCES event (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Seed data
-- ------------------------------------------------------------
INSERT INTO "user" (name, email) VALUES
    ('Test User', 'test.user@example.com');

INSERT INTO event (created_by_user_id, price, currency, title, description) VALUES
    (1, 100, 'DKK', 'Copenhagen Coffee Crawl',      'A relaxed Saturday walk between 4 specialty cafés.'),
    (1, 150, 'DKK', 'After-Work Board Games Night', 'Drop in with friends or come solo.'),
    (1, 250, 'DKK', 'Beginner Pasta Workshop',      'Hands-on workshop: mix dough, roll sheets, shape pasta.');

-- ------------------------------------------------------------
-- Sample queries
-- ------------------------------------------------------------
SELECT * FROM event;
SELECT * FROM event WHERE id = 1;

COMMIT;
