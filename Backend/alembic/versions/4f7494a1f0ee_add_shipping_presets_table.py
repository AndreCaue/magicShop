"""add shipping presets table with seed data"""

from alembic import op
import sqlalchemy as sa


revision = '20250408_presets'  # vai ser o nome do arquivo que o alembic gerou
down_revision = 'a52036959172'  # ou a migration anterior (pode deixar None se não souber)
branch_labels = None
depends_on = None


def upgrade():
    # Cria a tabela
    op.create_table('shipping_presets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('weight_grams', sa.Integer(), nullable=False),
        sa.Column('height_cm', sa.Integer(), nullable=False),
        sa.Column('width_cm', sa.Integer(), nullable=False),
        sa.Column('length_cm', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index('ix_shipping_presets_name', 'shipping_presets', ['name'])

    # SEED com os presets reais (baralhos 2025)
    presets_table = sa.table('shipping_presets',
        sa.column('name', sa.String),
        sa.column('weight_grams', sa.Integer),
        sa.column('height_cm', sa.Integer),
        sa.column('width_cm', sa.Integer),
        sa.column('length_cm', sa.Integer),
        sa.column('is_active', sa.Boolean),
    )

    op.bulk_insert(presets_table, [
        {"name": "Standard/Poker", "weight_grams": 105, "height_cm": 9, "width_cm": 6.5, "length_cm": 2, "is_active": True},
        {"name": "Bridge Size", "weight_grams": 100, "height_cm": 9, "width_cm": 6, "length_cm": 6.5, "is_active": True},
        {"name": "Mini / Pocket", "weight_grams": 60, "height_cm": 9, "width_cm": 6, "length_cm": 6.5, "is_active": True},
        {"name": "COPAG Plástico / Jumbo", "weight_grams": 100, "height_cm": 9, "width_cm": 6, "length_cm": 6.5, "is_active": True},
    ])


def downgrade():
    op.drop_table('shipping_presets')