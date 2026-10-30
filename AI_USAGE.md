# AI Usage Declaration

## Scope and tool used

I used OpenAI Codex, an AI coding assistant, during the development of this calculator. I defined the requirements, selected the technologies, requested revisions, and approved the final implementation.

AI assistance included:

- AI assisted code generation and refactoring for parts of the frontend and backend, including decimal handling and operator precedence.
- Plain CSS styling, responsive layout, and simplification of the calculator interface.
- Generation and revision of backend and frontend unit tests, plus assistance running tests and interpreting coverage results.
- Docker and Docker Compose configuration.
- Setup instructions, API examples, design explanations, and submission documentation.

## Representative prompts

The following are representative paraphrases of requests made during development.

1. **CSS and layout**
   > Help me style my React calculator using plain CSS. Keep the design clean, readable, and responsive without adding a UI framework or unnecessary visual elements.

2. **Backend tests**
   > Help me write unit tests for the calculator API. Cover valid arithmetic operations, invalid inputs, division by zero, and important numeric edge cases. Explain what each test verifies.

3. **Frontend tests**
   > Help me test number entry, operation selection, API results, loading state, and error handling. Keep the tests straightforward and focused on meaningful user behavior.

4. **Documentation and setup**
   > Review the README and Docker Compose setup. Include accurate startup instructions, API examples, test commands, and the main design assumptions without unnecessary detail.

5. **Correctness fixes**
   > Correct decimal addition so 0.1 + 0.2 returns 0.3. Apply operator precedence so 2 + 3 * 4 returns 14, and evaluate equal-priority operations from left to right. Update the related tests and documentation.

## Human review and developer responsibility

I had reviewed and understood the final code, personally tested the application, and reviewed the automated test results before approving the submission. I directed changes and evaluated the resulting implementation against the project requirements.

Automated checks were executed with AI assistance. The final results were 8 passing backend test methods, including subtests, and 24 passing frontend tests. The Docker image also built successfully. Coverage scope and results are recorded in [COVERAGE.md](COVERAGE.md).


## Intellectual property, licenses, and confidentiality

The project uses third-party dependencies under their respective licenses. The main package license metadata checked during preparation includes:

| Package | Declared license |
| --- | --- |
| React and React DOM | MIT |
| Flask and Werkzeug | BSD-3-Clause |
| TypeScript and coverage.py | Apache-2.0 |
| Vite and Vitest | MIT |

This is not an exhaustive audit of all transitive dependencies. Their applicable licenses and notices must be respected; this declaration does not claim ownership of third-party packages or replace their license terms.