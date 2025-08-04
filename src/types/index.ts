// Central export file for all types
// This allows clean imports like: import type { Job, Client } from '@/types';

// Core business entities
export type {
  BaseEntity,
  BaseOrganizationEntity,
  ContactInfo,
  Metadata
} from './core/base';

export type {
  Client,
  ClientFormData,
  ClientWithMetadata
} from './core/client';

export type {
  Profile,
  ProfileSkill,
  ServiceArea,
  TeamMemberCommission,
  TechnicianProfile
} from './core/profile';

export type {
  Job,
  JobWithRelations,
  JobWithCompatibility,
  CreateJobInput,
  UpdateJobInput
} from './core/job';

export { JobStatus, isValidJobStatus, validateJob } from './core/job';

export type {
  Estimate,
  EstimateItem,
  CreateEstimateInput
} from './core/estimate';

export type {
  Invoice,
  InvoiceItem,
  CreateInvoiceInput
} from './core/invoice';

export type {
  Payment,
  CreatePaymentInput
} from './core/payment';

// Database-enhanced types
export type {
  JobDatabase,
  JobWithDatabaseRelations,
  CreateJobDatabase,
  UpdateJobDatabase
} from './core/job-database';

export { 
  isValidDatabaseJob, 
  databaseJobToJob 
} from './core/job-database';

export type {
  ClientDatabase,
  ClientWithDatabaseMetrics,
  CreateClientDatabase,
  UpdateClientDatabase
} from './core/client-database';

export { 
  isValidDatabaseClient, 
  databaseClientToClient,
  clientToDatabase
} from './core/client-database';

export type {
  ProfileDatabase,
  ProfileWithDatabaseRelations,
  CreateProfileDatabase,
  UpdateProfileDatabase
} from './core/profile-database';

export { 
  isValidDatabaseProfile, 
  databaseProfileToProfile 
} from './core/profile-database';

// Re-export existing types for backward compatibility
export type { UnifiedClient } from './client';
export type { BusinessMetrics, PhoneNumber } from './database';
