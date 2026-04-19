# Clean Architecture Instructions

Copilot instruction files for enforcing [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) rules across your projects.

## Instructions

| File | Scope | Auto-applies to |
|------|-------|-----------------|
| [Core Rules](.github/instructions/clean-architecture.instructions.md) | Dependency rule, layers, SOLID, boundaries | All files (`**`) |
| [React Rules](.github/instructions/clean-architecture-react.instructions.md) | Components, hooks as adapters, state, DI | `*.tsx`, `*.jsx` |
| [UI Rules](.github/instructions/clean-architecture-ui.instructions.md) | View models, presenter pattern, forms, styling | `*.css`, `*.scss`, `*.html`, `*.svg` |

## Usage

Copy the `.github/instructions/` folder into the root of any project. Copilot picks up the instruction files automatically — no extra configuration needed.
