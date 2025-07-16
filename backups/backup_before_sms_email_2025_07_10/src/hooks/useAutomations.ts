// This file has been moved to ./automations/useAutomations.ts
// Keeping this for backward compatibility - it re-exports from the new location

export * from './automations/useAutomations';

// Display deprecation warning in development
if (import.meta.env.DEV) {
  console.warn(
    'DEPRECATION WARNING: Importing from hooks/useAutomations.ts is deprecated. ' +
    'Please import from hooks/automations/useAutomations.ts instead.'
  );
}