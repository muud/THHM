# TrueHealth HMS - Copilot Instructions

## Project Overview
TrueHealth HMS (Health Management System) is a Django 4.2 application with PostgreSQL backend, containerized with Docker. The project manages three domains:
- **core**: System fundamentals and shared utilities
- **patients**: Patient records and information management
- **pharmacy**: Pharmaceutical operations and medication management

## Architecture

### Directory Structure
```
truehealth_hms/
  apps/              # Django applications (core, patients, pharmacy)
  config/            # Project settings and URL routing
  manage.py          # Django CLI
  docker-compose.yml # Multi-container orchestration
  requirements.txt   # Python dependencies
```

### Configuration Pattern
All environment-sensitive settings use `python-decouple` for configuration injection from `.env`:
- `SECRET_KEY`: Django secret key (required)
- `DEBUG`: Debug mode flag
- `DATABASE_*`: PostgreSQL connection parameters (`NAME`, `USER`, `PASSWORD`, `HOST`, `PORT`)

Example: `settings.py` line 14 uses `config('SECRET_KEY')` to load from environment.

## Development Workflows

### Local Development with Docker
```bash
# Build and run containers (from truehealth_hms directory)
docker-compose up --build

# Run Django migrations inside container
docker-compose exec web python manage.py migrate

# Create superuser for admin access
docker-compose exec web python manage.py createsuperuser

# Access app at http://localhost:8000
```

### Direct Python Development (without Docker)
```bash
# Set up environment variables in .env
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Database
PostgreSQL 13 is configured via docker-compose. Connection uses environment variables in `settings.py` (lines 63-70).

## Key Development Patterns

### URL Routing
- Main routes configured in `config/urls.py` (lines 8-12)
- Each app includes its own URL patterns: `apps.<app>.urls`
- URL structure: `/patients/...`, `/pharmacy/...`, with core endpoints at root `/`

### Django App Structure
Each app follows standard Django layout:
- `models.py`: Domain models (currently empty—this is active development area)
- `views.py`: Request handlers
- `urls.py`: App-specific routing
- `admin.py`: Admin interface registration
- `apps.py`: App configuration

### Static Files
- Configured at `settings.py` line 114: `STATIC_URL = 'static/'`
- Development media storage in `media/` directory

## Common Tasks

### Adding a New Model
1. Define in `apps/<domain>/models.py`
2. Add app to `INSTALLED_APPS` in `settings.py` (already done: core, patients, pharmacy)
3. Run `python manage.py makemigrations` then `python manage.py migrate`
4. Register in `apps/<domain>/admin.py` for admin interface

### Debugging
- Django runs on `0.0.0.0:8000` in container (mapped to `localhost:8000`)
- Set `DEBUG=true` in `.env` for detailed error pages
- Check logs: `docker-compose logs -f web`

## Dependencies
- Django 4.2.7
- psycopg2-binary 2.9.7 (PostgreSQL adapter)
- python-decouple 3.8 (environment configuration)

## Notes for AI Agents
- The project is in early development—models are templated but not yet implemented
- Focus on consistency with Django conventions (MTV pattern: Models, Templates, Views)
- All database configuration is environment-driven; never hardcode credentials
- Dockerfile uses Python 3.11-slim base image
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.