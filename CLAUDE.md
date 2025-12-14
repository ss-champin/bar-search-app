# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working on This Project

**IMPORTANT**: Always consult the relevant documentation in the `docs/` directory before making changes:

- `docs/requirements.md` - Overall project requirements and feature specifications
- `docs/functional_requirements.md` - Detailed functional requirements for each feature
- `docs/database_schema.md` - Complete database design, ER diagram, and table definitions
- `docs/api_specification.yaml` - OpenAPI specification for all API endpoints
- `docs/api_design.md` - API design patterns and conventions
- `docs/supabase_migration.sql` - Production database migration SQL
- `docs/database_setup_guide.md` - Supabase setup instructions

When implementing features, modifying schemas, or adding API endpoints, reference these documents to ensure alignment with the project design.

## Project Overview

バー検索アプリ (Bar Search App) - A web application for searching, reviewing, and saving favorite bars in Japan.

**Tech Stack:**
- Frontend: Next.js 14 (App Router), TypeScript, Zustand, Biome, Vitest
- Backend: FastAPI, Python 3.12, Pydantic v2, uv package manager, pytest
- Database: PostgreSQL 16 (local dev) / Supabase (production)
- Infrastructure: Docker Compose, go-task

## Development Commands

All commands use the `task` runner (go-task). Run `task help` to see all available tasks.

### Essential Commands

```bash
# Initial setup
task setup              # Install all dependencies
task setup:env          # Create .env from .env.example
task build              # Build Docker images
task up                 # Start all services
task db:migrate         # Run database migrations

# Development
task dev                # Start all services with logs visible
task dev:backend        # Start backend + db only
task dev:frontend       # Start frontend only

# Docker operations
task down               # Stop all services
task restart            # Restart all services
task logs               # View all logs
task logs:backend       # View backend logs only
task logs:frontend      # View frontend logs only
task logs:db            # View database logs only

# Code quality
task lint               # Run linters for both frontend and backend
task lint:fix           # Auto-fix linting issues
task format             # Format code
task type-check         # Run type checking
task test               # Run tests
task check              # Run lint + type-check + test

# Backend-specific
task backend:lint       # Lint backend with ruff
task backend:format     # Format backend with ruff
task backend:type-check # Type check with mypy
task backend:test       # Run pytest
task backend:test:cov   # Run pytest with coverage
task backend:shell      # Access backend container shell

# Frontend-specific
task frontend:lint      # Lint frontend with biome
task frontend:format    # Format frontend with biome
task frontend:type-check # Type check frontend
task frontend:test      # Run frontend tests with Vitest
task frontend:test:ui   # Run frontend tests with UI
task frontend:test:cov  # Run frontend tests with coverage
task frontend:shell     # Access frontend container shell

# Database operations
task db:shell           # Access PostgreSQL shell
task db:reset           # Reset database (WARNING: deletes all data)
task db:dump            # Dump database to dump.sql

# Cleanup
task clean              # Remove temporary files and caches
task clean:all          # Full cleanup including Docker volumes
```

### Running Single Tests

```bash
# Backend (pytest)
cd backend
uv run pytest tests/test_specific_file.py
uv run pytest tests/test_file.py::test_function_name

# Frontend (Vitest)
cd frontend
npm run test                           # Run all tests
npm run test -- --run                  # Run tests without watch mode
npm run test -- __tests__/components/BarCard.test.tsx  # Run specific test file
npm run test:ui                        # Run tests with UI
npm run test:coverage                  # Run tests with coverage report
```

## Architecture Overview

### Multi-Environment Database Strategy

**Critical**: This project uses **3 separate environments** with different database configurations:

#### 1. Local Development Environment
- **Authentication**: Supabase Auth (dev project)
- **Database**: Docker PostgreSQL 16 (docker-compose service)
- **Purpose**: Daily development, testing, debugging
- **Features**:
  - **Hybrid setup**: Supabase for auth only, Docker PostgreSQL for data
  - Auth uses Supabase dev project (`bar-search-app-dev`)
  - OAuth (Google/Twitter) works out of the box
  - Database runs on `localhost:5432`
  - All data in local Docker volumes
  - No need for database migration in Supabase (only auth setup)

#### 2. Staging Environment (検証環境)
- **Database**: Supabase (dedicated staging project)
- **Purpose**: Pre-production testing, QA, demos
- **Features**:
  - Separate Supabase project: `bar-search-app-staging`
  - Uses Supabase Auth (`auth.users` schema)
  - Supabase Storage for images
  - Row Level Security (RLS) enabled
  - **Completely isolated from production**

#### 3. Production Environment (本番環境)
- **Database**: Supabase (dedicated production project)
- **Purpose**: Live service for end users
- **Features**:
  - Separate Supabase project: `bar-search-app-production`
  - Uses Supabase Auth (`auth.users` schema)
  - Supabase Storage for images
  - Row Level Security (RLS) enabled
  - **Completely isolated from staging**

**Environment Separation**:
- Staging and production use **different Supabase projects**
- Never share the same Supabase project between environments
- Each environment has its own API keys, database, and storage

**When modifying database schemas:**
1. Develop and test changes locally (Docker PostgreSQL)
2. Update `docs/supabase_migration.sql`
3. Deploy to staging Supabase and test thoroughly
4. Deploy to production Supabase after verification
5. Maintain compatibility layer in backend code

**Detailed setup**: See `docs/environment_setup.md`

### Backend Structure

```
backend/app/
├── main.py              # FastAPI app entry point, CORS config
├── core/
│   └── config.py        # Settings with Pydantic BaseSettings
├── api/                 # API route handlers (to be implemented)
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas for validation
├── services/            # Business logic layer
└── dependencies/        # Dependency injection (auth, db sessions)
```

