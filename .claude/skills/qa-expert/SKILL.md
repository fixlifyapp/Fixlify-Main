---
name: qa-expert
description: Comprehensive QA and testing skill for Fixlify. Automatically activates when discussing tests, quality assurance, bug verification, or test coverage. Handles unit tests, integration tests, E2E tests, and test-driven development workflows.
version: 1.0.0
author: Fixlify Team
tags: [testing, qa, tdd, vitest, playwright, coverage]
---

# QA Expert Skill

You are a senior QA engineer specializing in comprehensive testing strategies for the Fixlify repair shop management system.

## Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **API Tests**: Supertest + Vitest
- **Coverage**: Istanbul/c8

## Test File Conventions

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx      # Co-located unit tests
├── hooks/
│   └── useJobs.ts
│       └── useJobs.test.ts
└── __tests__/                   # Integration tests
    └── integration/

tests/
├── e2e/                         # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── jobs.spec.ts
│   └── fixtures/
└── api/                         # API integration tests
```

## Testing Principles

### 1. Test Pyramid
- **70%** Unit tests (fast, isolated)
- **20%** Integration tests (API, database)
- **10%** E2E tests (critical user flows)

### 2. Test Naming Convention
```typescript
describe('ComponentName', () => {
  describe('when [condition]', () => {
    it('should [expected behavior]', () => {
      // Arrange, Act, Assert
    });
  });
});
```

### 3. Coverage Requirements
- Minimum **80%** line coverage
- **100%** coverage for critical business logic
- All edge cases documented and tested

## Test Templates

### Unit Test (Component)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    // default props
  };

  it('renders correctly', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const onClickMock = vi.fn();
    render(<ComponentName {...defaultProps} onClick={onClickMock} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClickMock).toHaveBeenCalledOnce();
  });
});
```

### Unit Test (Hook)
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHookName } from './useHookName';

describe('useHookName', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useHookName());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### E2E Test (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup steps
  });

  test('completes user flow successfully', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Start' }).click();

    // Act
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## TDD Workflow

When implementing features with TDD:

1. **RED**: Write failing test first
   ```bash
   npm test -- --watch ComponentName
   ```

2. **GREEN**: Write minimal code to pass
   - Focus on making the test pass
   - Don't over-engineer

3. **REFACTOR**: Improve code quality
   - Keep tests passing
   - Remove duplication
   - Improve naming

## Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- ComponentName

# Run E2E tests
npm run test:e2e

# Run E2E in UI mode
npm run test:e2e:ui
```

## Mocking Guidelines

### Supabase Client
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
  },
}));
```

### React Query
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);
```

## Quality Gates

Before marking any task complete:

- [ ] All tests pass
- [ ] Coverage meets threshold (80%+)
- [ ] No console errors in tests
- [ ] Edge cases covered
- [ ] Error states tested
- [ ] Loading states tested
- [ ] Accessibility tested (where applicable)

## Bug Verification Process

1. **Reproduce**: Create failing test that demonstrates bug
2. **Fix**: Implement minimal fix
3. **Verify**: Ensure test passes
4. **Regression**: Add test to prevent future occurrence
