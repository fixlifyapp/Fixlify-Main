
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  Eye,
  Edit,
  Download,
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';
  dueDate: string;
  createdDate: string;
  paidAmount?: number;
}

interface InvoiceManagerProps {
  invoices: Invoice[];
  onCreateInvoice: () => void;
  onEditInvoice: (id: string) => void;
  onSendInvoice: (id: string) => void;
  onViewInvoice: (id: string) => void;
}

export const InvoiceManager = ({
  invoices,
  onCreateInvoice,
  onEditInvoice,
  onSendInvoice,
  onViewInvoice
}: InvoiceManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <DollarSign className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "pending" && ['sent', 'overdue', 'partial'].includes(invoice.status)) ||
                      (activeTab === "paid" && invoice.status === 'paid') ||
                      (activeTab === "draft" && invoice.status === 'draft');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getTabCounts = () => {
    return {
      all: invoices.length,
      pending: invoices.filter(i => ['sent', 'overdue', 'partial'].includes(i.status)).length,
      paid: invoices.filter(i => i.status === 'paid').length,
      draft: invoices.filter(i => i.status === 'draft').length
    };
  };

  const tabCounts = getTabCounts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Management
          </CardTitle>
          <Button onClick={onCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({tabCounts.paid})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({tabCounts.draft})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Create your first invoice to get started"
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={onCreateInvoice}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{invoice.number}</h4>
                            <Badge className={getStatusColor(invoice.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(invoice.status)}
                                <span className="capitalize">{invoice.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{invoice.clientName}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span>Created: {new Date(invoice.createdDate).toLocaleDateString()}</span>
                              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-lg font-semibold">
                            {formatCurrency(invoice.amount)}
                          </div>
                          {invoice.status === 'partial' && invoice.paidAmount && (
                            <div className="text-sm text-green-600">
                              {formatCurrency(invoice.paidAmount)} paid
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => onViewInvoice(invoice.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onEditInvoice(invoice.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button size="sm" onClick={() => onSendInvoice(invoice.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
