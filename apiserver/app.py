import sys
import os
import sqlite3

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from models import db, Movie, Genre, MovieGenre, OscarAward, Actor, Category, YearCeremony, Review
from collections import defaultdict

# create flask app
app = Flask(__name__)
# sqlite db path
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'movies.db')
print("Using movies.db at:", db_path)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS config to allow frontend connection
CORS(app, supports_credentials=True, origins=["http://localhost:4321", "http://localhost:4322"])

# init db and migrations
db.init_app(app)
migrate = Migrate(app, db)

@app.route('/')
def index():
    """
    Root endpoint to check API status.
    
    Returns:
        JSON: Welcome message.
    """
    return jsonify({"message": "\ud83c\udfae Welcome to the CineVerse Movie API!"})

@app.route('/genres')
def get_genres():
    """
    Fetch all genres from the database.

    Returns:
        JSON list: Each genre with id and name.
    """
    genres = Genre.query.all()
    return jsonify([{"id": g.id, "name": g.name} for g in genres])

@app.route('/movies')
def get_movies():
    """
    Fetch all movies from the database.

    Returns:
        JSON list: Movies with id, title, overview, release date, poster URL, vote average, and Oscar winner status.
    """
    movies = Movie.query.all()
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "overview": m.overview,
        "release_date": m.release_date,
        "poster_url": m.poster_url,
        "vote_average": m.vote_average,
        "is_oscar_winner": m.is_oscar_winner
    } for m in movies])

# movie detail by id
@app.route('/movies/<int:movie_id>')
def get_movie(movie_id):
    """
    Get details of a specific movie by its ID.

    Args:
        movie_id (int): ID of the movie.

    Returns:
        JSON: Movie details or error message if not found.
    """
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    return jsonify({
        "id": movie.id,
        "title": movie.title,
        "overview": movie.overview,
        "release_date": movie.release_date,
        "poster_url": movie.poster_url,
        "vote_average": movie.vote_average,
        "is_oscar_winner": movie.is_oscar_winner
    })

# list oscar-winning movies
@app.route('/oscarwinners')
def get_oscar_winners():
    """
    Get all movies that have won an Oscar.

    Returns:
        JSON list: Oscar-winning movies.
    """
    winners = Movie.query.filter_by(is_oscar_winner=True).all()
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "poster_url": m.poster_url,
        "release_date": m.release_date
    } for m in winners])

@app.route('/genres/<int:genre_id>/movies')
def get_movies_by_genre(genre_id):
    """
    Get all movies for a given genre ID.

    Args:
        genre_id (int): ID of the genre.

    Returns:
        JSON list: Movies that belong to the genre.
    """
    movies = db.session.execute(
        db.select(Movie)
          .join(MovieGenre)
          .filter(MovieGenre.genre_id == genre_id)
    ).scalars().all()
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "poster_url": m.poster_url,
        "release_date": m.release_date,
        "vote_average": m.vote_average,
        "overview": m.overview
    } for m in movies])

@app.route('/baftawinners')
def get_bafta_winners():
    winners = Movie.query.filter(
        (Movie.is_bafta_winner == True) | (Movie.bafta_winner_year.isnot(None))
    ).all()

    return jsonify([{
        "id": m.id,
        "title": m.title,
        "poster_url": m.poster_url,
        "release_date": m.release_date,
        "bafta_winner_year": m.bafta_winner_year,
        "is_bafta_winner": m.is_bafta_winner,
        "vote_average": m.vote_average  # Include if you use ratings
    } for m in winners])

