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

  const handlePayment = async (document: any) => {
    const actionKey = `pay-${document.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      console.log(`💳 Processing payment for invoice:`, document);
      
      // Show payment options
      toast.info("Payment processing integration coming soon! Contact us to make a payment.");
      
      // Open invoice view for now
      const viewUrl = `/invoice/${document.id}`;
      window.open(viewUrl, '_blank');
      
    } catch (error) {
      console.error(`Error processing payment:`, error);
      toast.error(`Failed to process payment`);
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
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
              documentType === 'estimate' 
                ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                : "bg-gradient-to-br from-green-500 to-emerald-500"
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">{title}</span>
            <Badge className="ml-2 bg-white/20 text-white border-0 backdrop-blur-sm">
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
                    "bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300",
                    isExpanded ? "shadow-2xl bg-white/10" : "hover:bg-white/10 hover:shadow-xl",
                    "group"
                  )}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(doc.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-5 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-4 text-left">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 group-hover:scale-110",
                              documentType === 'estimate' 
                                ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                                : "bg-gradient-to-br from-green-500 to-emerald-500"
                            )}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-white flex items-center gap-2 text-lg">
                                {documentType.charAt(0).toUpperCase() + documentType.slice(1)} #{documentNumber}
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-purple-200 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(doc.created_at)}
                                </span>
                                {documentType === 'invoice' && doc.due_date && !isPaid && (
                                  <span className="flex items-center gap-1 text-orange-400">
                                    • Due {formatDate(doc.due_date)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-white">
                                {formatCurrency(total)}
                              </p>
                              <Badge className={cn("text-xs backdrop-blur-sm", getStatusColor(doc.status || doc.payment_status))}>
                                {getStatusIcon(doc.status || doc.payment_status)}
                                <span className="ml-1">{doc.status || doc.payment_status || 'Draft'}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-purple-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-purple-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-5 pb-5 space-y-4 border-t border-white/10">
                        {doc.description && (
                          <div className="pt-4">
                            <p className="text-sm text-purple-200 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Line Items Preview */}
                        {doc.line_items && doc.line_items.length > 0 && (
                          <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <h5 className="text-sm font-medium text-white flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-purple-400" />
                              Items
                            </h5>
                            <div className="space-y-2">
                              {doc.line_items.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-purple-200">{item.description || item.name}</span>
                                  <span className="text-white font-medium">
                                    {formatCurrency(item.total || item.amount || 0)}
                                  </span>
                                </div>
                              ))}
                              {doc.line_items.length > 3 && (
                                <p className="text-sm text-purple-300">
                                  ... and {doc.line_items.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(doc)}
                            disabled={loadingActions[`view-${doc.id}`]}
                            className="flex-1 sm:flex-none bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
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
                            className="flex-1 sm:flex-none bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
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
                              className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30"
                              onClick={() => handlePayment(doc)}
                              disabled={loadingActions[`pay-${doc.id}`]}
                            >
                              {loadingActions[`pay-${doc.id}`] ? (
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4 mr-1" />
                              )}
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
          <div className="text-center py-16">
            <div className="h-20 w-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Icon className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-purple-200 font-medium text-lg">No {title.toLowerCase()} yet</p>
            <p className="text-sm text-purple-300 mt-2">
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