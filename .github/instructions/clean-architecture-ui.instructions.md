---
description: "Use when writing UI code, styling, layout, components, forms, accessibility, or presentation layer concerns. Covers Clean Architecture applied to UI: separating view logic from business logic, view models, presenter pattern, and UI testability."
applyTo: "**/*.{css,scss,less,html,svg}"
---

# Clean Architecture — UI-Specific Rules

## UI Is a Detail

In Clean Architecture, the UI is a **plugin** to the application. The application must be fully functional and testable **without** any UI. If removing the UI breaks business logic, the architecture is violated.

## The Presenter Pattern

Presenters sit in the **interface adapter** layer. They translate use case output into a **view model** — a flat, display-ready data structure.

```
Use Case  →  Output Port  →  Presenter  →  View Model  →  View
```

### View Model Rules

- A view model contains **only display-ready data**. No domain objects, no IDs that the view doesn't render.
- All formatting (dates, currencies, percentages) happens in the **presenter**, not the view.
- Boolean flags for UI state belong in the view model: `isSubmitDisabled`, `showErrorBanner`, `isLoading`.
- View models are **plain objects** — no methods, no behavior, no inheritance.

```typescript
// GOOD — view model is display-ready
interface OrderViewModel {
  orderNumber: string;           // formatted: "ORD-00042"
  totalDisplay: string;          // formatted: "$129.99"
  statusLabel: string;           // "Shipped" not StatusEnum.SHIPPED
  statusColor: string;           // "green"
  isRefundable: boolean;
  items: OrderItemViewModel[];
}
```

```typescript
// BAD — domain object leaking into the view
interface OrderViewModel {
  order: Order;                  // ← domain entity leaked
  total: number;                 // ← raw number, view must format
  status: StatusEnum;            // ← view must map to display string
}
```

## Formatting & Localization

- All string formatting, number formatting, date formatting, and localization happen at the **presenter/adapter layer**.
- Views receive **pre-formatted strings**. A view should never call `.toLocaleDateString()` or format currencies.
- This keeps views trivially testable and locale-independent.

## Forms & User Input

### Input Validation vs Business Validation

| Concern | Layer | Examples |
|---------|-------|----------|
| Input validation | UI / Adapter | Required field, email format, max length, number range |
| Business validation | Use Case / Entity | Unique email, sufficient balance, order limit per day |

- **Input validation** catches obviously malformed input before it reaches use cases. This is a UI concern.
- **Business validation** is enforced by entities and use cases. Never duplicate business rules in the UI.
- Form state (dirty, touched, focused) is **UI state** — it stays in the view layer.

### Form Data Flow

```
View (form fields)
  → Input validation (adapter/presenter)
    → Request model (DTO)
      → Use case (business validation + execution)
        → Response model
          → Presenter (maps to view model)
            → View (shows result / errors)
```

## Styling Rules

- Styles are a **framework detail** — they belong in the outermost layer.
- No business logic in CSS or style files. Conditional styling is driven by view model flags, not by computing business rules in templates.
- Design tokens (colors, spacing, typography) are UI infrastructure — centralize them, but they never flow inward.

```tsx
// GOOD — style driven by view model flag
<div className={viewModel.isOverdue ? 'text-red' : 'text-green'}>
  {viewModel.statusLabel}
</div>
```

```tsx
// BAD — business rule computed in the view
<div className={order.dueDate < new Date() ? 'text-red' : 'text-green'}>
  {order.status}
</div>
```

## Accessibility

- Accessibility is a **UI layer** responsibility but must be systematic.
- Use semantic HTML elements over divs with ARIA roles where possible.
- Keyboard navigation, focus management, and screen reader labels are UI concerns — keep them in the view layer.
- The presenter can provide accessibility-relevant data: `ariaLabel`, `role`, `alt` text in the view model when it depends on business state.

## Error Presentation

- Use cases return **structured error results**, not UI-formatted messages.
- The presenter maps error codes/types to **user-facing messages**.
- The view simply renders what the view model provides — no error interpretation.

```typescript
// Presenter maps domain error to display
function mapError(error: DomainError): ErrorViewModel {
  switch (error.type) {
    case 'INSUFFICIENT_FUNDS':
      return { message: 'Not enough balance to complete this transaction.', severity: 'error' };
    case 'ITEM_OUT_OF_STOCK':
      return { message: `${error.itemName} is currently unavailable.`, severity: 'warning' };
    default:
      return { message: 'Something went wrong. Please try again.', severity: 'error' };
  }
}
```

## Navigation & Routing

- Routing is a **framework detail** (outermost layer).
- Use cases must never trigger navigation directly. They return results; the adapter/controller layer decides where to navigate.
- Route parameters are **input** to the adapter layer, which maps them to use case input models.

## UI Testing Principles

| What to Test | How | Dependencies |
|-------------|-----|-------------|
| View renders correctly | Render with a view model, assert DOM output | None — view model is a plain object |
| Presenter formats correctly | Unit test: domain output → view model | None |
| User interactions trigger callbacks | Simulate events, assert handler calls | None — props/callbacks only |
| Form validation | Unit test validation functions | None |
| Integration (view + presenter) | Render with use case mock, assert full flow | Mocked use case only |

## Rules Summary

1. **Views are dumb.** They receive a view model, render it, and forward events. No computation.
2. **Presenters format.** All data transformation for display happens in the presenter/adapter, not in the view.
3. **No domain objects in templates.** If a view imports from `domain/`, the architecture is broken.
4. **Input validation is UI; business validation is domain.** Never duplicate business rules in form validators.
5. **Styles carry no logic.** Conditional styling is driven by pre-computed view model flags.
6. **Errors are mapped, not interpreted.** The view shows what the presenter gives it.
7. **Navigation is an output.** Use cases produce results; the outer layer decides where to go.
8. **UI is replaceable.** If you cannot swap the entire UI framework without touching use cases or entities, the boundary is violated.
