// DEPRECATED: This file is kept for backward compatibility
// Please use imports from '@/types' or '@/types/core/client' instead

// Re-export everything from the new location
export * from './core/client';

// Keep the UnifiedClient alias for backward compatibility
export type { Client as UnifiedClient } from './core/client';
