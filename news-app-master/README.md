# Mzansi News

Mzansi News is a modern news reader built with a Django backend and a Vue 3 + Vuetify frontend. It surfaces top headlines from [NewsAPI.org](https://newsapi.org) and allows authenticated users to perform richer searches powered by a Django Ninja REST API.

## Tech Stack

- **Backend:** Django 3.2, Django Ninja, Django auth, NewsAPI.org integration
- **Frontend:** Vue 3, TypeScript, Vite, Vuetify 3, Pinia, Axios
- **Tooling & Deployment:** npm / Node.js, Python, Gunicorn, Whitenoise, Heroku-friendly configuration

## Prerequisites

- Python 3.9+
- Node.js 18+ (ships with npm)
- A [NewsAPI.org](https://newsapi.org) key
- Recommended: virtual environment for Python dependencies

## Configuration

The application expects the following environment variables:

| Variable | Description |
| --- | --- |
| `NEWS_APP_SECRET_KEY` | Django secret key. Use a secure random string. |
| `DEBUG_VALUE` | `True` for local development, `False` for production. |
| `NEWSAPI_KEY` | NewsAPI.org key used to fetch headlines and search results. |

You can export these variables in your shell or use `.env` management (the project already includes `python-decouple` support):

```bash
export NEWS_APP_SECRET_KEY="replace-me"
export DEBUG_VALUE=True
export NEWSAPI_KEY="your-newsapi-key"
```

## Backend Setup (Django + Ninja API)

```bash
cd news-app-master
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend runs at `http://localhost:8000/`. Key API routes exposed via Django Ninja live under `/api/`:

- `GET /api/news/top-headlines` – fetch top headlines (supports `category`, `country`, `page`, `page_size`)
- `GET /api/news/search` – authenticated search endpoint (`q`, `language`, `sort_by`, pagination)
- `POST /api/auth/register` – create a new user and start a session
- `POST /api/auth/login` / `POST /api/auth/logout`
- `GET /api/auth/me` – check the current session
- `GET /api/auth/csrf` – retrieve a CSRF token for state-changing requests

## Frontend Setup (Vue + Vuetify)

```bash
cd news-app-master/frontend
npm install
npm run dev
```

Vite serves the SPA at `http://localhost:5173`. In development, API requests are proxied to the Django server, so ensure the backend is running on port 8000.

To create a production build:

```bash
npm run build
# Static assets output to frontend/dist
```

You can integrate the compiled assets with Django or host them separately on a static host of your choice.

## Development Notes

- The SPA uses session-based authentication. Axios is configured to send credentials and CSRF tokens automatically.
- CORS is configured to allow the Vite dev server (`localhost:5173`). Adjust `news_app/settings.py` if you deploy under a different domain.
- If you change proxy targets or ports, update `frontend/vite.config.ts` and the Django CORS/CSRF settings to match.

## Testing the Flow

1. Start the Django server (ensure `NEWSAPI_KEY` is set).
2. Start the Vite dev server.
3. Visit `http://localhost:5173`, browse top headlines, and register an account.
4. After signing in, use the search form to query NewsAPI for specific topics or languages.

## License

This project was originally built by the Mzansi News team and updated to use a modern SPA architecture. Refer to the repository history for original authorship details.