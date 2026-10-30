# Calculator

A React + TypeScript calculator with a Python + Flask REST API. Supports addition, subtraction, multiplication, division, power, square root, and percentage.

## Setup and run

Install and start Docker Desktop with Docker Compose. No local Python, Node.js, or pnpm installation is needed.

From this repository's root:

```sh
docker compose up --build
```

Open http://localhost:8080. This starts the frontend and backend together. The image build runs both unit test suites and builds the frontend.

After editing files, rebuild and restart:

```sh
docker compose up --build -d
```

Stop and remove the container:

```sh
docker compose down
```

The default port is 8080. If it is busy, set `PORT=8081` before starting Compose (PowerShell: `$env:PORT = '8081'`) and open http://localhost:8081.

### Optional: run frontend and backend separately

Skip this section when using Docker Compose. For local development, install Python 3.10+, Node.js 24+, and pnpm 11.25.0. If pnpm is missing, install it with `npm install -g pnpm@11.25.0`. Stop Compose first to free port 8080.

From the repository root, start the backend in one terminal (Windows PowerShell):

```powershell
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv/Scripts/python.exe server.py
```

On macOS/Linux, use `python3 -m venv .venv` and `.venv/bin/python` instead of `python` and `.venv/Scripts/python.exe` in this setup.

In a second terminal, also starting from the repository root, start the frontend:

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:5173. Vite forwards `/api` requests to the backend at http://localhost:8080. Saving frontend files updates the page automatically; the Compose setup requires a rebuild after source changes.

## API examples

`POST /api/calculate` accepts JSON with `operation`, numeric `a`, and numeric `b` for operations requiring two operands.

```sh
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","a":2,"b":3}'
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:8080/api/calculate -Method Post `
  -ContentType 'application/json' -Body '{"operation":"add","a":2,"b":3}'
```

Response: `{"result":5.0}`.

| Operation | Meaning | Operands |
| --- | --- | --- |
| `add` | a + b | a, b |
| `subtract` | a − b | a, b |
| `multiply` | a × b | a, b |
| `divide` | a ÷ b | a, b |
| `power` | a raised to b | a, b |
| `sqrt` | Square root of a | a |
| `percentage` | a / 100 | a |

Unary example: `{"operation":"sqrt","a":9}` returns `{"result":3.0}`.

Invalid input, division by zero, non-real results, and overflow return HTTP 400 with an `error` message. For example, `{"operation":"divide","a":2,"b":0}` returns `{"error":"cannot divide by zero"}`. Bodies larger than 4096 bytes return 413; unsupported content types return 415.

`GET /api/health` returns `{"status":"ok"}`.

## Tests and coverage

Measured results and coverage scope are in [COVERAGE.md](COVERAGE.md).

To run tests separately, use the optional local development setup above. Start each command block from the repository root. For Python, activate the virtual environment or replace `python` with its executable (`.venv/Scripts/python.exe` on Windows or `.venv/bin/python` on macOS/Linux):

```sh
cd backend
python -m pip install -r requirements-dev.txt
python -m coverage run -m unittest discover -s tests -v
python -m coverage report
```

For the frontend, in another terminal starting from the repository root:

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm test:coverage
pnpm build
```

These are optional local commands, not prerequisites for Docker Compose. Frontend HTML coverage is generated at `frontend/coverage/index.html`. `COVERAGE.md` is the submitted report.

## Structure and design decisions

- `frontend/src/App.tsx`: calculator state, buttons, and input handling using React `useState`.
- `frontend/src/styles.css`: plain CSS and a responsive keypad.
- `frontend/src/api.ts`: sends calculations to Flask using `fetch` and handles API errors.
- `backend/calculator.py`: arithmetic and numeric validation, independent of HTTP.
- `backend/app.py`: REST endpoints, JSON errors, and static frontend files.
- `backend/server.py`: starts Flask. Compose runs the app in one container with a health check.

All arithmetic is performed by the backend. The frontend handles input editing and blocks interaction while requests are pending. There is no database, authentication, or calculation history.

Calculations follow operator precedence: powers, multiplication/division, then addition/subtraction. Operations with the same priority run left to right. For example, `2 + 3 × 4 =` gives `14`. Percentage means division by 100.

Basic arithmetic uses Python `Decimal` to avoid binary floating-point artifacts.

The same container serves the frontend and API, avoiding CORS configuration. Flask's built-in server is used with debug mode disabled for this assessment.

## Limitations

- Calculations are entered by clicking the on-screen buttons with the mouse. Direct keyboard input for numbers and operations is not supported.
