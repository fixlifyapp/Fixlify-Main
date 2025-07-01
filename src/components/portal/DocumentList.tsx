import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  Eye, 
  Download, 
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileDown,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DocumentListProps {
  title: string;
  documents: any[];
  documentType: 'estimate' | 'invoice';
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  permissions: {
    make_payments: boolean;
  };
}

export const DocumentList = ({
  title,
  documents,
  documentType,
  formatDate,
  formatCurrency,
  getStatusColor,
  permissions
}: DocumentListProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
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

  const Icon = documentType === 'estimate' ? FileText : Receipt;
  const sortedDocuments = documents?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-gray-900">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              documentType === 'estimate' 
                ? "bg-purple-100" 
                : "bg-green-100"
            )}>
              <Icon className={cn(
                "h-6 w-6",
                documentType === 'estimate' ? "text-purple-600" : "text-green-600"
              )} />
            </div>
            <span className="text-xl">{title}</span>
            <Badge className="ml-2 bg-gray-100 text-gray-700 border-0">
              {documents?.length || 0}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDocuments.length > 0 ? (
          <div className="space-y-4">
            {sortedDocuments.map((doc: any) => {
              const total = parseFloat(doc.total?.toString() || '0');
              const isExpanded = expandedItems.includes(doc.id);
              const documentNumber = documentType === 'estimate' ? doc.estimate_number : doc.invoice_number;
              const isPaid = doc.status === 'paid' || doc.payment_status === 'paid';
              const isOverdue = documentType === 'invoice' && doc.due_date && 
                new Date(doc.due_date) < new Date() && !isPaid;
              
              return (
                <div
                  key={doc.id}
                  className={cn(
                    "bg-gray-50 rounded-xl transition-all duration-300",
                    isExpanded ? "shadow-sm" : "hover:bg-gray-100"
                  )}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(doc.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-5 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-4 text-left">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                              documentType === 'estimate' 
                                ? "bg-purple-100" 
                                : "bg-green-100"
                            )}>
                              <Icon className={cn(
                                "h-6 w-6",
                                documentType === 'estimate' ? "text-purple-600" : "text-green-600"
                              )} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                                {documentType.charAt(0).toUpperCase() + documentType.slice(1)} #{documentNumber}
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(doc.created_at)}
                                </span>
                                {documentType === 'invoice' && doc.due_date && !isPaid && (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    • Due {formatDate(doc.due_date)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(total)}
                              </p>
                              <Badge className={cn("text-xs", getStatusColor(doc.status || doc.payment_status))}>
                                {getStatusIcon(doc.status || doc.payment_status)}
                                <span className="ml-1">{doc.status || doc.payment_status || 'Draft'}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-5 pb-5 space-y-4 border-t border-gray-200">
                        {doc.description && (
                          <div className="pt-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Line Items Preview */}
                        {doc.line_items && doc.line_items.length > 0 && (
                          <div className="bg-white rounded-lg p-4 space-y-2">
                            <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-gray-500" />
                              Items
                            </h5>
                            <div className="space-y-2">
                              {doc.line_items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{item.description || item.name}</span>
                                  <span className="text-gray-900 font-medium">
                                    {formatCurrency(item.total || item.amount || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">No {title.toLowerCase()} yet</p>
            <p className="text-sm text-gray-500 mt-2">
              {documentType === 'estimate' 
                ? "Your estimates will appear here when created"
                : "Your invoices will appear here when created"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};