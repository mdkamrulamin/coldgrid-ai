"""add cascade delete to telemetry device foreign key

Revision ID: d1067caaf30d
Revises: 93364c1b6c74
Create Date: 2026-06-23 12:04:29.282042

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1067caaf30d'
down_revision: Union[str, Sequence[str], None] = '93364c1b6c74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing foreign key that blocks device deletion.
    op.drop_constraint(
        "telemetry_device_id_fkey",
        "telemetry",
        type_="foreignkey",
    )
    
    # Recreate it with ON DELETE CASCADE.
    # Now when a device is deleted, its telemetry rows are deleted automatically.
    op.create_foreign_key(
        "telemetry_device_id_fkey",
        "telemetry",
        "devices",
        ["device_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    # Revert back to the old behavior without cascade delete.
    op.drop_constraint(
        "telemetry_device_id_fkey",
        "telemetry",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "telemetry_device_id_fkey",
        "telemetry",
        "devices",
        ["device_id"],
        ["id"],
    )
