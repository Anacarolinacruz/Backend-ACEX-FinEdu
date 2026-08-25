# API - ACEX FinEdu (Sprint S01)

Base URL local: `http://localhost:3333/api/v1`

Todas as respostas seguem o mesmo envelope:

```json
// Sucesso
{
  "success": true,
  "message": "Descrição do resultado",
  "data": { }
}

// Erro
{
  "success": false,
  "message": "Descrição do erro",
  "errors": { }
}
```

`errors` aparece apenas quando há detalhes adicionais (ex: campos inválidos
de validação) e seu formato varia conforme a origem do erro.

---

## GET /health

**Objetivo:** verificar se a API está no ar. Útil para health checks.

- **Autenticação:** não requer
- **Parâmetros:** nenhum
- **Body:** nenhum

**Resposta de sucesso — `200 OK`**
```json
{
  "success": true,
  "message": "API FinEdu operacional",
  "timestamp": "2026-08-24T12:00:00.000Z"
}
```

---

## POST /auth/register

**Objetivo:** cadastrar um novo usuário (PB03). Corresponde aos campos da
tela `SignupScreen.tsx` do frontend. Após o cadastro, o usuário já recebe um
token de acesso — o frontend leva o usuário direto para o onboarding, sem
passar pela tela de login novamente.

- **Autenticação:** não requer
- **Rate limit:** 20 requisições / 15 minutos por IP

### Body esperado (`application/json`)

| Campo             | Tipo   | Obrigatório | Regras                                                        |
|-------------------|--------|:-----------:|-----------------------------------------------------------------|
| `name`            | string | sim         | 2 a 100 caracteres                                              |
| `email`           | string | sim         | formato de e-mail válido, único no sistema                     |
| `age`             | number | sim         | inteiro entre 13 e 120                                          |
| `password`        | string | sim         | mín. 8 caracteres, com 1 minúscula, 1 maiúscula e 1 número      |
| `confirmPassword` | string | sim         | deve ser idêntico a `password`                                 |

### Exemplo de requisição

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "age": 24,
  "password": "Senha123",
  "confirmPassword": "Senha123"
}
```

### Resposta de sucesso — `201 Created`

```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "user": {
      "id": "clv2x9f8h0000abc123def456",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "age": 24,
      "investorProfile": null,
      "xp": 0,
      "level": 1,
      "streak": 0,
      "onboardingCompletedAt": null,
      "createdAt": "2026-08-24T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-08-25T12:00:00.000Z"
  }
}
```

### Respostas de erro

| Status | Situação                                   |
|-------:|----------------------------------------------|
| `400`  | Campo obrigatório ausente ou inválido (`errors` traz o detalhe por campo) |
| `409`  | E-mail já cadastrado                         |
| `429`  | Muitas tentativas em pouco tempo             |
| `500`  | Erro inesperado / falha de banco de dados    |

```json
// 400 — exemplo de campo inválido
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "password": ["A senha deve conter ao menos um número"],
    "confirmPassword": ["As senhas não coincidem"]
  }
}
```

```json
// 409 — e-mail já cadastrado
{
  "success": false,
  "message": "Este e-mail já está cadastrado"
}
```

---

## POST /auth/login

**Objetivo:** autenticar um usuário existente (PB04). Corresponde aos campos
da tela `LoginScreen.tsx`.

- **Autenticação:** não requer
- **Rate limit:** 20 requisições / 15 minutos por IP

### Body esperado

| Campo      | Tipo   | Obrigatório | Regras              |
|------------|--------|:-----------:|----------------------|
| `email`    | string | sim         | formato de e-mail    |
| `password` | string | sim         | não pode ser vazio   |

### Exemplo de requisição

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "maria@email.com",
  "password": "Senha123"
}
```

### Resposta de sucesso — `200 OK`

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "clv2x9f8h0000abc123def456",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "age": 24,
      "investorProfile": null,
      "xp": 0,
      "level": 1,
      "streak": 0,
      "onboardingCompletedAt": null,
      "createdAt": "2026-08-24T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-08-25T12:00:00.000Z"
  }
}
```

O `accessToken` deve ser enviado nas próximas requisições autenticadas no
cabeçalho:

```
Authorization: Bearer <accessToken>
```

### Respostas de erro

| Status | Situação                                             |
|-------:|--------------------------------------------------------|
| `400`  | Campo obrigatório ausente ou e-mail em formato inválido |
| `401`  | E-mail não cadastrado ou senha incorreta (mensagem genérica, propositalmente) |
| `429`  | Muitas tentativas em pouco tempo                        |

```json
// 401
{
  "success": false,
  "message": "E-mail ou senha inválidos"
}
```

---

## GET /auth/me

**Objetivo:** retornar os dados do usuário autenticado. Usado para validar a
etapa de "acesso autenticado" do critério de conclusão e para o frontend
carregar `userData` (usado em `DashboardScreen`, `ProfileScreen`, etc.).

- **Autenticação:** obrigatória (`Authorization: Bearer <accessToken>`)

### Exemplo de requisição

```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Resposta de sucesso — `200 OK`

```json
{
  "success": true,
  "message": "Usuário autenticado",
  "data": {
    "user": {
      "id": "clv2x9f8h0000abc123def456",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "age": 24,
      "investorProfile": null,
      "xp": 0,
      "level": 1,
      "streak": 0,
      "onboardingCompletedAt": null,
      "createdAt": "2026-08-24T12:00:00.000Z"
    }
  }
}
```

### Respostas de erro

| Status | Situação                                                        |
|-------:|--------------------------------------------------------------------|
| `401`  | Token ausente, inválido, expirado, ou sessão encerrada (logout)   |

```json
// 401 — sem token
{
  "success": false,
  "message": "Token de autenticação não informado"
}
```

```json
// 401 — sessão encerrada (após logout)
{
  "success": false,
  "message": "Sessão encerrada. Faça login novamente."
}
```

---

## POST /auth/logout

**Objetivo:** encerrar a sessão atual (PB05), revogando o token utilizado.
Qualquer nova requisição autenticada com esse mesmo token passará a retornar
`401`.

- **Autenticação:** obrigatória (`Authorization: Bearer <accessToken>`)

### Exemplo de requisição

```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Resposta de sucesso — `200 OK`

```json
{
  "success": true,
  "message": "Logout realizado com sucesso",
  "data": null
}
```

### Respostas de erro

| Status | Situação                                        |
|-------:|----------------------------------------------------|
| `401`  | Token ausente, inválido, expirado ou já revogado   |

---

## Convenções gerais de erro

| Status | Quando ocorre                                                         |
|-------:|--------------------------------------------------------------------------|
| `400`  | Corpo da requisição não passou na validação (Zod)                       |
| `401`  | Falha de autenticação/autorização                                       |
| `404`  | Rota ou recurso inexistente                                              |
| `409`  | Conflito (ex: e-mail já cadastrado)                                     |
| `429`  | Limite de requisições excedido                                          |
| `500`  | Erro inesperado no servidor                                              |

Em ambiente de desenvolvimento (`NODE_ENV=development`), respostas `500`
incluem um campo `stack` adicional para facilitar a depuração; em produção
esse campo não é exposto.
