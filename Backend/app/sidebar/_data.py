from .schemas import SidebarItem, SidebarSubItem, SidebarResponse

USER_ITEMS: list[SidebarItem] = [
    SidebarItem(
        id=1, title="Loja", url="/", icon="ShoppingCart",
        subItem=[
            SidebarSubItem(id=10, title="Baralhos",   url="/loja/baralhos"),
            SidebarSubItem(id=11, title="Acessórios",  url="/loja/acessorios"),
            SidebarSubItem(id=12, title="Trukes",      url="/loja/trukes"),
            SidebarSubItem(id=13, title="Marcas",      url="/loja/marcas"),
        ]
    ),
    SidebarItem(
        id=2, title="Conteúdo", url="/conteudo", icon="MonitorPlay",
        subItem=[
            SidebarSubItem(id=20, title="Vídeos", url="/conteudo/videos"),
            SidebarSubItem(id=21, title="E-Books", url="/conteudo/books"),
        ]
    ),
    SidebarItem(
        id=3, title="Jogos", url="/jogos", icon="GamepadDirectional",
        subItem=[
            SidebarSubItem(id=30, title="Jogos", url="/jogos"),
        ]
    ),
    SidebarItem(
        id=5, title="Settings", url="#", icon="Settings",
        subItem=[
            SidebarSubItem(id=50, title="Em desenvolvimento",
                           url="/", disabled=True),
        ]
    ),
]

MASTER_ITEMS: list[SidebarItem] = [
    SidebarItem(
        id=99, title="Cadastros", url="/", icon="Database",
        subItem=[
            SidebarSubItem(id=991, title="Produtos", url="/master"),
        ],
    ),
    SidebarItem(id=98, title="Pedidos", url="/", icon="ListOrdered",
                subItem=[
                    SidebarSubItem(
                        id=981, title="Gerar Etiqueta", url="/master/pedidos"),
                ],
                ),
]

USER_OPTIONS = SidebarItem(
    id=9, title="Username", url="/login", icon="User2",
    subItem=[
        SidebarSubItem(id=91, title="Logout",
                       url="/login"),
        SidebarSubItem(id=92, title="Pedidos",
                       url="/user/pedidos"),
        SidebarSubItem(id=93, title="User (em desenvolvimento)",
                       url="/user", disabled=True),
    ]
)


def get_sidebar_for_user(is_master: bool) -> SidebarResponse:
    items = MASTER_ITEMS if is_master else USER_ITEMS
    return SidebarResponse(items=items, userOptions=USER_OPTIONS)
