
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, FileText, User, Phone } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "invoice" | "estimate" | "client" | "job";
  icon: React.ElementType;
};

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulating API call with setTimeout
    setTimeout(() => {
      // Demo search results - in a real app, this would be fetched from the backend
      const mockResults: SearchResult[] = [
        {
          id: "INV-12345",
          title: "Invoice #INV-12345",
          subtitle: "Michael Johnson - $275.50",
          type: "invoice",
          icon: FileText
        },
        {
          id: "EST-67890",
          title: "Estimate #EST-67890",
          subtitle: "Michael Johnson - $325.00",
          type: "estimate",
          icon: FileText
        },
        {
          id: "client-123",
          title: "Michael Johnson",
          subtitle: "(555) 123-4567",
          type: "client",
          icon: User
        },
        {
          id: "JOB-1001",
          title: "HVAC Repair - Michael Johnson",
          subtitle: "Status: Scheduled",
          type: "job",
          icon: Phone
        }
      ];
      
      setResults(mockResults.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      setIsSearching(false);
    }, 500);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice/estimate #, client name, phone..."
              className="pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-8 top-0 h-full"
                onClick={clearSearch}
              >
                <X size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Search size={16} />
            </Button>
          </div>

          <div className="mt-6">
            {isSearching ? (
              <div className="text-center py-8 text-fixlyfy-text-secondary">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center p-3 rounded-md hover:bg-fixlyfy/5 cursor-pointer"
                  >
                    <div className="bg-fixlyfy/10 p-2 rounded mr-3">
                      <result.icon size={16} className="text-fixlyfy" />
                    </div>
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-fixlyfy-text-secondary">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-fixlyfy-text-secondary">
                No results found for "{searchQuery}"
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