**Key patterns:**
- Settings loaded from `.env` via `pydantic-settings`
- All config in `app.core.config.Settings`
- API routes will be registered in `main.py` with `app.include_router()`
- Uses `uv` for package management (not pip)

### Frontend Structure

```
frontend/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components (to be implemented)
└── lib/                 # Utilities, Supabase client, hooks
```

**Key patterns:**
- App Router (not Pages Router)
- Zustand for state management
- Biome for linting/formatting (not ESLint/Prettier)
- TypeScript strict mode

### Docker Services

- `db`: PostgreSQL 16 Alpine (port 5432)
- `backend`: FastAPI with hot reload (port 8000)
- `frontend`: Next.js dev server (port 3000)
- `pgadmin`: Database admin tool (port 5050, optional, use `task pgadmin`)

All services share `bar-search-network` bridge network.

## Database Schema

Key tables (see `docs/database_schema.md` for full details):

- `profiles` - User profile data (1:1 with auth.users in production)
- `bars` - Bar information with location, hours, menu pricing
- `reviews` - User reviews (1-5 stars + comment)
- `favorites` - User's favorite bars

**Important constraints:**
- `favorites` has UNIQUE(bar_id, user_id) - prevent duplicate favorites
- `reviews` allows one review per user per bar
- RLS policies enforce users can only edit their own data
- Only admin users can create/edit/delete bars

## Environment Configuration

**Required environment variables** (`.env`):

```bash
COMPOSE_PROJECT_NAME=bar-search-app  # CRITICAL: avoids empty project name error

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/bar_search_dev

# Supabase (production only - can be mock values for local dev)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: Japanese characters in directory names can cause Docker Compose issues. The `COMPOSE_PROJECT_NAME` variable explicitly sets the project name.

## Code Quality Standards

### Backend (Python)

- **Linter**: ruff (config in `pyproject.toml`)
- **Formatter**: ruff format
- **Type Checker**: mypy (strict mode)
- **Line Length**: 100 characters
- **Python Version**: 3.12+

Key ruff rules enabled: pycodestyle, pyflakes, isort, flake8-bugbear, pyupgrade

### Frontend (TypeScript)

- **Linter/Formatter**: Biome (config in `biome.json`)
- **Type Checker**: TypeScript strict
- **Line Width**: 100 characters
- **Quote Style**: Single quotes
- **Indent**: 2 spaces

## Testing

### Backend Tests

- Framework: pytest with pytest-asyncio
- Coverage: pytest-cov
- Config: `pyproject.toml` [tool.pytest.ini_options]
- Run: `task backend:test` or `task backend:test:cov`
- Tests location: `backend/tests/` following `test_*.py` naming

**Test Structure:**
- `tests/conftest.py` - pytest fixtures and configuration
- `tests/test_*_api.py` - API endpoint tests
- Uses SQLAlchemy models and async database sessions

### Frontend Tests

- Framework: Vitest with @testing-library/react
- Coverage: @vitest/coverage-v8
- Config: `vitest.config.ts` and `vitest.setup.ts`
- Run: `task frontend:test`, `task frontend:test:ui`, or `task frontend:test:cov`
- Tests location: `frontend/__tests__/` following `*.test.tsx` or `*.test.ts` naming

**Test Structure:**
- `__tests__/components/` - Component tests
- `__tests__/stores/` - Zustand store tests
- `vitest.setup.ts` - Global mocks (Next.js router, ResizeObserver)
- Uses jsdom environment for DOM testing

**Key Testing Libraries:**
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom matchers for DOM assertions

**Running Tests:**
```bash
# Run all frontend tests
task frontend:test

# Run tests in watch mode (default for npm run test)
cd frontend && npm run test

# Run tests with UI dashboard
task frontend:test:ui

# Run tests with coverage report
task frontend:test:cov
```

## API Design

RESTful API following OpenAPI 3.0 spec (`docs/api_specification.yaml`).

**Endpoint structure:**
- `/api/bars` - Bar CRUD operations
- `/api/bars/{bar_id}/reviews` - Reviews for specific bar
- `/api/favorites` - User favorites
- `/api/users/me` - Current user profile

**Authentication:**
- Supabase JWT tokens in production
- Token verification in FastAPI dependencies
- Local dev may mock authentication

## Common Pitfalls

1. **Docker build errors**: Japanese directory name caused empty `COMPOSE_PROJECT_NAME`. Always set it explicitly in `.env`.

2. **npm ci vs npm install**: This project uses `npm install` (not `npm ci`) in Dockerfile because no `package-lock.json` exists.

3. **pyproject.toml package discovery**: Hatchling needs explicit `[tool.hatch.build.targets.wheel] packages = ["app"]` because project name doesn't match directory name.

4. **Database migration on init**: The `docs/supabase_migration.sql` references `auth.users` which doesn't exist in local PostgreSQL. For local dev, this needs to be adapted.

5. **uv sync errors**: Use `uv sync --frozen --no-dev || uv sync --no-dev` pattern in Dockerfile for better compatibility.

## Access Points

When services are running:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc
- Health Check: http://localhost:8000/health
- pgAdmin: http://localhost:5050 (requires `task pgadmin`)

## Documentation

Comprehensive documentation in `docs/`:

- `requirements.md` - Full requirements specification
- `functional_requirements.md` - Feature details
- `database_schema.md` - Complete DB design with ER diagram
- `supabase_migration.sql` - Production migration SQL
- `api_specification.yaml` - OpenAPI spec
- `api_design.md` - API design details
