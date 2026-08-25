# ACEX - FinEdu | Backend (Sprint S01)

Backend da plataforma FinEdu, desenvolvido a partir da análise do frontend
enviado (`ACEX_-_FinEdu.zip`). Esta é a entrega da **Sprint S01**: configuração
do projeto, modelagem do banco de dados, cadastro de usuário, login,
autenticação e logout.

## Stack utilizada

| Camada          | Tecnologia                                   |
|-----------------|-----------------------------------------------|
| Linguagem       | TypeScript                                    |
| Framework HTTP  | Express 4                                     |
| Banco de dados  | PostgreSQL                                    |
| ORM / Migrations| Prisma                                        |
| Autenticação    | JWT (assinado) + sessões persistidas no banco |
| Hash de senha   | bcryptjs                                      |
| Validação       | Zod                                           |

> **Por que sessão + JWT e não só JWT?** Um JWT puro é *stateless*: uma vez
> emitido, não existe forma de "cancelá-lo" antes de expirar. Para o logout
> (PB05) realmente invalidar o acesso, cada login cria um registro na tabela
> `sessions`. O token carrega o id dessa sessão (`sid`); o middleware de
> autenticação confere, a cada requisição, se a sessão ainda existe, não
> expirou e não foi revogada. O logout apenas marca `revokedAt`. Isso também
> prepara o terreno para funcionalidades futuras, como "sair de todos os
> dispositivos".

## Estrutura do projeto

```
backend/
├── prisma/
│   ├── schema.prisma      # Modelagem do banco (PB02)
│   └── seed.ts            # Dados de referência opcionais (cursos, conquistas)
├── src/
│   ├── config/            # Variáveis de ambiente e cliente Prisma
│   ├── controllers/       # Camada HTTP: recebe request, chama service, responde
│   ├── middlewares/       # Autenticação, tratamento de erros, rate limit, 404
│   ├── routes/            # Definição das rotas
│   ├── services/          # Regras de negócio
│   ├── utils/             # ApiError, ApiResponse, hashing, JWT, etc.
│   ├── validators/        # Schemas Zod (validação de entrada)
│   ├── app.ts             # Configuração do Express (middlewares + rotas)
│   └── server.ts          # Ponto de entrada (inicia o servidor HTTP)
├── .env.example
├── package.json
└── tsconfig.json
```

A separação `routes → controllers → services → repositório (Prisma)` mantém
cada camada com uma única responsabilidade e facilita adicionar as próximas
funcionalidades (cursos, metas, simulador, conquistas) sem reestruturar o
projeto.

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior (local ou em container)
- npm (ou pnpm/yarn, ajustando os comandos abaixo)

## Instalação e configuração

### 1. Instalar dependências

```bash
cd backend
npm install
```

O `postinstall` já executa `prisma generate` automaticamente.

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores para o seu ambiente:

```bash
cp .env.example .env
```

| Variável             | Descrição                                                        |
|----------------------|--------------------------------------------------------------------|
| `NODE_ENV`           | `development`, `test` ou `production`                             |
| `PORT`               | Porta HTTP do servidor (padrão `3333`)                            |
| `DATABASE_URL`       | String de conexão do PostgreSQL                                   |
| `JWT_SECRET`         | Segredo usado para assinar os tokens. **Troque em produção.**     |
| `JWT_EXPIRES_IN`     | Validade do token/sessão (ex: `1d`, `12h`, `30m`)                  |
| `BCRYPT_SALT_ROUNDS` | Custo do hash de senha (padrão `12`)                               |
| `CORS_ORIGIN`        | Origem(ns) permitida(s) do frontend, separadas por vírgula        |

Gere um `JWT_SECRET` seguro, por exemplo:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Subir um banco PostgreSQL (opcional, via Docker)

Se você não tiver um PostgreSQL disponível localmente:

```bash
docker run --name finedu-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=finedu -p 5432:5432 -d postgres:16
```

Isso é compatível com o `DATABASE_URL` de exemplo em `.env.example`.

### 4. Rodar as migrations

```bash
npm run prisma:migrate
```

Isso cria o banco (tabelas, chaves, índices e restrições) a partir de
`prisma/schema.prisma` e mantém um histórico versionado em
`prisma/migrations/`.

### 5. (Opcional) Popular dados de referência

```bash
npm run prisma:seed
```

Cria conquistas, os 6 cursos e o quiz de exemplo usados como mock no
frontend — útil para as próximas sprints, quando as rotas de conteúdo forem
implementadas. Não é necessário para testar o fluxo de autenticação.

### 6. Rodar o servidor em desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3333` (ou na porta definida em `PORT`)
com recarregamento automático.

### 7. Build e execução em produção

```bash
npm run build
npm run prisma:migrate:deploy   # aplica migrations pendentes em produção
npm start
```

## Testando o fluxo completo (critério de conclusão)

Com o servidor rodando, use Postman/Insomnia (ou `curl`) para validar:

**Cadastro → Login → Acesso autenticado → Logout**

```bash
# 1. Cadastro
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@email.com","age":24,"password":"Senha123","confirmPassword":"Senha123"}'

# 2. Login
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","password":"Senha123"}'
# -> copie o "accessToken" da resposta

# 3. Acesso autenticado
curl http://localhost:3333/api/v1/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 4. Logout
curl -X POST http://localhost:3333/api/v1/auth/logout \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 5. Confirma que o token foi invalidado (deve retornar 401)
curl http://localhost:3333/api/v1/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Veja `API.md` para a documentação completa de cada rota (parâmetros, body,
respostas de sucesso/erro e exemplos).

## Comandos úteis do Prisma

```bash
npm run prisma:studio    # interface visual para explorar o banco
npm run prisma:generate  # regenera o Prisma Client após alterar o schema
```

## Segurança

- Senhas nunca são armazenadas em texto puro (hash com bcrypt, custo
  configurável via `BCRYPT_SALT_ROUNDS`).
- Segredos e credenciais ficam apenas em variáveis de ambiente (`.env`,
  ignorado pelo git).
- Rotas de autenticação possuem rate limiting contra tentativas de força
  bruta.
- Mensagens de erro de login são propositalmente genéricas ("e-mail ou senha
  inválidos"), para não revelar se um e-mail está cadastrado.
- `helmet` aplica cabeçalhos HTTP de segurança padrão.

## Roadmap (próximas sprints)

O schema já modela `Course`, `Lesson`, `Material`, `QuizQuestion`/`QuizOption`,
`Goal`, `PatrimonyEntry` e `Achievement`, prontos para receber as rotas de:

- Conclusão de onboarding (salvar perfil de investidor do usuário);
- Listagem/detalhe de cursos e aulas;
- Envio de respostas de quiz e cálculo de XP;
- CRUD de metas financeiras;
- Conquistas e estatísticas de perfil.

Essas funcionalidades foram deliberadamente deixadas fora desta entrega para
manter o foco em PB01–PB05, conforme a prioridade definida na sprint.
