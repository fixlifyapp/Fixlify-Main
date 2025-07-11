
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface Payment {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  method: 'credit-card' | 'cash' | 'check' | 'bank-transfer' | 'e-transfer';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  reference?: string;
  processingFee?: number;
}

interface PaymentTrackerProps {
  payments: Payment[];
  totalPayments: number;
  processingFees: number;
  failedPayments: number;
  onAddPayment: () => void;
  onRefundPayment: (id: string) => void;
  onExportPayments: () => void;
}

export const PaymentTracker = ({
  payments,
  totalPayments,
  processingFees,
  failedPayments,
  onAddPayment,
  onRefundPayment,
  onExportPayments
}: PaymentTrackerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit-card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const successRate = payments.length > 0 ? (completedPayments / payments.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(processingFees)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total fees paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(successRate)}%
            </div>
            <Progress value={successRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onExportPayments}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onAddPayment}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="e-transfer">E-Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment List */}
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || methodFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Record your first payment to get started"
                  }
                </p>
                {!searchTerm && methodFilter === "all" && statusFilter === "all" && (
                  <Button onClick={onAddPayment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <Card key={payment.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="font-medium">{payment.invoiceNumber}</span>
                          </div>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{payment.clientName}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span>Date: {new Date(payment.date).toLocaleDateString()}</span>
                            <span className="capitalize">Method: {payment.method.replace('-', ' ')}</span>
                            {payment.reference && <span>Ref: {payment.reference}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="text-lg font-semibold">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.processingFee && (
                          <div className="text-sm text-orange-600">
                            Fee: {formatCurrency(payment.processingFee)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {payment.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onRefundPayment(payment.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
