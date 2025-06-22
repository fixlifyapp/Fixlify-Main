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
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

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

  const handleView = async (document: any) => {
    const actionKey = `view-${document.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      console.log(`📄 Viewing ${documentType}:`, document);
      
      const { data, error } = await supabase.functions.invoke('document-viewer', {
        body: {
          documentType,
          documentId: document.id,
          documentNumber: documentType === 'estimate' ? document.estimate_number : document.invoice_number
        }
      });

      if (error) {
        console.error(`Error viewing ${documentType}:`, error);
        toast.error(`Failed to view ${documentType}`);
        return;
      }

      if (data?.viewUrl) {
        window.open(data.viewUrl, '_blank');
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} opened`);
      } else {
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} viewed`);
      }
    } catch (error) {
      console.error(`Error viewing ${documentType}:`, error);
      toast.error(`Failed to view ${documentType}`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDownload = async (document: any) => {
    const actionKey = `download-${document.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      console.log(`📥 Downloading ${documentType}:`, document);
      
      const { data, error } = await supabase.functions.invoke('download-document', {
        body: {
          documentType,
          documentId: document.id,
          documentNumber: documentType === 'estimate' ? document.estimate_number : document.invoice_number
        }
      });

      if (error) {
        console.error(`Error downloading ${documentType}:`, error);
        toast.error(`Failed to download ${documentType}`);
        return;
      }

      if (data?.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${documentType}-${documentType === 'estimate' ? document.estimate_number : document.invoice_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} downloaded`);
      } else {
        toast.error(`Download URL not available`);
      }
    } catch (error) {
      console.error(`Error downloading ${documentType}:`, error);
      toast.error(`Failed to download ${documentType}`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handlePayment = async (document: any) => {
    toast.info("Payment processing coming soon!");
    // TODO: Implement payment flow
  };

  const Icon = documentType === 'estimate' ? FileText : DollarSign;
  const sortedDocuments = documents?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <span>{title}</span>
            <Badge variant="secondary" className="ml-2">
              {documents?.length || 0}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDocuments.length > 0 ? (
          <div className="space-y-3">
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
                    "border rounded-lg transition-all duration-200",
                    isExpanded ? "shadow-md" : "hover:shadow-sm"
                  )}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(doc.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-4 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 text-left">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              documentType === 'estimate' ? "bg-blue-100" : "bg-green-100"
                            )}>
                              <Icon className={cn(
                                "h-5 w-5",
                                documentType === 'estimate' ? "text-blue-600" : "text-green-600"
                              )} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
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
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
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
                      <div className="px-4 pb-4 space-y-4 border-t">
                        {doc.description && (
                          <div className="pt-3">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Line Items Preview */}
                        {doc.line_items && doc.line_items.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">Items</h5>
                            <div className="space-y-1">
                              {doc.line_items.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{item.description || item.name}</span>
                                  <span className="text-gray-900 font-medium">
                                    {formatCurrency(item.total || item.amount || 0)}
                                  </span>
                                </div>
                              ))}
                              {doc.line_items.length > 3 && (
                                <p className="text-sm text-gray-500">
                                  ... and {doc.line_items.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(doc)}
                            disabled={loadingActions[`view-${doc.id}`]}
                            className="flex-1 sm:flex-none"
                          >
                            {loadingActions[`view-${doc.id}`] ? (
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4 mr-1" />
                            )}
                            View Details
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(doc)}
                            disabled={loadingActions[`download-${doc.id}`]}
                            className="flex-1 sm:flex-none"
                          >
                            {loadingActions[`download-${doc.id}`] ? (
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            Download
                          </Button>
                          
                          {documentType === 'invoice' && permissions.make_payments && !isPaid && (
                            <Button
                              size="sm"
                              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handlePayment(doc)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No {title.toLowerCase()} yet</p>
            <p className="text-sm text-gray-400 mt-1">
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
