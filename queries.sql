DROP TABLE IF EXISTS author, book, note, users, session;

CREATE TABLE author(
id SERIAL PRIMARY KEY,
name VARCHAR(70) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE book (
    id SERIAL PRIMARY KEY,
    olid TEXT,
    title VARCHAR(100) NOT NULL,
    read_date DATE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 10),
    summary TEXT,
    author_id INTEGER REFERENCES author(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id)
);


CREATE TABLE note(
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  book_id INTEGER REFERENCES book(id)
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
