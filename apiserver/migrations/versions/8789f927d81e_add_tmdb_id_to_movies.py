"""Add tmdb_id to movies



"""
from alembic import op
import sqlalchemy as sa


revision = '8789f927d81e'
down_revision = '7a68cd7ae174'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('movies', sa.Column('tmdb_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_movies_tmdb_id'), 'movies', ['tmdb_id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_movies_tmdb_id'), table_name='movies')
    op.drop_column('movies', 'tmdb_id')
