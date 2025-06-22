export type UserRole = 'admin' | 'technician' | 'dispatcher' | 'manager' | string;

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'jobs' | 'invoices' | 'estimates' | 'products' | 'users' | 'settings' | 'reports' | 'clients' | 'automation' | 'schedule' | 'finance';
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[]; // Permission IDs
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

// Enhanced permissions per role based on business requirements
export const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // Wildcard for all permissions
  manager: [
    // Jobs
    'jobs.view.all', 'jobs.edit.all', 'jobs.create', 'jobs.delete', 'jobs.assign', 'jobs.schedule',
    // Clients
    'clients.view.all', 'clients.edit', 'clients.create', 'clients.delete',
    // Estimates & Invoices
    'estimates.view.all', 'estimates.edit', 'estimates.create', 'estimates.delete', 'estimates.send',
    'invoices.view.all', 'invoices.edit', 'invoices.create', 'invoices.delete', 'invoices.send',
    // Products
    'products.view', 'products.edit', 'products.create', 'products.delete',
    // Users (limited)
    'users.view', 'users.edit', 'users.roles.view',
    // Reports
    'reports.view.all', 'reports.create', 'reports.export', 'reports.schedule',
    // Schedule
    'schedule.view.all', 'schedule.edit', 'schedule.assign',
    // Finance
    'finance.view', 'finance.edit', 'finance.payments',
    // Automation
    'automation.view', 'automation.edit', 'automation.create'
  ],
  dispatcher: [
    // Jobs (view all, edit assigned)
    'jobs.view.all', 'jobs.edit.assigned', 'jobs.create', 'jobs.assign', 'jobs.schedule',
    // Clients
    'clients.view.all', 'clients.edit', 'clients.create',
    // Estimates & Invoices (limited)
    'estimates.view.all', 'estimates.create', 'estimates.send',
    'invoices.view.all', 'invoices.send',
    // Schedule (full access)
    'schedule.view.all', 'schedule.edit', 'schedule.assign',
    // Reports (view only)
    'reports.view.assigned',
    // Communication
    'communication.send', 'communication.view'
  ],
  technician: [
    // Jobs (only assigned)
    'jobs.view.assigned', 'jobs.edit.assigned', 'jobs.update.status',
    // Clients (only from assigned jobs)
    'clients.view.assigned', 'clients.edit.contact',
    // Estimates & Invoices (limited)
    'estimates.view.assigned', 'estimates.create',
    'invoices.view.assigned',
    // Products (view only)
    'products.view',
    // Users (view only - to see team members)
    'users.view',
    // Schedule (own only)
    'schedule.view.own', 'schedule.edit.own',
    // Reports (own only)
    'reports.view.own',
    // Communication
    'communication.send', 'communication.view.assigned'
  ],
};

