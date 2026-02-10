# AGENTS.md

- When function, class or file get bloated, split it.
- Reuse existing code if available.
- If task is complex, decompose.
- Feel free to make breaking changes when necessary.

## Backend

- Make sure you are in the `backend` directory. `pwd` and `cd` can help you.
- Use `uv` to run and manage packages.
- Use `logger = logging.getLogger(__name__)` to get the logger.

## Frontend

- Make sure you are in the `frontend` directory. `pwd` and `cd` can help you.
- Use `pnpm` to run and manage packages.
- Use Svelte5 syntex. Update Svelte4 to Svelte5 if you find any Svelte4 code.
- Don't use emoji. Use icon libraries if you need.