# oscars grouped by ceremony year
@app.route('/api/oscars_by_year')
def get_oscars_by_year():
    """
    Fetch every OscarAward in a single query (with joinedload),
    then group them by year_ceremony. Avoids per-award Movie lookups.
    """
    grouped = defaultdict(list)
    seen = set()

    awards = (
        OscarAward.query
            .options(
                joinedload(OscarAward.movie),     # load Movie via movie_id FK
                joinedload(OscarAward.actor),     # load Actor
                joinedload(OscarAward.category),  # load Category
            )
            .order_by(OscarAward.year_ceremony)
            .all()
    )

    for a in awards:
        year     = a.year_ceremony
        film     = a.film
        category = a.category.name if a.category else None

        key = (year, film, category)
        if key in seen:
            continue
        seen.add(key)

        movie = a.movie  # thanks to joinedload, this is already in memory

        payload = {
            "movie_id":   movie.id           if movie else None,
            "film":       film,
            "category":   category,
            "recipient":  a.actor.name       if a.actor else None,
            "poster_url": (movie.poster_url if (movie and movie.poster_url)
                           else a.poster_url),
            "year":       year,
            "winner":     a.winner
        }

        if payload["poster_url"] or payload["movie_id"] is not None:
            grouped[year].append(payload)

    return jsonify(grouped)

# top winners endpoint
@app.route('/api/top_winners')
def top_winners():
    results = db.session.execute(
        db.select(Actor.name, func.count(OscarAward.id))
          .join(OscarAward)
          .where(OscarAward.winner == True)
          .group_by(Actor.name)
          .order_by(func.count(OscarAward.id).desc())
          .limit(100)
    ).all()
    return jsonify([{"name": name, "wins": wins} for name, wins in results])

# wins vs nominations by year
@app.route('/api/oscars_vs_nominations')
def oscars_vs_nominations():
    results = db.session.execute(
        db.select(
            OscarAward.year_ceremony,
            db.func.sum(OscarAward.winner.cast(db.Integer)),
            db.func.count(OscarAward.id) - db.func.sum(OscarAward.winner.cast(db.Integer))
        ).group_by(OscarAward.year_ceremony)
          .order_by(OscarAward.year_ceremony)
    ).all()
    return jsonify([
        {"year": year, "wins": wins, "nominations": noms}
        for year, wins, noms in results
    ])

# most awarded films
@app.route('/api/most_awarded_films')
def most_awarded_films():
    try:
        results = db.session.execute(
            db.select(OscarAward.film, func.count())
              .where(OscarAward.winner == True)
              .group_by(OscarAward.film)
              .order_by(func.count().desc())
              .limit(20)
        ).all()

        response = []
        for film_title, win_count in results:
            award = OscarAward.query.filter_by(film=film_title, winner=True).first()
            movie = Movie.query.filter(func.lower(Movie.title) == film_title.lower()).first()
            tmdb_id = movie.tmdb_id if movie else None

            response.append({
                "id":            tmdb_id,
                "title":         film_title,
                "poster_url":    award.poster_url    if award else None,
                "release_date":  getattr(award, "release_date", None),
                "wins":          win_count
            })

        return jsonify(response)

    except Exception:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

# categories frequency
@app.route('/api/categories_frequency')
def categories_frequency():
    results = db.session.execute(
        db.select(Category.name, db.func.count(OscarAward.id))
          .join(OscarAward)
          .group_by(Category.name)
          .order_by(db.func.count(OscarAward.id).desc())
    ).all()
    return jsonify([
        {"category": category or "Unknown", "count": count}
        for category, count in results
    ])

# oscars by specific category with drill-down
@app.route('/api/oscars_by_category')
def oscars_by_category():
    category_name = request.args.get('category')
    limit         = int(request.args.get('limit', 10))

    awards = (
        OscarAward.query
          .filter(
            OscarAward.winner == True,
            OscarAward.category.has(name=category_name)
          )
          .order_by(OscarAward.year_ceremony.desc())
          .limit(limit * 5)
          .all()
    )

    grouped = defaultdict(lambda: {"film": None, "year": None, "recipients": []})
    for a in awards:
        key = (a.film, a.year_ceremony)
        grp = grouped[key]
        if grp["film"] is None:
            grp["film"] = a.film
            grp["year"] = a.year_ceremony
        grp["recipients"].append(a.actor.name if a.actor else "—")

    merged = sorted(
        grouped.values(),
        key=lambda g: g["year"],
        reverse=True
    )[:limit]

    return jsonify([
        {
          "film":        entry["film"],
          "year":        entry["year"],
          "recipients":  entry["recipients"],
          "recipient":   ", ".join(entry["recipients"])
        }
        for entry in merged
    ])

