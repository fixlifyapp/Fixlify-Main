
import { useCallback } from "react";
import { useRBAC } from "@/components/auth/RBACProvider";
import { UserRole } from "@/components/auth/types";

export const usePermissions = () => {
  const { hasPermission, hasRole, currentUser } = useRBAC();

  // Job permissions
  const canViewAllJobs = () => hasPermission("jobs.view.all");
  const canViewAssignedJobs = () => hasPermission("jobs.view.assigned");
  const canEditJobs = () => hasPermission("jobs.edit.all") || hasPermission("jobs.edit.assigned");
  const canCreateJobs = () => hasPermission("jobs.create");
  const canDeleteJobs = () => hasPermission("jobs.delete");
  const canAssignJobs = () => hasPermission("jobs.assign");

  // Client permissions
  const canViewAllClients = () => hasPermission("clients.view.all");
  const canViewAssignedClients = () => hasPermission("clients.view.assigned");
  const canEditClients = () => hasPermission("clients.edit");
  const canCreateClients = () => hasPermission("clients.create");
  const canDeleteClients = () => hasPermission("clients.delete");

  // Estimate permissions
  const canViewAllEstimates = () => hasPermission("estimates.view.all");
  const canViewAssignedEstimates = () => hasPermission("estimates.view.assigned");
  const canEditEstimates = () => hasPermission("estimates.edit");
  const canCreateEstimates = () => hasPermission("estimates.create");
  const canDeleteEstimates = () => hasPermission("estimates.delete");
  const canSendEstimates = () => hasPermission("estimates.send");

  // Invoice permissions
  const canViewAllInvoices = () => hasPermission("invoices.view.all");
  const canViewAssignedInvoices = () => hasPermission("invoices.view.assigned");
  const canEditInvoices = () => hasPermission("invoices.edit");
  const canCreateInvoices = () => hasPermission("invoices.create");
  const canDeleteInvoices = () => hasPermission("invoices.delete");
  const canSendInvoices = () => hasPermission("invoices.send");

  // User management permissions
  const canViewUsers = () => hasPermission("users.view");
  const canEditUsers = () => hasPermission("users.edit");
  const canCreateUsers = () => hasPermission("users.create");
  const canDeleteUsers = () => hasPermission("users.delete");
  const canAssignRoles = () => hasPermission("users.roles.assign");

  // Product permissions
  const canViewProducts = () => hasPermission("products.view");
  const canEditProducts = () => hasPermission("products.edit");
  const canCreateProducts = () => hasPermission("products.create");
  const canDeleteProducts = () => hasPermission("products.delete");

  // Schedule permissions
  const canViewAllSchedules = () => hasPermission("schedule.view.all");
  const canViewOwnSchedule = () => hasPermission("schedule.view.own");
  const canEditSchedules = () => hasPermission("schedule.edit");
  const canEditOwnSchedule = () => hasPermission("schedule.edit.own");
  const canAssignSchedules = () => hasPermission("schedule.assign");

  // Report permissions
  const canViewAllReports = () => hasPermission("reports.view.all");
  const canViewAssignedReports = () => hasPermission("reports.view.assigned");
  const canViewOwnReports = () => hasPermission("reports.view.own");
  const canCreateReports = () => hasPermission("reports.create");
  const canExportReports = () => hasPermission("reports.export");

  // Finance permissions
  const canViewFinance = () => hasPermission("finance.view");
  const canEditFinance = () => hasPermission("finance.edit");
  const canProcessPayments = () => hasPermission("finance.payments");

  // Role checks
  const isAdmin = () => hasRole("admin");
  const isManager = () => hasRole("manager");
  const isDispatcher = () => hasRole("dispatcher");
  const isTechnician = () => hasRole("technician");
  const isAdminOrManager = () => hasRole(["admin", "manager"]);

  // Helper functions for UI logic - memoized to prevent infinite loops in dependent hooks
  const getJobViewScope = useCallback(() => {
    if (hasPermission("jobs.view.all")) return "all";
    if (hasPermission("jobs.view.assigned")) return "assigned";
    return "none";
  }, [hasPermission]);

  const getClientViewScope = useCallback(() => {
    if (hasPermission("clients.view.all")) return "all";
    if (hasPermission("clients.view.assigned")) return "assigned";
    return "none";
  }, [hasPermission]);

  const getEstimateViewScope = useCallback(() => {
    if (hasPermission("estimates.view.all")) return "all";
    if (hasPermission("estimates.view.assigned")) return "assigned";
    return "none";
  }, [hasPermission]);

  const getInvoiceViewScope = useCallback(() => {
    if (hasPermission("invoices.view.all")) return "all";
    if (hasPermission("invoices.view.assigned")) return "assigned";
    return "none";
  }, [hasPermission]);

  return {
    // Job permissions
    canViewAllJobs,
    canViewAssignedJobs,
    canEditJobs,
    canCreateJobs,
    canDeleteJobs,
    canAssignJobs,

    // Client permissions
    canViewAllClients,
    canViewAssignedClients,
    canEditClients,
    canCreateClients,
    canDeleteClients,

    // Estimate permissions
    canViewAllEstimates,
    canViewAssignedEstimates,
    canEditEstimates,
    canCreateEstimates,
    canDeleteEstimates,
    canSendEstimates,

    // Invoice permissions
    canViewAllInvoices,
    canViewAssignedInvoices,
    canEditInvoices,
    canCreateInvoices,
    canDeleteInvoices,
    canSendInvoices,

    // User management permissions
    canViewUsers,
    canEditUsers,
    canCreateUsers,
    canDeleteUsers,
    canAssignRoles,

    // Product permissions
    canViewProducts,
    canEditProducts,
    canCreateProducts,
    canDeleteProducts,

    // Schedule permissions
    canViewAllSchedules,
    canViewOwnSchedule,
    canEditSchedules,
    canEditOwnSchedule,
    canAssignSchedules,

    // Report permissions
    canViewAllReports,
    canViewAssignedReports,
    canViewOwnReports,
    canCreateReports,
    canExportReports,

    // Finance permissions
    canViewFinance,
    canEditFinance,
    canProcessPayments,

    // Role checks
    isAdmin,
    isManager,
    isDispatcher,
    isTechnician,
    isAdminOrManager,

    // Helper functions
    getJobViewScope,
    getClientViewScope,
    getEstimateViewScope,
    getInvoiceViewScope,

    // Direct access to RBAC
    hasPermission,
    hasRole,
    currentUser,
  };
};
