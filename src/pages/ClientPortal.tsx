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
  Calendar
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 bg-blue-200 rounded-full animate-ping opacity-20"></div>
            </div>
            <Clock className="h-12 w-12 animate-spin mx-auto text-blue-600 relative z-10" />
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading your portal...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error || "Unable to access portal"}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                  <nav className="mt-8">
                    <div className="space-y-1">
                      {navigationItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            activeTab === item.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Welcome, {portalData.client.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Powered by</span>
              <span className="text-sm font-semibold text-blue-600">Fixlify</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Client Info Card - Mobile Optimized */}
          <Card className="mb-6 shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{portalData.client.name}</h2>
                  <p className="text-sm text-gray-600">{portalData.client.email}</p>
                  {portalData.client.phone && (
                    <p className="text-sm text-gray-600">{portalData.client.phone}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
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
              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Estimates</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totals.estimates.count}</p>
                        <p className="text-sm text-blue-600 mt-1">{formatCurrency(totals.estimates.value)}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totals.invoices.count}</p>
                        <p className="text-sm text-green-600 mt-1">{formatCurrency(totals.invoices.value)}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Paid</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totals.paid.count}</p>
                        <p className="text-sm text-purple-600 mt-1">{formatCurrency(totals.paid.value)}</p>
                      </div>
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totals.pending.count}</p>
                        <p className="text-sm text-orange-600 mt-1">Awaiting payment</p>
                      </div>
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity - Mobile Optimized */}
              <Card className="border-0 shadow-sm">
              <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                  Recent Activity
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('history')}>
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
                            className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                isEstimate ? "bg-blue-100" : "bg-green-100"
                              )}>
                              {isEstimate ? 
                                  <FileText className="h-5 w-5 text-blue-600" /> : 
                                  <Receipt className="h-5 w-5 text-green-600" />
                              }
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                                </p>
                                <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
                              <Badge className={cn("text-xs", getStatusColor(item.status || item.payment_status))}>
                                {getStatusIcon(item.status || item.payment_status)}
                                <span className="ml-1">{item.status || item.payment_status || 'Draft'}</span>
                              </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No recent activity</p>
                    </div>
                  )}
              </CardContent>
            </Card>
            </div>
          )}

          {activeTab === 'estimates' && (
            <DocumentList
              title="Your Estimates"
              documents={portalData.estimates}
              documentType="estimate"
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              permissions={portalData.permissions}
            />
          )}

          {activeTab === 'invoices' && (
            <DocumentList
              title="Your Invoices"
              documents={portalData.invoices}
              documentType="invoice"
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              permissions={portalData.permissions}
            />
          )}

          {activeTab === 'history' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all cursor-pointer gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              isEstimate ? "bg-blue-100" : "bg-green-100"
                            )}>
                              {isEstimate ? 
                                <FileText className="h-5 w-5 text-blue-600" /> : 
                                <Receipt className="h-5 w-5 text-green-600" />
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
                              <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
                              <Badge className={cn("text-xs", getStatusColor(item.status || item.payment_status))}>
                                {getStatusIcon(item.status || item.payment_status)}
                                <span className="ml-1">{item.status || item.payment_status || 'Draft'}</span>
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
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
