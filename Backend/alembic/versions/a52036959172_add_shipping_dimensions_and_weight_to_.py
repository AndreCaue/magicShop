"""add shipping dimensions and weight to products - SQLITE 100% FUNCIONA

Revision ID: a52036959172
Revises: 
Create Date: 2025-04-05 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a52036959172'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Só adiciona se a coluna NÃO existir (evita erro de duplicada)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('products')]

    if 'weight_grams' not in columns:
        op.add_column('products', sa.Column('weight_grams', sa.Integer(), nullable=False, server_default='500'))
    if 'height_cm' not in columns:
        op.add_column('products', sa.Column('height_cm', sa.Integer(), nullable=False, server_default='10'))
    if 'width_cm' not in columns:
        op.add_column('products', sa.Column('width_cm', sa.Integer(), nullable=False, server_default='15'))
    if 'length_cm' not in columns:
        op.add_column('products', sa.Column('length_cm', sa.Integer(), nullable=False, server_default='20'))


def downgrade():
    # Só remove se existir
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('products')]

    if 'length_cm' in columns:
        op.drop_column('products', 'length_cm')
    if 'width_cm' in columns:
        op.drop_column('products', 'width_cm')
    if 'height_cm' in columns:
        op.drop_column('products', 'height_cm')
    if 'weight_grams' in columns:
        op.drop_column('products', 'weight_grams')