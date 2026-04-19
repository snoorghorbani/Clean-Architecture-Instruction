---
description: "Use when writing React components, hooks, state management, or React project structure. Covers Clean Architecture applied to React: component boundaries, hook design, state isolation, and dependency direction in React apps."
applyTo: "**/*.{tsx,jsx}"
---

# Clean Architecture — React-Specific Rules

## React Layer Mapping

```
Frameworks & Drivers  →  React, React DOM, Router, UI libraries
Interface Adapters    →  Hooks (adapters), Containers, API clients
Use Cases             →  Application services, custom business hooks
Entities              →  Domain models, value objects, business logic
```

## Component Architecture

### Presentational Components (Frameworks Layer)

- Receive **all data via props**. No direct calls to APIs, stores, or services.
- Contain **zero business logic**. Only rendering and UI event forwarding.
- May manage local **UI state** only (open/close, hover, animation).
- Must be testable with just props and snapshots — no mocking infrastructure.

```tsx
// GOOD — pure presentational
function OrderSummary({ items, total, onConfirm }: OrderSummaryProps) {
  return (
    <div>
      {items.map(item => <OrderItem key={item.id} {...item} />)}
      <span>{total}</span>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
}
```

### Container Components (Interface Adapters)

- Connect presentational components to use cases and state.
- Use **custom hooks** to access application logic — never call services directly in JSX.
- Map domain data to **view models** before passing to presentational components.
- Keep render logic minimal — delegate to presentational children.

```tsx
// GOOD — adapter/container
function OrderSummaryContainer({ orderId }: { orderId: string }) {
  const { items, total, confirmOrder } = useOrderSummary(orderId);
  return <OrderSummary items={items} total={total} onConfirm={confirmOrder} />;
}
```

## Hooks as Adapters

Custom hooks serve as the **interface adapter layer** in React.

- **Adapter hooks** bridge React to use cases: `useOrderSummary`, `useAuth`, `useCart`.
- Adapter hooks call use case functions/services and transform the result into what the component needs.
- **Never put business logic inside hooks.** Hooks orchestrate — use cases decide.

```tsx
// GOOD — hook as adapter, delegates to use case
function useCreateOrder() {
  const createOrderUseCase = useInjected(CreateOrderUseCase);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const execute = async (input: CreateOrderInput) => {
    setStatus('loading');
    const result = await createOrderUseCase.execute(input);
    setStatus(result.isOk ? 'idle' : 'error');
    return result;
  };

  return { execute, status };
}
```

```tsx
// BAD — business logic leaking into a hook
function useCreateOrder() {
  const execute = async (input) => {
    if (input.items.length === 0) throw new Error('Empty'); // ← business rule leaked
    const discount = input.total > 100 ? 0.1 : 0;          // ← business rule leaked
    await api.post('/orders', { ...input, discount });
  };
  return { execute };
}
```

## State Management

- **Domain state** (entities, business data) lives in the use case / application layer. Exposed to React through adapter hooks.
- **Application state** (auth token, current route, selected filters) lives in context providers or a store, at the adapter layer.
- **UI state** (modal open, form field focus, animation frame) lives **inside the component**. Never elevate UI state to global stores.
- State management libraries (Redux, Zustand, Jotai) are **framework layer** details — they must not leak into use cases or entities.

## Dependency Injection in React

- Use **React Context** or a lightweight DI container to inject use cases and services into hooks.
- The composition root (`App.tsx` or a provider tree) wires concrete implementations.
- Components and hooks depend on **abstractions** (interfaces/types), not concrete implementations.

```tsx
// Composition root
<DependencyProvider container={container}>
  <App />
</DependencyProvider>
```

## API & Data Fetching

- API clients (fetch, axios, react-query, SWR) belong to the **infrastructure layer**.
- Hooks that call APIs are **adapters**. They must not contain business rules.
- Data returned from APIs must be mapped to **domain models** before reaching use cases.
- Never pass raw API response shapes into components — always map to view models.

## Folder Structure for React

```
src/
  domain/                    # Entities, value objects, business rules
    models/
    value-objects/
  application/               # Use cases, port interfaces
    use-cases/
    ports/
  infrastructure/            # API clients, storage, external services
    api/
    storage/
  presentation/              # React-specific code
    components/              # Presentational (dumb) components
    containers/              # Container components
    hooks/                   # Adapter hooks
    contexts/                # React context providers
    pages/                   # Route-level components
  main/                      # App entry, DI wiring, provider tree
```

## Testing Strategy

| Layer | Test Type | Infrastructure Needed |
|-------|-----------|----------------------|
| Entities | Unit tests | None |
| Use Cases | Unit tests | Mocked port interfaces |
| Hooks (adapters) | Integration tests | Mocked use cases |
| Components | Component tests | Props only, no mocking |
| Pages/Containers | Integration tests | Mocked hooks or providers |

## Rules Summary

1. **Components never import from `infrastructure/` or `application/`.** They go through hooks.
2. **Hooks never import from `infrastructure/` directly.** They use injected abstractions.
3. **Use cases never import React.** If `import { useState }` appears in a use case — it is wrong.
4. **Entities never import anything from outer layers.** Pure TypeScript/JavaScript only.
5. **One use case per hook is the default.** Combine only when the UI genuinely needs atomic orchestration.
6. **View models are not entities.** Map at the adapter boundary. Components receive view models, not domain objects.
7. **Side effects (API calls, localStorage, analytics) happen in the infrastructure layer**, triggered through port interfaces.
