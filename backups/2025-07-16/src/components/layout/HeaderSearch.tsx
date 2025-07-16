
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: 'job' | 'client' | 'estimate' | 'invoice';
  title: string;
  subtitle?: string;
  url: string;
}

export const HeaderSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchData = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        const searchResults: SearchResult[] = [];

        // Search jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*, clients(*)')
          .or(`title.ilike.%${query}%,id.ilike.%${query}%`)
          .limit(3);

        if (jobs) {
          jobs.forEach(job => {
            searchResults.push({
              id: job.id,
              type: 'job',
              title: job.title || `Job ${job.id}`,
              subtitle: job.clients?.name || 'Unknown Client',
              url: `/jobs/${job.id}`
            });
          });
        }

        // Search clients
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%,id.ilike.%${query}%`)
          .limit(3);

        if (clients) {
          clients.forEach(client => {
            searchResults.push({
              id: client.id,
              type: 'client',
              title: client.name,
              subtitle: client.email || client.phone,
              url: `/clients/${client.id}`
            });
          });
        }

        // Search estimates
        const { data: estimates } = await supabase
          .from('estimates')
          .select('*')
          .or(`estimate_number.ilike.%${query}%,id.ilike.%${query}%`)
          .limit(3);

        if (estimates) {
          for (const estimate of estimates) {
            // Get job and client info separately
            const { data: jobData } = await supabase
              .from('jobs')
              .select('*, clients(*)')
              .eq('id', estimate.job_id)
              .single();

            searchResults.push({
              id: estimate.id,
              type: 'estimate',
              title: `Estimate ${estimate.estimate_number}`,
              subtitle: jobData?.clients?.name || 'Unknown Client',
              url: `/estimates/${estimate.id}`
            });
          }
        }

        // Search invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('*')
          .or(`invoice_number.ilike.%${query}%,id.ilike.%${query}%`)
          .limit(3);

        if (invoices) {
          for (const invoice of invoices) {
            // Get job and client info separately
            const { data: jobData } = await supabase
              .from('jobs')
              .select('*, clients(*)')
              .eq('id', invoice.job_id)
              .single();

            searchResults.push({
              id: invoice.id,
              type: 'invoice',
              title: `Invoice ${invoice.invoice_number}`,
              subtitle: jobData?.clients?.name || 'Unknown Client',
              url: `/invoices/${invoice.id}`
            });
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search jobs, clients, estimates..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10 w-64"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleResultClick(result)}
            >
              <div className="font-medium text-sm">{result.title}</div>
              {result.subtitle && (
                <div className="text-xs text-gray-500">{result.subtitle}</div>
              )}
              <div className="text-xs text-blue-600 capitalize">{result.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
