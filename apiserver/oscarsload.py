import requests # http calls for poster images
import sys # append path for app import
import os # file path ops
import pandas as pd # csv loading and manipulation
from sqlalchemy import func  # sql functions for queries

# setup database path
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'movies.db')
print("Oscar loader writing to:", db_path)

# ensure app and models are loadable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, OscarAward, Actor, Category, YearCeremony, Movie

# tmdb config
TMDB_API_KEY = "10a99b3c00d4e3d999c458f1b76b87b2"
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

print("Starting Oscar data load.")
# read awards csv
df = pd.read_csv('oscardata/the_oscar_award.csv')
print(f"Loaded {len(df)} rows from CSV")

with app.app_context():
    db.create_all() # create tables if missing
    added_rows = 0
    skipped_rows = 0
    unmatched_titles = [] # titles with no movie match
    # iterate rows without autoflush
    with db.session.no_autoflush:
        for _, row in df.iterrows():
            try:
                # skip rows missing key field
                if pd.isna(row['film']) or pd.isna(row['name']):
                    skipped_rows += 1
                    continue
                # extract and normalise fields
                film_title = str(row['film']).strip()
                actor_name = str(row['name']).strip()
                category_name = str(row['category']).strip()
                year_film = int(row['year_film'])
                year_ceremony = int(row['year_ceremony'])
                is_winner = bool(row['winner'])
                # get or create actor
                actor = Actor.query.filter_by(name=actor_name).first()
                if not actor:
                    actor = Actor(name=actor_name)
                    db.session.add(actor)
                    db.session.flush()
                # get or create category
                category = Category.query.filter_by(name=category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db.session.add(category)
                    db.session.flush()
                # get or create ceremony year
                year = YearCeremony.query.filter_by(year=year_ceremony).first()
                if not year:
                    year = YearCeremony(year=year_ceremony)
                    db.session.add(year)
                    db.session.flush()
                # lookup existing movie by title
                movie = Movie.query.filter(func.lower(Movie.title) == film_title.lower()).first()
                if not movie:
                    unmatched_titles.append(film_title)
                # skip duplicate awards
                existing_award = OscarAward.query.join(Actor).join(Category).filter(
                    OscarAward.year_film == year_film,
                    func.lower(OscarAward.film) == film_title.lower(),
                    Actor.name == actor_name,
                    Category.name == category_name,
                    OscarAward.winner == is_winner
                ).first()
                # try fetching poster url from tmdb
                if existing_award:
                    print(f"Skipped existing award: {film_title} ({year_film}), {category_name}, winner: {is_winner}")
                    skipped_rows += 1
                    continue 

                poster_url = None
                try:
                    r = requests.get(TMDB_SEARCH_URL, params={
                        "api_key": TMDB_API_KEY,
                        "query": film_title,
                        "year": year_film
                    }).json()
                    results = r.get("results", [])
                    if results and results[0].get("poster_path"):
                        poster_url = IMAGE_BASE + results[0]["poster_path"]
                except Exception as e:
                    print(f"Poster fetch failed for {film_title}: {e}")
                # create award record
                award = OscarAward(
                    year_film=year_film,
                    year_ceremony=year_ceremony,
                    film=film_title,
                    winner=is_winner,
                    poster_url=poster_url,
                    actor=actor,
                    category=category,
                    year=year,
                    movie_id=movie.id if movie else None
                )
                db.session.add(award)
                added_rows += 1

            except Exception as e:
                print(f"Error processing {film_title}: {e}")
                db.session.rollback()
                skipped_rows += 1
                continue
    # commit and report
    try:
        db.session.commit()
        print(f"Done {added_rows} added, {skipped_rows} skipped.")
        if unmatched_titles:
            print(f"{len(unmatched_titles)} awards could not link to a movie:")
            for t in sorted(set(unmatched_titles))[:10]:
                print("   -", t)
            if len(unmatched_titles) > 10:
                print("   ...and more.")

            with open("unmatched_awards.txt", "w") as f:
                for title in sorted(set(unmatched_titles)):
                    f.write(f"{title}\n")
    except Exception as e:
        print(f"Final commit failed: {e}")
        db.session.rollback()
