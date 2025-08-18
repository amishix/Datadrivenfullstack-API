from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialise SQLAlchemy
db = SQLAlchemy()

class Genre(db.Model):
    __tablename__ = 'genres'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

    movies = db.relationship(
        'Movie',
        secondary='movie_genres',
        back_populates='genres'
    )

# main movies table with metadata and flags
class Movie(db.Model):
    __tablename__ = 'movies'
    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.Integer, unique=True, index=True, nullable=True)
    title = db.Column(db.String, nullable=False)
    overview = db.Column(db.Text)
    release_date = db.Column(db.String)
    poster_url = db.Column(db.String)
    vote_average = db.Column(db.Float)
    is_oscar_winner = db.Column(db.Boolean, default=False)
    is_bafta_winner = db.Column(db.Boolean, default=False)
    recommend_count = db.Column(db.Integer, default=0)

    bafta_winner_year = db.Column(db.Integer)

    genres = db.relationship(
        'Genre',
        secondary='movie_genres',
        back_populates='movies'
    )
    # reviews made by users
    reviews = db.relationship(
        'Review',
        back_populates='film',
        cascade='all, delete-orphan'
    )

class MovieGenre(db.Model):
    __tablename__ = 'movie_genres'
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), primary_key=True)
    genre_id = db.Column(db.Integer, db.ForeignKey('genres.id'), primary_key=True)

class Actor(db.Model):
    __tablename__ = 'actors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=True)
    # oscar awards by this actor
    awards = db.relationship('OscarAward', back_populates='actor')

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=True)
    # oscar awards in this category
    awards = db.relationship('OscarAward', back_populates='category')

# ceremony years table
class YearCeremony(db.Model):
    __tablename__ = 'years'
    year = db.Column(db.Integer, primary_key=True)
    # awards given this year
    awards = db.relationship('OscarAward', back_populates='year')

# oscar awards table linking film, actor, category, year
class OscarAward(db.Model):
    __tablename__ = 'oscar_awards'

    id = db.Column(db.Integer, primary_key=True)
    year_film = db.Column(db.Integer) # film release year
    film = db.Column(db.String, nullable=False)  # film title
    poster_url = db.Column(db.String) # poster image url
    winner = db.Column(db.Boolean, default=True)  # win status

    actor_id = db.Column(db.Integer, db.ForeignKey('actors.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    year_ceremony = db.Column(db.Integer, db.ForeignKey('years.year'))
    movie_id = db.Column(
        db.Integer, 
        db.ForeignKey('movies.id', name='fk_oscar_awards_movie_id_movies')
    )
    # relationships to parent models
    actor = db.relationship('Actor', back_populates='awards')
    category = db.relationship('Category', back_populates='awards')
    year = db.relationship('YearCeremony', back_populates='awards')
    movie = db.relationship('Movie', backref='oscar_awards')  

    # serialise for api
    def serialize(self):
        return {
            'id': self.id,
            'film': self.film,
            'poster_url': self.poster_url,
            'recipient': self.actor.name if self.actor else None,
            'category': self.category.name if self.category else None,
            'year_film': self.year_film,
            'movie_id': self.movie_id  
        }
# user reviews table linked to movies
class Review(db.Model):
    __tablename__ = 'reviews'
    id         = db.Column(db.Integer, primary_key=True)
    film_id    = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    user_key   = db.Column(db.String, nullable=False)
    rating     = db.Column(db.Integer, nullable=False)
    comment    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship back to movie
    film = db.relationship('Movie', back_populates='reviews')
