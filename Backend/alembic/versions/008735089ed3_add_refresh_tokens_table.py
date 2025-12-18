"""add refresh_tokens table

Revision ID: seu_novo_id_aqui
Revises: 20250408_presets
Create Date: 2025-12-09 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'seu_novo_id_aqui'  # deixe o que o Alembic gerou
down_revision = '20250408_presets'  # ou a última migração válida
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('jti', sa.String(), nullable=False, index=True, unique=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("datetime('now')")),
        sa.PrimaryKeyConstraint('id')
    )
    # Índice adicional para consultas por user_id + revoked (opcional, mas útil)
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])


def downgrade():
    op.drop_index('ix_refresh_tokens_user_id', table_name='refresh_tokens')
    op.drop_table('refresh_tokens')