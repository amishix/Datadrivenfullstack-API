import sqlite3
import requests
import time

API_KEY = '10a99b3c00d4e3d999c458f1b76b87b2'
conn = sqlite3.connect('movies.db')
cursor = conn.cursor()

search_url = 'https://api.themoviedb.org/3/search/movie'
image_base_url = 'https://image.tmdb.org/t/p/w500'


# --- BAFTA WINNERS ---

bafta_winners = [
    ('The Fallen Idol',1949),
    ('The Third Man',1950),
    ('All About Eve',1951),
    ('The Lavender Hill Mob',1952),
    ('The Sound Barrier',1953),
    ('Jeux Interdits',1954),
    ('The Wages of Fear',1955),
    ('Richard III',1956),
    ('Gervaise',1957),
    ('The Bridge on the River Kwai',1958),
    ('Room at the Top',1959),
    ('Ben-Hur',1960),
    ('The Apartment',1961),
    ('Ballad of a Soldier',1962),
    ('Lawrence of Arabia',1963),
    ('Tom Jones',1964),
    ('Dr Strangelove',1965),
    ('My Fair Lady',1966),
    ('Who''s Afraid of Virginia Woolf?',1967),
    ('A Man for All Seasons',1968),
    ('The Graduate',1969),
    ('Midnight Cowboy',1970),
    ('Buth Cassidy and the Sundance Kid',1971),
    ('Sunday Bloody Sunday',1972),
    ('Cabaret',1973),
    ('Day for Night',1974),
    ('Lacombe, Lucien',1975),
    ('Alice Doesn''t Live Here Anymore',1976),
    ('One Flew Over the Cuckoo''s Nest',1977),
    ('Annie Hall',1978),
    ('Julia',1979),
    ('Manhattan',1980),
    ('The Elephant Man',1981),
    ('Chariots of Fire',1982),
    ('Gandhi',1983),
    ('Educating Rita',1984),
    ('The Killing Fields',1985),
    ('The Purple Rose of Cairo',1986),
    ('A Room with a View',1987),
    ('Jean de Florette',1988),
    ('The Last Emperor',1989),
    ('Dead Poets Society', 1990),
    ('Goodfellas', 1991),
    ('The Commitments', 1992),
    ('Howards End', 1993),
    ('Schindler\'s List', 1994),
    ('Four Weddings and a Funeral', 1995),
    ('Sense and Sensibility', 1996),
    ('The English Patient', 1997),
    ('The Full Monty', 1998),
    ('Shakespeare in Love', 1999),
    ('American Beauty', 2000),
    ('Gladiator', 2001),
    ('The Lord of the Rings: The Fellowship of the Ring', 2002),
    ('The Pianist', 2003),
    ('The Lord of the Rings: The Return of the King', 2004),
    ('The Aviator', 2005),
    ('Brokeback Mountain', 2006),
    ('The Queen', 2007),
    ('Atonement', 2008),
    ('Slumdog Millionaire', 2009),
    ('The Hurt Locker', 2010),
    ('The King\'s Speech', 2011),
    ('The Artist', 2012),
    ('Argo', 2013),
    ('12 Years a Slave', 2014),
    ('Boyhood', 2015),
    ('The Revenant', 2016),
    ('La La Land', 2017),
    ('Three Billboards Outside Ebbing, Missouri', 2018),
    ('Roma', 2019),
    ('1917', 2020),
    ('Nomadland', 2021),
    ('The Power of the Dog', 2022),
    ('All Quiet on the Western Front', 2023),
    ('Oppenheimer', 2024),
    ('Conclave', 2025)
]


