/**
 * Tratamento de erro central da fundação.
 *
 * Todo módulo lança erros tipados a partir daqui, para que a camada de entrada
 * (rotas/API) mapeie erro → resposta HTTP de forma uniforme.
 */

export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    httpStatus = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado", details?: Record<string, unknown>) {
    super("not_found", message, 404, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Dados inválidos", details?: Record<string, unknown>) {
    super("validation_error", message, 400, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado", details?: Record<string, unknown>) {
    super("forbidden", message, 403, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado", details?: Record<string, unknown>) {
    super("unauthorized", message, 401, details);
  }
}

export function toErrorResponse(err: unknown): {
  code: string;
  message: string;
  httpStatus: number;
  details?: Record<string, unknown>;
} {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      httpStatus: err.httpStatus,
      details: err.details,
    };
  }
  return { code: "internal_error", message: "Erro interno", httpStatus: 500 };
}
