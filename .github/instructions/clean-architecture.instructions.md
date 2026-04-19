---
description: "Use when writing any application code, designing modules, creating services, organizing folders, or discussing architecture. Covers Clean Architecture (Robert C. Martin) principles: dependency rule, entities, use cases, interface adapters, frameworks layer."
applyTo: "**"
---

# Clean Architecture — Core Rules (Robert C. Martin)

## The Dependency Rule

Dependencies point **inward only**. Nothing in an inner circle may know anything about an outer circle. This includes functions, classes, variables, data formats, or any named entity.

```
Frameworks & Drivers  →  Interface Adapters  →  Use Cases  →  Entities
       (outer)                                                (inner)
```

## Layer Definitions

### Entities (Enterprise Business Rules)

- Contain **enterprise-wide** business rules and critical business data.
- Entities are plain objects or classes with methods — no framework dependencies.
- They are the **least likely to change** when something external changes (UI, database, framework).
- An entity must **never** import from use cases, adapters, or frameworks.

### Use Cases (Application Business Rules)

- Contain **application-specific** business rules.
- Orchestrate data flow to and from entities.
- Each use case represents **one specific user intention** (e.g., `CreateOrder`, `TransferFunds`).
- Use cases define **input/output port interfaces** (boundaries) — they do not implement them.
- Must not depend on UI, database, or any external agency.

### Interface Adapters

- Convert data between the format used by use cases/entities and the format used by external agencies (DB, web, devices).
- Contains controllers, presenters, gateways, and repository implementations.
- No business logic — only **data transformation and routing**.

### Frameworks & Drivers

- The outermost layer: UI frameworks, database engines, HTTP servers, third-party libraries.
- This code is **glue** — minimal logic, wiring only.
- All framework-specific code stays here and does not leak inward.

## Boundaries & Ports

- Define boundaries as **interfaces** (or abstract classes / protocols) owned by the **inner** layer.
- Outer layers provide **concrete implementations** of these interfaces.
- Use **Dependency Inversion**: inner layers declare what they need; outer layers supply it.

```
Use Case  →  defines OutputPort interface
Presenter →  implements OutputPort interface
```

## Data Crossing Boundaries

- Data that crosses a boundary must be in **simple, isolated structures** (DTOs, plain objects, primitives).
- Never pass database rows, ORM models, or framework objects across a boundary.
- Each boundary defines its own **request model** and **response model**.

## Key Principles

### Single Responsibility

Each module/class has **one reason to change** — and that reason corresponds to exactly one actor or stakeholder.

### Open–Closed

Modules are **open for extension, closed for modification**. New behavior is added by writing new code, not changing existing code. Achieve this through abstraction and polymorphism.

### Liskov Substitution

Subtypes must be substitutable for their base types without altering correctness. Violating this breaks the dependency rule at the boundary.

### Interface Segregation

No client should be forced to depend on methods it does not use. Keep interfaces **small and role-specific**.

### Dependency Inversion

- High-level modules must not depend on low-level modules. Both depend on **abstractions**.
- Abstractions must not depend on details. Details depend on **abstractions**.

## Practical Rules

1. **No business logic in controllers or presenters.** They are translators only.
2. **No framework imports inside entities or use cases.** If you see `import express` or `import mongoose` in a use case — it is wrong.
3. **Use cases are tested without any infrastructure.** If a use case test requires a running database or HTTP server, the architecture is violated.
4. **One use case = one file/class.** Do not bundle multiple use cases together.
5. **Repository interfaces belong to the use case layer.** Implementations belong to the adapter/infrastructure layer.
6. **Do not pass entities directly to the outside world.** Map them to response models at the boundary.
7. **Keep the dependency graph acyclic.** If you find a circular dependency, an abstraction is missing.
8. **The Main component (composition root)** is the dirtiest module. It wires everything together and lives in the outermost layer.

## Folder Structure Convention

```
src/
  domain/              # Entities + value objects
  application/         # Use cases + port interfaces
  infrastructure/      # Adapters, repositories, external services
  presentation/        # UI, controllers, presenters
  main/                # Composition root, DI wiring
```

Adapt folder names to the project's language conventions, but preserve the **separation of concerns** and the **direction of dependencies**.
