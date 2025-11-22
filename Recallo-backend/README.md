# Recallo Backend

This is the FastAPI backend for the Recallo application, using Supabase as the database.

## Prerequisites

- Python 3.9+
- A Supabase project

## Setup

1.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables:**
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Open `.env` and add your Supabase credentials:
      ```
      SUPABASE_URL=your_supabase_url
      SUPABASE_KEY=your_supabase_anon_key
      ```

## Running the Server

Start the development server with hot-reload:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Documentation

- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

## Testing

Run the tests using `pytest`:

```bash
pytest
```