# film details endpoint
@app.route('/api/film_details')
def film_details():
    from sqlalchemy import func

    movie_id = request.args.get('movie_id', type=int)
    movie = None
    if movie_id is not None:
        movie = Movie.query.get(movie_id)

    if movie is None:
        title = request.args.get('title', '').strip()
        if title:
            movie = Movie.query.filter(func.lower(Movie.title) == title.lower()).first()
            if not movie:
                award = OscarAward.query.filter(OscarAward.film.ilike(f"%{title}%")).first()
                if award:
                    movie = Movie.query.filter(Movie.title.ilike(f"%{award.film}%")).first()

    if not movie:
        return jsonify({"error": "Movie not found"}), 404

    awards = OscarAward.query.filter_by(film=movie.title).all()

    return jsonify({
        "id": movie.id,
        "title": movie.title,
        "overview": movie.overview,
        "release_date": movie.release_date,
        "poster_url": movie.poster_url,
        "vote_average": movie.vote_average,
        "tmdb_id": movie.tmdb_id,
        "oscars": [
            {
                "id":       a.id,
                "category": a.category.name if a.category else None,
                "recipient":a.actor.name    if a.actor    else None,
                "year":     a.year_ceremony,
                "winner":   a.winner
            }
            for a in awards
        ]
    })

@app.route('/api/oscar_section/film/<int:movie_id>')
def get_oscar_section_film(movie_id):
    movie = Movie.query.get_or_404(movie_id)
    awards = OscarAward.query.filter_by(film=movie.title).all()
    return jsonify({
        "id": movie.id,
        "title": movie.title,
        "overview": movie.overview,
        "release_date": movie.release_date,
        "poster_url": movie.poster_url,
        "vote_average": movie.vote_average,
        "tmdb_id": movie.tmdb_id,
        "oscars": [
            {
                "id": a.id,
                "category": a.category.name if a.category else None,
                "recipient": a.actor.name if a.actor else None,
                "year": a.year_ceremony,
                "winner": a.winner
            }
            for a in awards
        ]
    })

# underrated treasures
@app.route('/api/underrated_treasures')
def underrated_treasures():
    subquery = db.session.query(OscarAward.film).distinct()
    treasures = Movie.query.filter(
        Movie.vote_average >= 8.0,
        ~Movie.title.in_(subquery)
    ).all()

    return jsonify([
        {
            "id": m.id,
            "title": m.title,
            "overview": m.overview,
            "poster_url": m.poster_url,
            "release_date": m.release_date,
            "vote_average": m.vote_average,
            "recommend_count": m.recommend_count
        }
        for m in treasures
    ])

# get reviews and average
@app.route('/api/reviews')
def get_reviews():
    film_id = request.args.get('film_id', type=int)
    if not film_id:
        return jsonify({"error":"film_id required"}), 400

    reviews = (
        Review.query
              .filter_by(film_id=film_id)
              .order_by(Review.created_at.desc())
              .all()
    )
    avg = (
        db.session.query(func.avg(Review.rating))
                  .filter(Review.film_id==film_id)
                  .scalar()
        or 0
    )

    return jsonify({
        "film_id": film_id,
        "average": round(avg, 2),
        "reviews": [
            {
                "id": r.id,
                "user_key": r.user_key,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat()
            } for r in reviews
        ]
    })

# post a review
@app.route('/api/reviews', methods=['POST'])
def post_review():
    data = request.get_json() or {}
    film_id  = data.get('film_id')
    user_key = data.get('user_key')
    rating   = data.get('rating')
    comment  = data.get('comment', '').strip()

    if not (film_id and user_key and rating):
        return jsonify({"error":"film_id, user_key, and rating are required"}), 400

    review = Review(
        film_id=film_id,
        user_key=user_key,
        rating=rating,
        comment=comment
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({
        "id": review.id,
        "film_id": film_id,
        "user_key": user_key,
        "rating": rating,
        "comment": comment,
        "created_at": review.created_at.isoformat()
    }), 201

# run server
if __name__ == '__main__':
    app.run(debug=True, port=5050)