for title, year in bafta_winners:
    params = {'api_key': API_KEY, 'query': title}
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        results = response.json().get('results', [])
        if results:
            movie = next((m for m in results if str(year - 1) in m.get('release_date', '')), results[0])
            overview = movie.get('overview', '')
            release_date = movie.get('release_date', f'{year}-01-01')
            poster_path = movie.get('poster_path', '')
            poster_url = f"{image_base_url}{poster_path}" if poster_path else None
            vote_average = movie.get('vote_average', 0)

            cursor.execute("""
                INSERT INTO movies (
                    title, overview, release_date, poster_url, vote_average,
                    is_bafta_winner, bafta_winner_year
                ) VALUES (?, ?, ?, ?, ?, 1, ?)
            """, (title, overview, release_date, poster_url, vote_average, year))

            print(f"🏆 Inserted winner: {title} ({year})")
        else:
            print(f"⚠️ No TMDb results for winner: {title} ({year})")
    except Exception as e:
        print(f"❌ Error for winner {title} ({year}): {e}")
    time.sleep(0.25)


# BAFTA nominees from 1949 to 2025 (excluding winners)
bafta_nominees = {1949: ['Hamelt', 'Oliver Twist', 'Once a Jolly Swagman', 'The Red Shoes', 'The Small Voice'], 1950: ['The Ballad of Berlin', 'The Last Stage', 'The Set-up', 'The Third Man', 'The Treasure of Sierra Madre'], 1951: ['The Asphalt', 'Intruder in the Dust', 'The Men', 'On the Town', 'Orphee'], 1952: ['An American in Paris', 'The Browing Version', 'Detective Story', 'Fourteen Hours', 'Froken Julie'], 1953: ['The African Queen', 'Angels One Five', 'The Boy Kumasenu', 'Death of a Salesman', 'Limelight'], 1954: ['The Bad and the Beautiful', 'Come back, Little Sheba', 'The Cruel Sea', 'From Here to Eternity', 'Genevieve'], 1955: ['The Caine Mutiny', 'Carrington V.C', 'The Divided Heart', 'Doctor in the House', 'Executive Suite'], 1956: ['Bad Day at Black Rock', 'Carmen Jones', 'The Colditz Story', 'The Dam Busters', 'East of Eden'], 1957: ['Baby Doll', 'The Battle of the River Plate', 'Shadow', 'The Unfrocked One', 'Guys and Dolls'], 1958: ['12 Angry Men', 'The Bachelor Party', 'Edge of the City', 'Shiralee', 'The Tin Star'], 1959: ['Aparajito', 'Cat on a Hot Tin Roof', 'The Cranes Are Flying', 'The Defiant Ones', 'Ice Cold in Alex'], 1960: ['Anatomy of a Murder', 'Ansiket', 'The Big Country', 'Compulsion', 'Gigi'], 1961: ['The Angry Silence', 'Inherit the Wind', 'Elmer Gantry', 'Shadows', 'Spartacus'], 1962: ['Apur Sansar', 'The Hole', 'The Innocents', 'Judgement at Nuremberg', 'A Taste of Honey'], 1963: ['Billy Budd', 'A Kind of Loving', 'West Side Story', 'The Miracle Worker', 'The Manchurian Candidate'], 1964: ['Billy Liar', 'David and Lisa', 'Hud', 'Days of Wine and Roses', 'The Servant'], 1965: ['Becket', 'The Pumpkin Eater', 'The Train', 'The Chalk Garden', 'Guns at Batasi'], 1966: ['The Hill', 'Darling', 'Zorba the Greek', 'Cat Ballou', 'Lord Jim'], 1967: ['Doctor Zhivago', 'Morgan', 'The Spy Who Came In from the Cold', 'Alfie', 'The Blue Max'], 1968: ['The Deadly Affair', 'Accident', 'In the Heat of the Night', 'Blowup', 'Bonnie and Clyde'],1969: ['The Lion in Winter', 'Oliver!', 'The Charge of the Light Brigade', 'The Bofors Gun', '2001: A Space Odessey'], 1970: ['Women in Love', 'Bullitt', 'Funny Girl', 'Isadora', 'John and Mary'], 1970: ['Patton', 'Ryan''s Daughter', 'Kes', 'MASH', 'The Railway Children'], 1972: ['The Go-Between', 'Gumshoe', 'Death in Venice', 'Taking Off', 'Little Big Man'], 1973: ['Lady Caroline Lamb', 'The French Connection', 'The Last Picture Show', 'Young Winston', 'The Godfather'], 1974: ['The Day of the Jackal', 'The Discreet Charm of the Bourgeoisie', 'Don''t Look Now', 'Sleuth', 'The Hireling'], 1975: ['Chinatown', 'The Last Detail', 'Murder on the Orient', 'The Conversation', 'The Three Musketeers'], 1976: ['Barry Lyndon', 'Dog Day Afternoon', 'Jaws', 'Nashville', 'Rollerball'], 1977: ['Bugsy Malone', 'Taxi Driver', 'The Slipper and the Rose', 'Picnic at Hanging Rock', 'Marathon Man'], 1978: ['A Bridge Too Far', 'Network', 'Rocky', 'Equus', 'Valentino'], 1979: ['Close Encounters of the Third Kind', 'Midnight Express', 'Star Wars', 'Superman', 'Death on the Nile'], 1980: ['Apocalypse Now', 'The China Syndrome', 'The Deer Hunter', 'Alien', 'Yanks'], 1981: ['Being There', 'Kagemusha', 'Fame', 'Flash Gordon', 'All That Jazz'], 1982: ['Atlantic City', 'The French Lieutenant''s Woman', 'Raider of the Lost Ark', 'Raging Bull', 'Tess'], 1983: ['Missing', 'On Golden Pond', 'Blade Runner', 'Reds', 'E.T the Extra-Terrestrial'], 1984: ['Heat and Dust', 'Local Hero', 'Tootsie', 'Zelig', 'The King of Comedy'], 1985: ['The Dresser', 'Paris, Texas', 'A Private Function', 'The Comapny of Wolves', 'Carmen'], 1986: ['A Chorus Line', 'Back to the Future', 'A Passage to India', 'Witness', 'The Emerald Forest'], 1987: ['Hannah and Her Sisters', 'The Mission', 'Mona Lisa', 'Out of Africa', 'Ran'], 1988: ['Cry Freedom', 'Hope and Glory', 'Radio Days', 'The Untouchables', 'Platoon'], 1989: ['Babette''s Feast', 'A Fish Called Wanda', 'Empire of the Sun', 'Moonstruck', 'Beetlejuice'], 1990: ['Shirley Valentine', 'My Left Foot', 'Born on the Fourth of July', 'Batman', 'Henry V'], 1991: ['Crimes and Misdemeanors', 'Driving Miss Daisy', 'The Godfather Part III', "Miller's Crossing", 'Pretty Woman'], 1992: ['Dance with the Wolves', 'The Silence of the Lambs', 'Thelma & Louise', 'JFK', 'Bugsy'], 1993: ['The Last of the Mohicans', 'The Crying Game', 'The Player', 'Strictly Ballroom', 'Unforgiven'], 1994: ['The Piano', 'The Remains of the Day', 'Shadowlands','The Age of Innocence','The Fugitive'], 1995: ['Interview with the Vampire', 'Pulp Fiction', 'Forrest Gump', 'Quiz Show', 'The Shawshank Redemption'], 1996: ['Apollo 13', 'Braveheart', 'Babe', 'The Usual Suspects', 'The Madness of King George'], 1997: ['Evita', 'Secrets & Lies', 'Fargo', 'Shine', 'Jerry Maguire'], 1998: ['Mrs Brown', 'Titanic', 'Good Will Hunting', 'Boogie Nights', 'L.A. Confidential'], 1999: ['Little Voice', 'Saving Private Ryan', 'Elizabeth', 'The Truman Show', 'Life is Beautiful'], 2000: ['The End of the Affair', 'The Insider', 'The Sixth Sense', 'The Talented Mr. Ripley', 'Being John Malkovich'], 2001: ['Billy Elliot', 'Chocolat', 'Crouching Tiger, Hidden Dragon', 'Erin Brockovich', 'Traffic'], 2002: ['A Beautiful Mind', 'Gosford Park', 'Moulin Rouge!', "The Man Who Wasn't There", 'Amélie'], 2003: ['Chicago', 'Gangs of New York', 'The Hours', 'The Lord of the Rings: The Two Towers', 'Road to Perdition'], 2004: ['Cold Mountain', 'Lost in Translation', 'Master and Commander', 'Big Fish', 'Girl with a Pearl Earring'], 2005: ['House of Flying Daggers', 'Vera Drake', 'Finding Neverland', 'The Motorcycle Diaries', 'Harry Potter and the Prisoner of Azkaban'], 2006: ['Memoirs of a Geisha', 'Crash', 'Charlie and the Chocolate Factory', 'Good Night, and Good Luck', 'Pride and Prejudice'], 2007: ['Casino Royale', 'Babel', 'United 93', 'The Departed', 'The Devil Wears Prada'], 2008: ['La Vie en Rose', 'There Will Be Blood', 'American Gangster', 'The Bourne Ultimatum', 'The Lives of Others'], 2009: ['Revolutionary Road', 'The Dark Knight', 'The Curious Case of Benjamin Button', 'The Reader', 'Milk'], 2010: ['Avatar', 'An Education', 'Up in the Air', 'District 9', 'Precious'], 2011: ['Black Swan', 'Inception', 'The Social Network', 'True Grit', '127 Hours'], 2012: ['The Descendants', 'Drive', 'The Help', 'Tinker Tailor Soldier Spy', 'War Horse'], 2013: ['Les Misérables', 'Life of Pi', 'Lincoln', 'Zero Dark Thirty', 'Skyfall'], 2014: ['American Hustle', 'Captain Phillips', 'Gravity', 'Philomena', 'Behind the Candelabra'], 2015: ['Birdman', 'The Grand Budapest Hotel', 'The Imitation Game', 'The Theory of Everything', 'Whiplash'], 2016: ['Bridge of Spies', 'Carol', 'The Big Short', 'Spotlight', 'Brooklyn'], 2017: ['Arrival', 'I, Daniel Blake', 'Manchester by the Sea', 'Moonlight', 'Hacksaw Ridge'], 2018: ['Call Me by Your Name', 'Darkest Hour', 'Dunkirk', 'The Shape of Water', 'Phantom Thread'], 2019: ['BlacKkKlansman', 'Green Book', 'Cold War', 'A Star Is Born', 'The Favourite'], 2020: ['The Irishman', 'Joker', 'Once Upon a Time in Hollywood', 'Little Women', 'Jojo Rabbit'], 2021: ['The Father', 'The Mauritanian', 'Promising Young Woman', 'The Trial of the Chicago 7', 'Rocks'], 2022: ['Belfast', "Don't Look Up", 'Dune', 'Licorice Pizza', 'West Side Story'], 2023: ['The Banshees of Inisherin', 'Elvis', 'Everything Everywhere All At Once', 'Tár', 'Top Gun: Maverick'], 2024: ['Anatomy of a Fall', 'The Holdovers', 'Killers of the Flower Moon', 'Poor Things', 'Rye Lane'], 2025: ['Anora', 'The Brutalist', 'A Complete Unknown', 'Emilia Pérez', 'The Seed of the Sacred Fig']}

