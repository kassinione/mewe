class AppError(Exception):
    status_code = 400
    message = "application error"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.message)
        self.message = message or self.message


class ValidationError(AppError):
    status_code = 400
    message = "invalid request"


class UnauthorizedError(AppError):
    status_code = 401
    message = "unauthorized"


class ForbiddenError(AppError):
    status_code = 403
    message = "forbidden"


class NotFoundError(AppError):
    status_code = 404
    message = "resource not found"


class ConflictError(AppError):
    status_code = 409
    message = "conflict error"
