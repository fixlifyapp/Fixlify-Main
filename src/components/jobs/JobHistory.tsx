
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, FileText, Filter, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useEnhancedJobHistory } from "@/hooks/useEnhancedJobHistory";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import { useRBAC } from "@/components/auth/RBACProvider";

interface JobHistoryProps {
  jobId: string;
}

export const JobHistory = ({ jobId }: JobHistoryProps) => {
  // Use enhanced hook only - it includes useJobHistory internally (prevents double fetch)
  const { historyItems, isLoading, logUserAction } = useEnhancedJobHistory(jobId);
  const { hasPermission } = useRBAC();
  const [filter, setFilter] = useState<'all' | 'payments' | 'documents' | 'status' | 'ai-conversations'>('all');
  const [showRestrictedItems, setShowRestrictedItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'status-change':
        return <Clock className="h-4 w-4" />;
      case 'payment':
        return <span className="text-green-600">💰</span>;
      case 'estimate':
      case 'invoice':
        return <span className="text-blue-600">📄</span>;
      case 'ai-conversation':
      case 'ai-message':
        return <span className="text-purple-600">🤖</span>;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 text-blue-800';
      case 'status-change':
        return 'bg-green-100 text-green-800';
      case 'estimate':
        return 'bg-purple-100 text-purple-800';
      case 'invoice':
        return 'bg-orange-100 text-orange-800';
      case 'payment':
        return 'bg-emerald-100 text-emerald-800';
      case 'ai-conversation':
      case 'ai-message':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = historyItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'payments' && item.type === 'payment') return true;
    if (filter === 'documents' && (item.type === 'estimate' || item.type === 'invoice')) return true;
    if (filter === 'status' && item.type === 'status-change') return true;
    if (filter === 'ai-conversations' && (item.type === 'ai-conversation' || item.type === 'ai-message')) return true;
    return false;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'payments' | 'documents' | 'status' | 'ai-conversations');
    setCurrentPage(1); // Reset to first page when filter changes
    logUserAction('History Filter Changed', { filter: value });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    logUserAction('History Page Changed', { page: newPage });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job History ({filteredItems.length})
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="status">Status Changes</SelectItem>
                <SelectItem value="ai-conversations">AI Conversations</SelectItem>
              </SelectContent>
            </Select>
            
            {hasPermission('admin') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRestrictedItems(!showRestrictedItems)}
                className="flex items-center gap-2"
              >
                {showRestrictedItems ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showRestrictedItems ? 'Hide' : 'Show'} Internal
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">
              {filter === 'all' ? 'No history yet' : `No ${filter} history`}
            </p>
            <p className="text-sm">Activity will appear here as the job progresses</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <Badge className={getTypeBadgeColor(item.type)}>
                      {item.type}
                    </Badge>
                    {item.visibility === 'restricted' && (
                      <Badge variant="outline" className="text-xs">
                        Internal
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.user_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.user_name}
                      </span>
                    )}
                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
