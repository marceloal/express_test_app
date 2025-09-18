process.env.NODE_ENV = process.env.NODE_ENV ?? 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret'
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgres://postgres:lXDERBJS@localhost:5434/mvp_teste'
process.env.PORT = process.env.PORT ?? '0'
