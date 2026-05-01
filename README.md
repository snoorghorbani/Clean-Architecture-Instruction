# Clean Architecture Instructions

Copilot instruction files for enforcing [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) rules across your projects.

## Instructions

| File | Scope | Auto-applies to |
|------|-------|-----------------|
| [Core Rules](.github/instructions/clean-architecture.instructions.md) | Dependency rule, layers, SOLID, boundaries | All files (`**`) |
| [React Rules](.github/instructions/clean-architecture-react.instructions.md) | Components, hooks as adapters, state, DI | `*.tsx`, `*.jsx` |
| [UI Rules](.github/instructions/clean-architecture-ui.instructions.md) | View models, presenter pattern, forms, styling | `*.css`, `*.scss`, `*.html`, `*.svg` |

## Usage

Install the package in your destination project and run the CLI command:

```bash
npm install --save-dev clean-architecture-instruction
npx clean-architecture-instruction prepare .
```

This creates (or updates) `.github/instructions/` in the destination project root.

### Command

```bash
clean-architecture-instruction prepare [targetPath] [--force]
```

- `targetPath`: optional path to the destination project (defaults to current directory).
- `--force`: overwrite existing instruction files instead of skipping them.
