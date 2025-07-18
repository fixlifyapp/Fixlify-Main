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
  Receipt,
  Loader2
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
      
      // Navigate directly to the document view page
      const viewUrl = `/${documentType}/${document.id}`;
      window.open(viewUrl, '_blank');
      
      toast.success(`Opening ${documentType}...`);
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
      
      // For now, show a message that download is coming soon
      // In production, this would generate a PDF and download it
      toast.info("PDF download feature coming soon! For now, you can view and print the document.");
      
      // Open the document in a new tab for printing
      const viewUrl = `/${documentType}/${document.id}`;
      window.open(viewUrl, '_blank');
      
    } catch (error) {
      console.error(`Error downloading ${documentType}:`, error);
      toast.error(`Failed to download ${documentType}`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
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
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
              documentType === 'estimate' 
                ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                : "bg-gradient-to-br from-green-500 to-green-700"
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">{title}</span>
            <Badge className="ml-2 bg-purple-100 text-purple-700 border-0">
              {documents?.length || 0}
            </Badge>
          </div>
          <Sparkles className="h-5 w-5 text-purple-400" />
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
                    "glass-purple rounded-xl transition-all duration-300",
                    isExpanded ? "shadow-xl" : "hover:shadow-lg",
                    "hover-lift"
                  )}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(doc.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-5 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-4 text-left">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                              documentType === 'estimate' 
                                ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                                : "bg-gradient-to-br from-green-500 to-green-700"
                            )}>
                              <Icon className="h-6 w-6 text-white" />
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
                                <ChevronUp className="h-5 w-5 text-purple-600" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-5 pb-5 space-y-4 border-t border-purple-100">
                        {doc.description && (
                          <div className="pt-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Line Items Preview */}
                        {doc.items && doc.items.length > 0 && (
                          <div className="bg-white/50 rounded-lg p-4 space-y-2">
                            <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-purple-500" />
                              Items
                            </h5>
                            <div className="space-y-2">
                              {doc.items
                                .filter((item: any) => 
                                  !item.name?.toLowerCase().includes('tax') && 
                                  !item.description?.toLowerCase().includes('tax')
                                )
                                .map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.description || item.name || `Item ${index + 1}`}</span>
                                    <span className="text-gray-900 font-medium">
                                      {formatCurrency(item.total || item.amount || 0)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                            {doc.tax_amount && (
                              <div className="pt-2 border-t border-purple-100">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Tax {doc.tax_rate ? `(${doc.tax_rate}%)` : ''}
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {formatCurrency(doc.tax_amount)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleView(doc)}
                            disabled={loadingActions[`view-${doc.id}`]}
                            className="btn-3d text-white"
                          >
                            {loadingActions[`view-${doc.id}`] ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
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
                            className="border-purple-300 text-purple-700 hover:bg-purple-50 hover-lift"
                          >
                            {loadingActions[`download-${doc.id}`] ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            Download
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-20 w-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Icon className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-gray-700 font-medium text-lg">No {title.toLowerCase()} yet</p>
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