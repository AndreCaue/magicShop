"""descrição

Revision ID: 8e596058ed2a
Revises: seu_novo_id_aqui
Create Date: 2025-12-11 17:57:50.257511

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e596058ed2a'
down_revision: Union[str, Sequence[str], None] = 'seu_novo_id_aqui'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
