export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Requisição inválida', details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Não autorizado'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acesso negado'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso não encontrado'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflito de dados', details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  static internal(message = 'Erro interno do servidor'): ApiError {
    return new ApiError(500, message);
  }
}
