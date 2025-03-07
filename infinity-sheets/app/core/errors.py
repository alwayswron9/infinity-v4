from fastapi import status

class AppError(Exception):
    """Base class for application errors"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.detail = detail
        self.status_code = status_code
        super().__init__(self.detail)

class NotFoundError(AppError):
    """Raised when a resource is not found"""
    
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail, status.HTTP_404_NOT_FOUND)

class AuthenticationError(AppError):
    """Raised when authentication fails"""
    
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(detail, status.HTTP_401_UNAUTHORIZED)

class AuthorizationError(AppError):
    """Raised when a user is not authorized to access a resource"""
    
    def __init__(self, detail: str = "Not authorized to access this resource"):
        super().__init__(detail, status.HTTP_403_FORBIDDEN)

class ValidationError(AppError):
    """Raised when data validation fails"""
    
    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail, status.HTTP_422_UNPROCESSABLE_ENTITY)

class DatabaseError(AppError):
    """Raised when a database operation fails"""
    
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(detail, status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExternalServiceError(AppError):
    """Raised when an external service call fails"""
    
    def __init__(self, detail: str = "External service call failed"):
        super().__init__(detail, status.HTTP_503_SERVICE_UNAVAILABLE)
