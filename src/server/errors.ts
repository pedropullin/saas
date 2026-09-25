/** Erros de domínio que viram mensagens para o usuário. */
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "erro",
  ) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sua sessão expirou. Entre novamente.") {
    super(message, 401, "nao_autenticado");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Você não tem permissão para isso.") {
    super(message, 403, "sem_permissao");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Não encontrado.") {
    super(message, 404, "nao_encontrado");
  }
}

export class PlanLimitError extends AppError {
  constructor(message: string) {
    super(message, 402, "limite_do_plano");
  }
}

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string; code?: string };
