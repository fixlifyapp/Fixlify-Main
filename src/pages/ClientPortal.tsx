import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ClientPortalHeader } from "@/components/portal/ClientPortalHeader";
import { ClientInfoCard } from "@/components/portal/ClientInfoCard";
import { DashboardStats } from "@/components/portal/DashboardStats";
import { DocumentList } from "@/components/portal/DocumentList";
import { ClientPortalFooter } from "@/components/portal/ClientPortalFooter";
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
  } | null;
  jobs: any[];
  estimates: any[];
  invoices: any[];
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

  useEffect(() => {
    validateAndLoadPortal();
  }, [accessToken]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            {/* 3D spinning loader */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping opacity-20"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping animation-delay-200 opacity-20"></div>
            </div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <Clock className="h-12 w-12 animate-spin mx-auto text-white relative z-10" />
            </div>
          </div>
          <p className="mt-6 text-xl text-white font-medium">Loading your portal...</p>
          <p className="text-sm text-purple-200 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-xl">
          <CardContent className="text-center p-8">
            <div className="h-20 w-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-purple-200 mb-8 text-lg">{error || "Unable to access portal"}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Modern Header with Glass Effect */}
      <header className="bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px] bg-slate-900/95 backdrop-blur-xl border-white/10">
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
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                              : "text-purple-200 hover:text-white hover:bg-white/10"
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
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                  Client Portal
                </h1>
                <p className="text-sm text-purple-200 hidden sm:block">Welcome, {portalData.client.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white shadow-lg shadow-purple-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Secure Portal
              </Badge>
              <span className="text-xs text-purple-200">Powered by</span>
              <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Fixlify</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Desktop Sidebar with Glass Effect */}
        <aside className="hidden lg:block w-64 bg-white/5 backdrop-blur-xl shadow-2xl min-h-[calc(100vh-4rem)] sticky top-16 border-r border-white/10">
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 transform scale-105"
                      : "text-purple-200 hover:text-white hover:bg-white/10"
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
            <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Premium Features</span>
              </div>
              <p className="text-xs text-purple-200 mb-3">Access all your documents and payment history</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>24/7 Portal Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Secure Document Storage</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Online Payments</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Client Info Card with 3D Effect */}
          <Card className="mb-6 shadow-2xl border-0 bg-white/10 backdrop-blur-xl overflow-hidden group hover:shadow-purple-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{portalData.client.name}</h2>
                  <p className="text-purple-200">{portalData.client.email}</p>
                  {portalData.client.phone && (
                    <p className="text-purple-200">{portalData.client.phone}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Valued Client
                  </Badge>
                  <Badge variant="outline" className="text-purple-200 border-purple-500/50">
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
              {/* Stats Grid with 3D Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-200">Total Estimates</p>
                        <p className="text-3xl font-bold text-white mt-2">{totals.estimates.count}</p>
                        <p className="text-sm text-blue-300 mt-1">{formatCurrency(totals.estimates.value)}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-200">Total Invoices</p>
                        <p className="text-3xl font-bold text-white mt-2">{totals.invoices.count}</p>
                        <p className="text-sm text-green-300 mt-1">{formatCurrency(totals.invoices.value)}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                        <Receipt className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-200">Paid</p>
                        <p className="text-3xl font-bold text-white mt-2">{totals.paid.count}</p>
                        <p className="text-sm text-purple-300 mt-1">{formatCurrency(totals.paid.value)}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-200">Pending</p>
                        <p className="text-3xl font-bold text-white mt-2">{totals.pending.count}</p>
                        <p className="text-sm text-orange-300 mt-1">Awaiting payment</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity with Glass Effect */}
              <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      Recent Activity
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('history')}
                      className="text-purple-200 hover:text-white hover:bg-white/10"
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
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110",
                                isEstimate 
                                  ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                                  : "bg-gradient-to-br from-green-500 to-emerald-500"
                              )}>
                                {isEstimate ? 
                                  <FileText className="h-6 w-6 text-white" /> : 
                                  <Receipt className="h-6 w-6 text-white" />
                                }
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                                </p>
                                <p className="text-sm text-purple-200">{formatDate(item.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white text-lg">{formatCurrency(total)}</p>
                              <Badge className={cn("text-xs backdrop-blur-sm", getStatusColor(item.status || item.payment_status))}>
                                {getStatusIcon(item.status || item.payment_status)}
                                <span className="ml-1">{item.status || item.payment_status || 'Draft'}</span>
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-20 w-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="h-10 w-10 text-purple-400" />
                      </div>
                      <p className="text-purple-200">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'estimates' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-1 shadow-2xl">
              <DocumentList
                title="Your Estimates"
                documents={portalData.estimates}
                documentType="estimate"
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                permissions={portalData.permissions}
              />
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-1 shadow-2xl">
              <DocumentList
                title="Your Invoices"
                documents={portalData.invoices}
                documentType="invoice"
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                permissions={portalData.permissions}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-pointer gap-4 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                              isEstimate 
                                ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                                : "bg-gradient-to-br from-green-500 to-emerald-500"
                            )}>
                              {isEstimate ? 
                                <FileText className="h-6 w-6 text-white" /> : 
                                <Receipt className="h-6 w-6 text-white" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                              </p>
                              <p className="text-sm text-purple-200">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="text-right">
                              <p className="font-bold text-white text-lg">{formatCurrency(total)}</p>
                              <Badge className={cn("text-xs backdrop-blur-sm", getStatusColor(item.status || item.payment_status))}>
                                {getStatusIcon(item.status || item.payment_status)}
                                <span className="ml-1">{item.status || item.payment_status || 'Draft'}</span>
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
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
    </div>
  );
};

export default ClientPortal;