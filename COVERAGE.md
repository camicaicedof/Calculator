# Test and coverage report

Measured on October 30, 2026 using Python 3.10.8, coverage.py 7.10.7, and Vitest 3.2.7 on Node.js 24 in Docker.

| Layer | Passing tests | Failed tests | Lines / statements | Branches |
| --- | ---: | ---: | ---: | ---: |
| Python backend | 8 unittest methods, including subtests | 0 | 100% (81/81 statements) | 97.06% (33/34) |
| React frontend | 24 tests | 0 | 98.52% (200/203 lines) | 83.87% (78/93) |

Both frontend test files passed in Docker, with 24 passing tests and no failed or skipped tests. Tests that simulate API errors pass when the application handles those errors correctly.

Backend combined statement/branch coverage is 99.13%. Frontend function coverage is 96.55% (28/29).

## Scope

- Backend: `app.py` and `calculator.py`. The server startup wrapper, third-party dependencies, and test files are excluded.
- Frontend: `src/App.tsx` and `src/api.ts`. The React mounting entry point, CSS, configuration, dependencies, and test files are excluded.

Backend tests cover arithmetic, invalid operands, domain errors, overflow, JSON validation, HTTP responses, and static files. Frontend tests cover all seven operations, decimal result display, arithmetic precedence, left-to-right evaluation within equal priority, input editing, operator replacement, loading state, and API errors. Backend regression cases verify exact decimal results for addition, subtraction, multiplication, and division.

The backend's one unexercised branch is the fall-through after checking the supported percentage operation. Frontend gaps include some input-editing edge cases and defensive error handling. These are code paths not exercised by the tests, not failed tests. Coverage measures execution, not proof of correctness; the tests are focused on key behavior.

## Reproduce

See the test commands in [README.md](README.md). Both suites pass. The report was generated from the same source files included in this submission.

Generated HTML and raw coverage data are omitted to keep the repository small. Running the coverage commands produces fresh reports locally.
