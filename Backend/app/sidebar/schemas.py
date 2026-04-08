from pydantic import BaseModel
from typing import Optional


class SidebarSubItem(BaseModel):
    id: int
    title: str
    url: str
    disabled: Optional[bool] = False


class SidebarItem(BaseModel):
    id: int
    title: str
    url: Optional[str]
    icon: str
    subItem: Optional[list[SidebarSubItem]] = None


class SidebarResponse(BaseModel):
    items: list[SidebarItem]
    userOptions: SidebarItem
