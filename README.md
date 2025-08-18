# 🎬 Cineverse – A Movie Awards API & Viewer
Cineverse is a full-stack web application that showcases award-winning films through an interactive movie API and dynamic user interface. It includes BAFTA and Oscar award data, Underrated Treasures (films), Bond film history, and TMDb-sourced content. Users can explore winners and nominees across decades and visualise data through bar graphs, pie charts and mappings.

## 📁 Project Structure

```bash
API/
│
├── apiserver/ # Flask back-end API server with SQLite database, models and routes
├── frontend/ # Front-end application (React/Astro components)
├── transcripts/  # Supporting research and markdown notes
├── .gitignore  # Ignores venv, node_modules, .env, etc.
├── README.md  # Project overview, setup guide, and documentation
```

## 🔧 Requirements

Backend – Flask API
- Python
- SQLAlchemy
- Flask
- Flask-CORS
- Flask-SQLAlchemy
- Flask-Migrate
- SQLite3
- pip
- pandas
- requests

Frontend – React and Astro
- Node.js 
- npm 
- React
- Astro
- Axios
- react-router-dom
- chart.js

## 🚀 How to Run the Project

### 1. Download ZIP and open on VS code

### 2. Set up API Server
```bash
python3.11 -m venv .venv # compatible with requirements.txt 
source .venv/bin/activate # Activate the virtual environment
pip install -r requirements.txt # Install required packages
# Start the API server
cd apiserver
python3 app.py
```
### 3. In a new terminal, set up front-end viewer
```bash
cd frontend
npm install # install node dependencies t
npm install react-router-dom
npm run dev # Start the react/astro server
```
- Runs at local host: http://localhost:4321/

## 🧠 Features

- Browse BAFTA winners and nominees from 1940s–2020s
- Oscar categories with actor, film relationships and data visualisations
- Bond film collection explorer with data and mappings
- Treasures including underrated films and search through rating/year
- Filter by year, decade, or category
- Movie recommendation counter
- TMDb image and metadata integration
- Accessibility button on home page
- Recommeded for you movies
- Browse movies through genres

GitHub Repo: https://git.arts.ac.uk/23020113/API.git

## 📚 Acknowledgements

- TMDb API for movie data and images
- BAFTA & Oscar official records for curated awards data

Project by: Amishi, Saba, Katie
