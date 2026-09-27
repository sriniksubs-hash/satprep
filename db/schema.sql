-- Run this once against your database before first deploy.
-- See README.md for how to run it against Vercel Postgres.

-- ---------- Auth.js (NextAuth) required tables ----------
-- Schema as required by @auth/pg-adapter: https://authjs.dev/getting-started/adapters/pg

CREATE TABLE IF NOT EXISTS verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,

  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,

  PRIMARY KEY (id)
);

-- ---------- Our app-specific table ----------
-- Subject/topic/difficulty are denormalized from the problems.json file
-- at the time of the attempt, since problems live in a JSON file rather
-- than the database (per project setup). This keeps reporting queries
-- simple and means old attempts still make sense even if a problem is
-- later edited or removed from the JSON file.

CREATE TABLE IF NOT EXISTS attempts
(
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "problemId" VARCHAR(255) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  correct BOOLEAN NOT NULL,
  "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attempts_user_idx ON attempts ("userId");
CREATE INDEX IF NOT EXISTS attempts_user_created_idx ON attempts ("userId", "createdAt");
