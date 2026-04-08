from fastapi import APIRouter, Depends
from .schemas import SidebarResponse
from ._data import get_sidebar_for_user
from app.models import User
from app.auth.dependencies import get_current_user
from fastapi.security import SecurityScopes

router = APIRouter(prefix="/sidebar", tags=["Sidebar"])


@router.get("", response_model=SidebarResponse)
def get_sidebar(
    current_user: User = Depends(get_current_user)
) -> SidebarResponse:
    return get_sidebar_for_user(is_master=current_user.is_master)
