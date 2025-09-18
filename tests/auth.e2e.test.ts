import request from 'supertest'

import app from '../src/app'
import {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabasePool
} from '../src/config/database'

const pool = getDatabasePool()

async function resetDatabase(): Promise<void> {
  await pool.query('TRUNCATE TABLE usuario_logs, usuarios;')
}

describe('Fluxo de autenticacao', () => {
  beforeAll(async () => {
    await connectToDatabase()
    await resetDatabase()
  })

  afterAll(async () => {
    await resetDatabase()
    await disconnectFromDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('deve registrar um novo usuario e retornar token', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Usuario Teste',
      email: 'novo@test.com',
      password: 'senha-segura'
    })

    expect(response.status).toBe(201)
    expect(response.body.user).toMatchObject({
      name: 'Usuario Teste',
      email: 'novo@test.com'
    })
    expect(response.body.user.id).toBeDefined()
    expect(response.body.token).toEqual(expect.any(String))
  })

  it('nao deve permitir registro com email duplicado', async () => {
    await request(app).post('/auth/register').send({
      name: 'Duplicado',
      email: 'duplicado@test.com',
      password: 'senha'
    })

    const response = await request(app).post('/auth/register').send({
      name: 'Duplicado 2',
      email: 'duplicado@test.com',
      password: 'senha'
    })

    expect(response.status).toBe(409)
    expect(response.body.message).toContain('Email ja cadastrado')
  })

  it('deve realizar login e retornar token valido', async () => {
    await request(app).post('/auth/register').send({
      name: 'Login Teste',
      email: 'login@test.com',
      password: 'senha'
    })

    const response = await request(app).post('/auth/login').send({
      email: 'login@test.com',
      password: 'senha'
    })

    expect(response.status).toBe(200)
    expect(response.body.user).toMatchObject({
      email: 'login@test.com'
    })
    expect(response.body.token).toEqual(expect.any(String))
  })

  it('deve acessar rota protegida com token valido', async () => {
    const registerResponse = await request(app).post('/auth/register').send({
      name: 'Protegido',
      email: 'protegido@test.com',
      password: 'senha'
    })

    const token = registerResponse.body.token as string

    const profileResponse = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(profileResponse.status).toBe(200)
    expect(profileResponse.body.user).toMatchObject({
      email: 'protegido@test.com'
    })
  })
})