for year, titles in bafta_nominees.items():
    for title in titles:
        params = {'api_key': API_KEY, 'query': title}
        try:
            response = requests.get(search_url, params=params)
            response.raise_for_status()
            results = response.json().get('results', [])
            if results:
                movie = next((m for m in results if str(year - 1) in m.get('release_date', '')), results[0])
                overview = movie.get('overview', '')
                release_date = movie.get('release_date', f'{year}-01-01')
                poster_path = movie.get('poster_path', '')
                poster_url = f"{image_base_url}{poster_path}" if poster_path else None
                vote_average = movie.get('vote_average', 0)

                cursor.execute("""
                    INSERT INTO movies (
                        title, overview, release_date, poster_url, vote_average,
                        is_bafta_winner, bafta_winner_year
                    ) VALUES (?, ?, ?, ?, ?, 0, ?)
                """, (title, overview, release_date, poster_url, vote_average, year))

                print(f"✅ Inserted nominee: {title} ({year})")
            else:
                print(f"⚠️ No TMDb results for nominee: {title} ({year})")
        except Exception as e:
            print(f"❌ Error for nominee {title} ({year}): {e}")
        time.sleep(0.25)

conn.commit()
conn.close()
print("🎉 All BAFTA nominees (1949–2025) have been inserted into movies.db.")