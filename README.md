# API Express com TypeScript

Aplicação de autenticação e gerenciamento de perfil construída com Express 5, TypeScript e PostgreSQL. O projeto demonstra um fluxo completo de cadastro, login com JWT e consulta de perfil protegido.

## Tecnologias principais
- Node.js 18+
- Express 5
- TypeScript
- PostgreSQL (pg)
- JSON Web Tokens (jsonwebtoken)
- bcryptjs para hash de senha
- Jest + Supertest para testes

## Pré-requisitos
- Node.js 18 ou superior e NPM (ou Yarn/PNPM)
- Instância do PostgreSQL acessível com permissão de criação de tabelas
- Variáveis de ambiente configuradas (`.env` na raiz do projeto)

## Configuração rápida
1. Instale as dependências: `npm install`
2. Crie um arquivo `.env` seguindo o exemplo abaixo
3. Inicie o ambiente de desenvolvimento: `npm run dev`

### Variáveis de ambiente
```env
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/mvp_app
JWT_SECRET=sua-chave-super-secreta
```

Se `DATABASE_URL` ou `JWT_SECRET` não forem informados, valores padrão são utilizados apenas para desenvolvimento. Defina chaves seguras em produção.

### Banco de dados
Durante o startup, `connectToDatabase` testa a conexão e garante a criação das tabelas `usuarios` e `usuario_logs`. Verifique se o usuário do banco possui permissão para executar `CREATE TABLE`.

## Scripts disponíveis
- `npm run dev`: executa a API com recarga automática via ts-node-dev
- `npm run build`: gera os arquivos JavaScript em `dist`
- `npm start`: inicia a API a partir da build gerada
- `npm test`: executa a suíte de testes com Jest

## Endpoints principais
| Método | Rota | Descrição | Autenticação |
| ------ | ---- | --------- | ------------ |
| `GET` | `/health` | Verificação de saúde da API | Não requerida |
| `POST` | `/auth/register` | Cria um usuário e retorna token JWT | Não requerida |
| `POST` | `/auth/login` | Autentica e retorna token JWT | Não requerida |
| `GET` | `/profile` | Retorna dados do usuário autenticado | Header `Authorization: Bearer <token>` |

### Fluxo de autenticação
- As senhas são armazenadas com hash utilizando `bcryptjs`.
- Tokens JWT possuem expiração de 1 hora e são assinados com `JWT_SECRET`.
- Ao realizar login, um registro é criado em `usuario_logs` com metadados como IP e user-agent.
- A rota `/profile` utiliza o middleware `authenticate` para validar o token e disponibilizar `req.user`.

### Exemplos de requisições
**Cadastro**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "senha123"
}
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "ada@example.com",
  "password": "senha123"
}
```
Resposta esperada (200):
```json
{
  "user": {
    "id": "...",
    "name": "Ada Lovelace",
    "email": "ada@example.com"
  },
  "token": "<jwt>"
}
```

**Consulta de perfil**
```bash
curl http://localhost:3000/profile \
  -H "Authorization: Bearer <jwt>"
```

## Estrutura do projeto
```
src/
├── app.ts
├── index.ts
├── config/
│   ├── database.ts
│   └── env.ts
├── middleware/
│   └── authMiddleware.ts
├── repositories/
│   ├── userActionLogRepository.ts
│   └── userRepository.ts
├── routes/
│   ├── auth.routes.ts
│   └── profile.routes.ts
└── types/
    └── express.d.ts
```

## Desenvolvimento e testes
- Siga o padrão de código em TypeScript. Tipos auxiliares vivem em `src/types`.
- Adicione testes com Jest e Supertest dentro de `src/__tests__` (ou estrutura similar). Rode `npm test` para validar.
- Utilize `npm run build` antes de publicar ou implantar para garantir que o TypeScript transpile sem erros.

## Próximos passos sugeridos
- Adicionar testes de integração para rotas de autenticação e perfil.
- Configurar pipeline de CI para lint, build e testes automáticos.
- Documentar os endpoints com OpenAPI/Swagger para facilitar a integração com outros times.