export const PERMISSIONS_LIST: Permission[] = [
  // Jobs
  { id: 'jobs.view.all', name: 'View All Jobs', description: 'Can view all jobs in the system', category: 'jobs' },
  { id: 'jobs.view.assigned', name: 'View Assigned Jobs', description: 'Can view only assigned jobs', category: 'jobs' },
  { id: 'jobs.edit.all', name: 'Edit All Jobs', description: 'Can edit any job', category: 'jobs' },
  { id: 'jobs.edit.assigned', name: 'Edit Assigned Jobs', description: 'Can edit only assigned jobs', category: 'jobs' },
  { id: 'jobs.create', name: 'Create Jobs', description: 'Can create new jobs', category: 'jobs' },
  { id: 'jobs.delete', name: 'Delete Jobs', description: 'Can delete jobs', category: 'jobs' },
  { id: 'jobs.assign', name: 'Assign Jobs', description: 'Can assign jobs to technicians', category: 'jobs' },
  { id: 'jobs.schedule', name: 'Schedule Jobs', description: 'Can schedule jobs', category: 'jobs' },
  { id: 'jobs.update.status', name: 'Update Job Status', description: 'Can update job status', category: 'jobs' },

  // Clients
  { id: 'clients.view.all', name: 'View All Clients', description: 'Can view all clients', category: 'clients' },
  { id: 'clients.view.assigned', name: 'View Assigned Clients', description: 'Can view clients from assigned jobs', category: 'clients' },
  { id: 'clients.edit', name: 'Edit Clients', description: 'Can edit client information', category: 'clients' },
  { id: 'clients.edit.contact', name: 'Edit Client Contact', description: 'Can edit client contact info only', category: 'clients' },
  { id: 'clients.create', name: 'Create Clients', description: 'Can create new clients', category: 'clients' },
  { id: 'clients.delete', name: 'Delete Clients', description: 'Can delete clients', category: 'clients' },

  // Estimates
  { id: 'estimates.view.all', name: 'View All Estimates', description: 'Can view all estimates', category: 'estimates' },
  { id: 'estimates.view.assigned', name: 'View Assigned Estimates', description: 'Can view estimates for assigned jobs', category: 'estimates' },
  { id: 'estimates.edit', name: 'Edit Estimates', description: 'Can edit estimates', category: 'estimates' },
  { id: 'estimates.create', name: 'Create Estimates', description: 'Can create new estimates', category: 'estimates' },
  { id: 'estimates.delete', name: 'Delete Estimates', description: 'Can delete estimates', category: 'estimates' },
  { id: 'estimates.send', name: 'Send Estimates', description: 'Can send estimates to clients', category: 'estimates' },

  // Invoices
  { id: 'invoices.view.all', name: 'View All Invoices', description: 'Can view all invoices', category: 'invoices' },
  { id: 'invoices.view.assigned', name: 'View Assigned Invoices', description: 'Can view invoices for assigned jobs', category: 'invoices' },
  { id: 'invoices.edit', name: 'Edit Invoices', description: 'Can edit invoices', category: 'invoices' },
  { id: 'invoices.create', name: 'Create Invoices', description: 'Can create new invoices', category: 'invoices' },
  { id: 'invoices.delete', name: 'Delete Invoices', description: 'Can delete invoices', category: 'invoices' },
  { id: 'invoices.send', name: 'Send Invoices', description: 'Can send invoices to clients', category: 'invoices' },

  // Products
  { id: 'products.view', name: 'View Products', description: 'Can view product catalog', category: 'products' },
  { id: 'products.edit', name: 'Edit Products', description: 'Can edit products', category: 'products' },
  { id: 'products.create', name: 'Create Products', description: 'Can create new products', category: 'products' },
  { id: 'products.delete', name: 'Delete Products', description: 'Can delete products', category: 'products' },

  // Users
  { id: 'users.view', name: 'View Users', description: 'Can view team members', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can edit user profiles', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Can invite new team members', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can remove team members', category: 'users' },
  { id: 'users.roles.view', name: 'View User Roles', description: 'Can view user roles and permissions', category: 'users' },
  { id: 'users.roles.assign', name: 'Assign User Roles', description: 'Can assign roles to users', category: 'users' },

  // Reports
  { id: 'reports.view.all', name: 'View All Reports', description: 'Can view all reports', category: 'reports' },
  { id: 'reports.view.assigned', name: 'View Assigned Reports', description: 'Can view reports for assigned work', category: 'reports' },
  { id: 'reports.view.own', name: 'View Own Reports', description: 'Can view own performance reports', category: 'reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Can create custom reports', category: 'reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports', category: 'reports' },
  { id: 'reports.schedule', name: 'Schedule Reports', description: 'Can schedule automated reports', category: 'reports' },

  // Schedule
  { id: 'schedule.view.all', name: 'View All Schedules', description: 'Can view all team schedules', category: 'schedule' },
  { id: 'schedule.view.own', name: 'View Own Schedule', description: 'Can view own schedule', category: 'schedule' },
  { id: 'schedule.edit', name: 'Edit Schedules', description: 'Can edit schedules', category: 'schedule' },
  { id: 'schedule.edit.own', name: 'Edit Own Schedule', description: 'Can edit own schedule', category: 'schedule' },
  { id: 'schedule.assign', name: 'Assign Schedules', description: 'Can assign jobs to schedules', category: 'schedule' },

  // Finance
  { id: 'finance.view', name: 'View Finance', description: 'Can view financial data', category: 'finance' },
  { id: 'finance.edit', name: 'Edit Finance', description: 'Can edit financial records', category: 'finance' },
  { id: 'finance.payments', name: 'Process Payments', description: 'Can process payments', category: 'finance' },

  // Automation
  { id: 'automation.view', name: 'View Automation', description: 'Can view automation rules', category: 'automation' },
  { id: 'automation.edit', name: 'Edit Automation', description: 'Can edit automation rules', category: 'automation' },
  { id: 'automation.create', name: 'Create Automation', description: 'Can create automation rules', category: 'automation' },

  // Communication
  { id: 'communication.send', name: 'Send Communications', description: 'Can send messages/emails', category: 'settings' },
  { id: 'communication.view', name: 'View Communications', description: 'Can view communication history', category: 'settings' },
  { id: 'communication.view.assigned', name: 'View Assigned Communications', description: 'Can view communications for assigned work', category: 'settings' },
];
