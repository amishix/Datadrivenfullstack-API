"""add reviews table

Revision ID: 7a68cd7ae174
Revises: 4195720bbf55
Create Date: 2025-05-22 16:42:37.132589

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a68cd7ae174'
down_revision = '4195720bbf55'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('film_id', sa.Integer, sa.ForeignKey('movies.id'), nullable=False),
        sa.Column('user_key', sa.String, nullable=False),
        sa.Column('rating', sa.Integer, nullable=False),
        sa.Column('comment', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now())
    )


def downgrade():
    op.drop_table('reviews')
