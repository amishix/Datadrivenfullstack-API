import os # access env vars
import re # regex for cleaning titles
import requests  # http requests for tmdb api
from sqlalchemy import func # sql functions for query
from app import app # flask app context
from models import db, Movie, OscarAward # database models

# tmdb configuration and api keys
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "10a99b3c00d4e3d999c458f1b76b87b2")
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
PUBLIC_NEWSAPI_KEY = "ee356e3d2dae4ae3acfc458831766716"
PUBLIC_YT_KEY = "AIzaSyBslOuNXWzU5UY2HyGhF5sbDWHc3HNeVCc"


def enrich_tmdb_ids():
    """populate missing tmdb metadata for oscar award films"""
    # run inside flask app context
    with app.app_context():
        # get distinct film titles
        titles = db.session.query(OscarAward.film).distinct().all()
        for (title,) in titles:
        # remove punctuation from title
            clean_title = re.sub(r"[^\w\s]", "", title)
            # check if movie already has metadata
            movie = Movie.query.filter(func.lower(Movie.title) == title.lower()).first()
            if movie and movie.tmdb_id and movie.release_date and movie.vote_average and movie.overview:
                    print(f"Skipping '{title}', already enriched with metadata")
                    continue
            # prepare tmdb search parameters
            params = {
                "api_key": TMDB_API_KEY,
                "query": clean_title,
                "language": "en-US",
                "include_adult": False
            }
            # call tmdb api
            try:
                response = requests.get(TMDB_SEARCH_URL, params=params, timeout=5)
                response.raise_for_status()
                results = response.json().get("results", [])
                if not results:
                    print(f"No TMDB result for '{title}'")
                    continue
                result = results[0]
                tmdb_id = result["id"]
            except Exception as e:
                print(f"Error fetching TMDB for '{title}': {e}")
                continue
            # create new movie record if needed
            if not movie:
                movie = Movie(title=title)
                db.session.add(movie)
            # update movie metadata
            movie.tmdb_id = tmdb_id
            movie.poster_url = IMAGE_BASE + result["poster_path"] if result.get("poster_path") else None
            movie.overview = result.get("overview")
            movie.release_date = result.get("release_date")
            movie.vote_average = result.get("vote_average")

            try:
                # save changes
                db.session.commit()
                print(f"Updated '{title}' with TMDB ID {tmdb_id}")
            except Exception as e:
                db.session.rollback()
                print(f"Failed to commit '{title}': {e}")

if __name__ == "__main__":
    # run enrichment script
    enrich_tmdb_ids()
    print(" Done enriching TMDB metadata.")
