import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";
import { setupAuthErrorHandler } from "@/utils/auth-fix";
import { suppressSMSErrors } from "@/utils/suppressSMSErrors";
import authMonitor from "@/utils/auth-monitor.js?raw";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Critical pages (loaded immediately)
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";

// Lazy load all other pages
const TestDashboard = lazy(() => import("@/pages/TestDashboard"));
const TestPage = lazy(() => import("@/pages/TestPage"));
const JobsPageOptimized = lazy(() => import("@/pages/JobsPageOptimized"));
const JobDetailsPage = lazy(() => import("@/pages/JobDetailsPage"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("@/pages/ClientDetailPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const FinancePage = lazy(() => import("@/pages/FinancePage"));
const ConnectCenterPageOptimized = lazy(() => import("@/pages/ConnectCenterPageOptimized"));
const AiCenterPage = lazy(() => import("@/pages/AiCenterPage"));
const AutomationsPage = lazy(() => import("@/pages/AutomationsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const TeamManagementPage = lazy(() => import("@/pages/TeamManagementPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ProfileCompanyPage = lazy(() => import("@/pages/ProfileCompanyPage"));
const ConfigurationPage = lazy(() => import("@/pages/ConfigurationPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const IntegrationsPage = lazy(() => import("@/pages/IntegrationsPage"));
const PhoneNumbersPage = lazy(() => import("@/pages/PhoneNumbersPage"));
const PhoneNumbersSettingsPage = lazy(() => import("@/pages/settings/PhoneNumbersSettingsPage"));
const PhoneManagementPage = lazy(() => import("@/pages/PhoneManagementPage"));
const EstimatesPage = lazy(() => import("@/pages/EstimatesPage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const AdminRolesPage = lazy(() => import("@/pages/AdminRolesPage"));
const TeamMemberProfilePage = lazy(() => import("@/pages/TeamMemberProfilePage"));
const AcceptInvitationPage = lazy(() => import("@/pages/AcceptInvitationPage"));
const ClientPortal = lazy(() => import("@/pages/ClientPortal"));
const TestPortalAccessPage = lazy(() => import("@/pages/TestPortalAccessPage"));
const EstimatePortal = lazy(() => import("@/pages/EstimatePortal"));
const InvoicePortal = lazy(() => import("@/pages/InvoicePortal"));