import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Home,
  Receipt,
  History,
  Menu,
  X,
  ChevronRight,
  Download,
  Eye,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Sparkles,
  Shield,
  Zap,
  Award,
  Star,
  Activity,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Banknote,
  Building2,
  Wallet,
  Copy,
  ExternalLink,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClientPortalHeader } from "@/components/portal/ClientPortalHeader";
import { ClientInfoCard } from "@/components/portal/ClientInfoCard";
import { DashboardStats } from "@/components/portal/DashboardStats";
import { DocumentList } from "@/components/portal/DocumentList";
import ClientPortalFooter from "@/components/portal/ClientPortalFooter";
import { cn } from "@/lib/utils";

interface PortalData {
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    business_hours?: string;
  } | null;
  jobs: any[];
  estimates: any[];
  invoices: any[];
  payments?: any[];
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
  totals?: {
    estimates: {
      count: number;
      value: number;
    };
    invoices: {
      count: number;
      value: number;
    };
    paid: {
      count: number;
      value: number;
    };
    pending: {
      count: number;
      value: number;
    };
  };
}

const ClientPortal = () => {
  const { accessToken } = useParams();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ type: 'estimate' | 'invoice'; data: any } | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const loadedRef = useRef(false);
  const trackedDocumentsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Prevent double-loading in React Strict Mode
    if (loadedRef.current) return;
    loadedRef.current = true;
    validateAndLoadPortal();
  }, [accessToken]);

  // Track document views when a document is selected
  useEffect(() => {
    const trackDocumentView = async () => {
      if (!selectedDocument || !accessToken) return;

      const docId = selectedDocument.data.id;
      // Don't track the same document twice in this session
      if (trackedDocumentsRef.current.has(docId)) return;

      trackedDocumentsRef.current.add(docId);

      try {
        console.log(`👁️ Tracking view for ${selectedDocument.type}:`, docId);

        await supabase.functions.invoke('portal-track-view', {
          body: {
            accessToken,
            documentType: selectedDocument.type,
            documentId: docId
          }
        });

        console.log('✅ Document view tracked');
      } catch (error) {
        console.warn('Failed to track document view:', error);
        // Don't show error to user - this is a background operation
      }
    };

    trackDocumentView();
  }, [selectedDocument, accessToken]);

  const validateAndLoadPortal = async () => {
    if (!accessToken) {
      setError("No access token provided");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Loading portal data with token:", accessToken);

      // Load portal data using the portal data function
      const { data: portalDataResponse, error: portalError } = await supabase.functions.invoke(
        'portal-data',
        {
          body: { accessToken }
        }
      );

      if (portalError) {
        console.error("❌ Portal data loading failed:", portalError);
        setError("Failed to load portal data");
        return;
      }

      if (!portalDataResponse) {
        setError("No portal data available");
        return;
      }

      console.log("✅ Portal data loaded:", portalDataResponse);
      setPortalData(portalDataResponse);
    } catch (error) {
      console.error("❌ Error loading portal:", error);
      setError("Failed to load portal data");
    } finally {
      setLoading(false);
    }
  };

  // Approve estimate function
  const handleApproveEstimate = async () => {
    if (!selectedDocument || selectedDocument.type !== 'estimate') return;

    setActionLoading(true);
    try {
      console.log("✅ Approving estimate:", selectedDocument.data.id);

      // Call the portal-approve-estimate edge function
      const { data, error: approveError } = await supabase.functions.invoke(
        'portal-approve-estimate',
        {
          body: {
            accessToken,
            estimateId: selectedDocument.data.id
          }
        }
      );

      if (approveError) {
        console.error("❌ Approve error:", approveError);
        toast.error("Failed to approve estimate. Please try again.");
        return;
      }

      // Update local state
      setSelectedDocument({
        ...selectedDocument,
        data: { ...selectedDocument.data, status: 'approved' }
      });

      // Update the estimates list in portalData
      if (portalData) {
        const updatedEstimates = portalData.estimates.map(est =>
          est.id === selectedDocument.data.id ? { ...est, status: 'approved' } : est
        );
        setPortalData({ ...portalData, estimates: updatedEstimates });
      }

      toast.success("Estimate approved successfully! The service provider has been notified.");
    } catch (error) {
      console.error("❌ Error approving estimate:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Decline estimate function
  const handleDeclineEstimate = async () => {
    if (!selectedDocument || selectedDocument.type !== 'estimate') return;

    setActionLoading(true);
    try {
      console.log("❌ Declining estimate:", selectedDocument.data.id);

      // Call the portal-decline-estimate edge function
      const { data, error: declineError } = await supabase.functions.invoke(
        'portal-decline-estimate',
        {
          body: {
            accessToken,
            estimateId: selectedDocument.data.id,
            reason: declineReason.trim() || undefined
          }
        }
      );

      if (declineError) {
        console.error("❌ Decline error:", declineError);
        toast.error("Failed to decline estimate. Please try again.");
        return;
      }

      // Update local state
      setSelectedDocument({
        ...selectedDocument,
        data: { ...selectedDocument.data, status: 'declined' }
      });

      // Update the estimates list in portalData
      if (portalData) {
        const updatedEstimates = portalData.estimates.map(est =>
          est.id === selectedDocument.data.id ? { ...est, status: 'declined' } : est
        );
        setPortalData({ ...portalData, estimates: updatedEstimates });
      }

      setShowDeclineDialog(false);
      setDeclineReason("");
      toast.success("Estimate declined. The service provider has been notified.");
    } catch (error) {
      console.error("❌ Error declining estimate:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'sent':
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'converted':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateTotals = () => {
    if (portalData?.totals) {
      return portalData.totals;
    }

    const estimates = portalData?.estimates || [];
    const invoices = portalData?.invoices || [];

    return {
      estimates: {
        count: estimates.length,
        value: estimates.reduce((sum, est) => sum + (parseFloat(est.total?.toString() || '0')), 0)
      },
      invoices: {
        count: invoices.length,
        value: invoices.reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0')), 0)
      },
      paid: {
        count: invoices.filter(inv => inv.payment_status === 'paid').length,
        value: invoices.filter(inv => inv.payment_status === 'paid')
          .reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0')), 0)
      },
      pending: {
        count: invoices.filter(inv => inv.payment_status !== 'paid').length
      }
    };
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'estimates', label: 'Estimates', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'history', label: 'History', icon: History },
  ];

  if (loading) {
    return (
      <div className="min-h-screen portal-3d-bg flex items-center justify-center p-4 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            {/* 3D spinning loader */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 animate-ping opacity-20"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 animate-ping animation-delay-200 opacity-20"></div>
            </div>
            <div className="relative glass-purple rounded-3xl p-8 shadow-xl">
              <Clock className="h-12 w-12 animate-spin mx-auto text-purple-600 relative z-10" />
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-800 font-medium">Loading your portal...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen portal-3d-bg flex items-center justify-center p-4 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        
        <Card className="w-full max-w-md shadow-2xl border-0 glass-purple card-3d">
          <CardContent className="text-center p-8">
            <div className="h-20 w-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-8 text-lg">{error || "Unable to access portal"}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover-lift"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totals = calculateTotals();
  const recentActivity = [...portalData.estimates, ...portalData.invoices]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col portal-3d-bg portal-scrollbar overflow-x-hidden">
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>
      
      {/* Modern Header */}
      <header className="glass-purple sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-purple-700 hover:bg-purple-100/50">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px] glass-purple">
                  <nav className="mt-8">
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                            activeTab === item.id
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                              : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <span className="hidden sm:inline">Client Portal</span>
                  <span className="sm:hidden">Portal</span>
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">Welcome, {portalData.client.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-md px-2 sm:px-3">
                <Shield className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Secure Portal</span>
              </Badge>
              <span className="text-xs text-gray-500 hidden sm:inline">Powered by</span>
              <span className="text-sm font-bold gradient-text">Fixlify</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 glass-purple shadow-xl sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                      : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {activeTab === item.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Premium Features */}
            <div className="mt-8 p-4 border-gradient rounded-xl">
              <div className="border-gradient-inner p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-600 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-900">Premium Features</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Access all your documents and payment history</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>24/7 Portal Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Secure Document Storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Online Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Client Info Card */}
          <Card className="mb-6 glass-purple card-3d">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{portalData.client.name}</h2>
                  <p className="text-gray-600">{portalData.client.email}</p>
                  {portalData.client.phone && (
                    <p className="text-gray-600">{portalData.client.phone}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-md">
                    <Award className="h-3 w-3 mr-1" />
                    Valued Client
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
                    <Calendar className="h-3 w-3 mr-1" />
                    Member since {new Date().getFullYear()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid with 3D Cards - Clickable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                  className="glass-purple card-3d cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('estimates')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Total Estimates</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totals.estimates.count}</p>
                        <p className="text-sm text-purple-600 mt-1">{formatCurrency(totals.estimates.value)}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click to view all estimates →</p>
                  </CardContent>
                </Card>

                <Card
                  className="glass-purple card-3d cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('invoices')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Total Invoices</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totals.invoices.count}</p>
                        <p className="text-sm text-green-600 mt-1">{formatCurrency(totals.invoices.value)}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Receipt className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-green-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click to view all invoices →</p>
                  </CardContent>
                </Card>

                <Card
                  className="glass-purple card-3d cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('invoices')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Paid</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totals.paid.count}</p>
                        <p className="text-sm text-blue-600 mt-1">{formatCurrency(totals.paid.value)}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click to view paid invoices →</p>
                  </CardContent>
                </Card>

                <Card
                  className="glass-purple card-3d cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('invoices')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Pending</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totals.pending.count}</p>
                        <p className="text-sm text-orange-600 mt-1">Awaiting payment</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-orange-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click to view pending invoices →</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="glass-purple card-3d">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <span className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      Recent Activity
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('history')}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((item: any) => {
                        const isEstimate = 'estimate_number' in item;
                        const total = parseFloat(item.total?.toString() || '0');
                        const documentNumber = isEstimate ? item.estimate_number : item.invoice_number;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedDocument({ type: isEstimate ? 'estimate' : 'invoice', data: item })}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center shadow-md",
                                isEstimate
                                  ? "bg-gradient-to-br from-purple-500 to-purple-700"
                                  : "bg-gradient-to-br from-green-500 to-green-700"
                              )}>
                                {isEstimate ?
                                  <FileText className="h-6 w-6 text-white" /> :
                                  <Receipt className="h-6 w-6 text-white" />
                                }
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                  {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                                </p>
                                <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{formatCurrency(total)}</p>
                                <Badge className={cn("text-xs", getStatusColor(item.status || item.payment_status))}>
                                  {getStatusIcon(item.status || item.payment_status)}
                                  <span className="ml-1">{item.status || item.payment_status || 'Draft'}</span>
                                </Badge>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-20 w-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="h-10 w-10 text-purple-400" />
                      </div>
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'estimates' && (
            <div className="glass-purple rounded-2xl p-1">
              <DocumentList
                title="Your Estimates"
                documents={portalData.estimates}
                documentType="estimate"
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                permissions={portalData.permissions}
                onViewDocument={(doc, type) => setSelectedDocument({ type, data: doc })}
              />
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="glass-purple rounded-2xl p-1">
              <DocumentList
                title="Your Invoices"
                documents={portalData.invoices}
                documentType="invoice"
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                permissions={portalData.permissions}
                onViewDocument={(doc, type) => setSelectedDocument({ type, data: doc })}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <Card className="glass-purple card-3d">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                    <History className="h-6 w-6 text-white" />
                  </div>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...portalData.estimates, ...portalData.invoices]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item: any) => {
                      const isEstimate = 'estimate_number' in item;
                      const total = parseFloat(item.total?.toString() || '0');
                      const documentNumber = isEstimate ? item.estimate_number : item.invoice_number;
                      
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white/50 hover:bg-white/70 transition-all cursor-pointer gap-4 hover-lift"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg",
                              isEstimate 
                                ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                                : "bg-gradient-to-br from-green-500 to-green-700"
                            )}>
                              {isEstimate ? 
                                <FileText className="h-6 w-6 text-white" /> : 
                                <Receipt className="h-6 w-6 text-white" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                              </p>
                              <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-lg">{formatCurrency(total)}</p>
                              <Badge className={cn("text-xs", getStatusColor(item.status || item.payment_status))}>
                                {getStatusIcon(item.status || item.payment_status)}
                                <span className="ml-1">{item.status || item.payment_status || 'Draft'}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Footer */}
      <ClientPortalFooter companyData={portalData.company} />

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => {
        setSelectedDocument(null);
        setShowPaymentOptions(false);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
                    selectedDocument.type === 'estimate'
                      ? "bg-gradient-to-br from-purple-500 to-purple-700"
                      : "bg-gradient-to-br from-green-500 to-green-700"
                  )}>
                    {selectedDocument.type === 'estimate' ?
                      <FileText className="h-5 w-5 text-white" /> :
                      <Receipt className="h-5 w-5 text-white" />
                    }
                  </div>
                  <div>
                    <span className="text-lg font-bold">
                      {selectedDocument.type === 'estimate' ? 'Estimate' : 'Invoice'} #
                      {selectedDocument.type === 'estimate'
                        ? selectedDocument.data.estimate_number
                        : selectedDocument.data.invoice_number}
                    </span>
                    <Badge className={cn("ml-3 text-xs", getStatusColor(selectedDocument.data.status || selectedDocument.data.payment_status))}>
                      {selectedDocument.data.status || selectedDocument.data.payment_status || 'Draft'}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Document Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedDocument.data.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedDocument.type === 'invoice' ? 'Due Date' : 'Valid Until'}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedDocument.data.due_date
                          ? formatDate(selectedDocument.data.due_date)
                          : selectedDocument.data.valid_until
                            ? formatDate(selectedDocument.data.valid_until)
                            : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                {(() => {
                  // Parse items - handle string, array, items or line_items field
                  let items = selectedDocument.data.items || selectedDocument.data.line_items || [];
                  if (typeof items === 'string') {
                    try {
                      items = JSON.parse(items);
                    } catch {
                      items = [];
                    }
                  }
                  const docItems = Array.isArray(items) ? items : [];

                  if (docItems.length === 0) return null;

                  return (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        Items & Services
                      </h4>
                      <div className="space-y-2">
                        {docItems.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.description || item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.unit_price || item.price || 0)}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency((item.quantity || 1) * (item.unit_price || item.price || 0))}
                          </p>
                        </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(parseFloat(selectedDocument.data.total?.toString() || '0'))}
                    </span>
                  </div>
                  {selectedDocument.type === 'invoice' && selectedDocument.data.amount_paid > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Amount Paid</span>
                        <span className="text-green-600 font-medium">
                          -{formatCurrency(parseFloat(selectedDocument.data.amount_paid?.toString() || '0'))}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-orange-600">Balance Due</span>
                        <span className="text-orange-600">
                          {formatCurrency(
                            parseFloat(selectedDocument.data.total?.toString() || '0') -
                            parseFloat(selectedDocument.data.amount_paid?.toString() || '0')
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedDocument.data.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600 text-sm">{selectedDocument.data.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedDocument(null);
                      setShowPaymentOptions(false);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  {selectedDocument.type === 'invoice' && selectedDocument.data.payment_status !== 'paid' && portalData?.permissions.make_payments && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      onClick={() => setShowPaymentOptions(true)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  {selectedDocument.type === 'estimate' && selectedDocument.data.status !== 'approved' && selectedDocument.data.status !== 'declined' && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowDeclineDialog(true)}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        onClick={handleApproveEstimate}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </Button>
                    </>
                  )}
                  {selectedDocument.type === 'estimate' && selectedDocument.data.status === 'approved' && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-700 font-medium">Approved</span>
                    </div>
                  )}
                  {selectedDocument.type === 'estimate' && selectedDocument.data.status === 'declined' && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg border border-red-200">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-700 font-medium">Declined</span>
                    </div>
                  )}
                </div>

                {/* Payment Options Panel */}
                {showPaymentOptions && selectedDocument.type === 'invoice' && (
                  <div className="mt-6 border-t pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        Payment Options
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPaymentOptions(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* E-Transfer Option */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-blue-900">Interac e-Transfer</h5>
                            <p className="text-sm text-blue-700 mt-1">Send payment directly to our email</p>
                            {portalData?.company?.email && (
                              <div className="mt-3 flex items-center gap-2">
                                <code className="bg-white px-3 py-1.5 rounded-lg text-sm font-mono text-blue-800 border border-blue-200">
                                  {portalData.company.email}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                  onClick={() => copyToClipboard(portalData.company?.email || '', 'Email')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-blue-600 mt-2">
                              Reference: Invoice #{selectedDocument.type === 'invoice' ? selectedDocument.data.invoice_number : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cash Option */}
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Banknote className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-green-900">Cash Payment</h5>
                            <p className="text-sm text-green-700 mt-1">Pay in person at service completion</p>
                            <p className="text-xs text-green-600 mt-2">
                              Contact us to arrange payment pickup or pay directly to technician
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Check Option */}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Receipt className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-purple-900">Check / Money Order</h5>
                            <p className="text-sm text-purple-700 mt-1">Mail your check to our address</p>
                            {portalData?.company?.name && (
                              <p className="text-xs text-purple-600 mt-2">
                                Make payable to: <strong>{portalData.company.name}</strong>
                              </p>
                            )}
                            {portalData?.company?.address && (
                              <p className="text-xs text-purple-600">
                                {portalData.company.address}
                                {portalData.company.city && `, ${portalData.company.city}`}
                                {portalData.company.state && `, ${portalData.company.state}`}
                                {portalData.company.zip && ` ${portalData.company.zip}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact for Questions */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                          Questions about payment?{' '}
                          {portalData?.company?.phone ? (
                            <a
                              href={`tel:${portalData.company.phone}`}
                              className="text-purple-600 font-medium hover:underline"
                            >
                              Call {portalData.company.phone}
                            </a>
                          ) : portalData?.company?.email ? (
                            <a
                              href={`mailto:${portalData.company.email}`}
                              className="text-purple-600 font-medium hover:underline"
                            >
                              Email us
                            </a>
                          ) : (
                            <span>Contact us</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Estimate Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={(open) => {
        setShowDeclineDialog(open);
        if (!open) setDeclineReason("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Decline Estimate
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this estimate? The service provider will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reason for declining (optional)
              </label>
              <Textarea
                placeholder="Let us know why you're declining this estimate..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                This feedback helps us improve our services.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeclineDialog(false);
                setDeclineReason("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineEstimate}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Estimate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortal;