-- DDL seeded from the old README description for Postgres/BigQuery targets.
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  tags TEXT[]
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','fulfilled','cancelled'))
);
