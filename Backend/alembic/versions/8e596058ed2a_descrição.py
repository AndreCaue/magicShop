
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8e596058ed2a'
down_revision: Union[str, Sequence[str], None] = 'seu_novo_id_aqui'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
