from .auth import router as auth_router
from .opportunities import router as opportunities_router
from .applications import router as applications_router
from .digest import router as digest_router
from .profile import router as profile_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "opportunities_router",
    "applications_router",
    "digest_router",
    "profile_router",
    "admin_router",
]
