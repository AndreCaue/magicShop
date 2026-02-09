"""add efipay fields to orders

Revision ID: b42663cc52f8
Revises: 
Create Date: 2026-02-06 13:57:53.931873

"""
revision = 'b42663cc52f8'
down_revision = None          # ← se for a primeira migração, ou coloque o ID da migração anterior
branch_labels = None
depends_on = None

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column("orders", sa.Column(
        "efipay_charge_id", sa.String(), nullable=True))
    op.add_column("orders", sa.Column(
        "payment_status", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("paid_at", sa.DateTime(), nullable=True))
    op.create_index("ix_orders_efipay_charge_id",
                    "orders", ["efipay_charge_id"])


def downgrade():
    op.drop_index("ix_orders_efipay_charge_id", table_name="orders")
    op.drop_column("orders", "paid_at")
    op.drop_column("orders", "payment_status")
    op.drop_column("orders", "efipay_charge_id")