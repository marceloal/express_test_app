import 'dotenv/config'

const DEFAULT_PORT = 3000
const DEFAULT_JWT_SECRET = 'dev-secret-change-me'
const DEFAULT_DATABASE_URL =
  'postgres://postgres:postgres@localhost:5432/mvp_app'

const port = Number(process.env.PORT ?? DEFAULT_PORT)
const jwtSecret = process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET
const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL

if (!process.env.JWT_SECRET) {
  console.warn(
    '[env] JWT_SECRET nao definido. Usando valor padrao inseguro apenas para desenvolvimento.'
  )
}

if (!process.env.DATABASE_URL) {
  console.warn('[env] DATABASE_URL nao definido. Usando conexao padrao local.')
}

export const env = {
  port,
  jwtSecret,
  databaseUrl
}
