PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS user (
	id INTEGER PRIMARY KEY,
	name VARCHAR(255) NOT NULL CHECK (length(trim(name)) >= 2),
	email VARCHAR(255) NOT NULL UNIQUE CHECK (instr(email, '@') > 1)
);

CREATE TABLE IF NOT EXISTS event (
	id INTEGER PRIMARY KEY,
	created_by_user_id INTEGER NOT NULL,
	price NUMERIC NOT NULL CHECK (price >= 0),
	currency VARCHAR(3) NOT NULL CHECK (length(currency) = 3 AND currency = upper(currency)),
	title VARCHAR(255) NOT NULL CHECK (length(trim(title)) >= 3),
	description VARCHAR(2000),
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME,
	CONSTRAINT fk_event_created_by_user
		FOREIGN KEY (created_by_user_id)
		REFERENCES user (id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);
INSERT INTO user (id, name, email) VALUES
  (1, 'Test User', 'test.user@example.com');

INSERT INTO event (id, created_by_user_id, price, currency, title, description)
VALUES
  (1, 1, 100, 'DKK', 'Copenhagen Coffee Crawl', 'A relaxed Saturday walk between 4 specialty cafés.'),
  (2, 1, 150, 'DKK', 'After-Work Board Games Night', 'Drop in with friends or come solo.'),
  (3, 1, 250, 'DKK', 'Beginner Pasta Workshop', 'Hands-on workshop: mix dough, roll sheets, shape pasta.');

SELECT * FROM event;

SELECT * FROM event WHERE id = 1;

COMMIT;
