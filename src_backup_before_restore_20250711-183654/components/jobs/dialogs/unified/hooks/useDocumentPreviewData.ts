
import { useState, useEffect } from "react";
import { useCompanySettings } from "./useCompanySettings";
import { useJobData } from "./useJobData";

interface UseDocumentPreviewDataProps {
  clientInfo?: any;
  jobId?: string;
  documentNumber: string;
  documentType: string;
}

export const useDocumentPreviewData = ({
  clientInfo: providedClientInfo,
  jobId,
  documentNumber,
  documentType
}: UseDocumentPreviewDataProps) => {
  const { companyInfo, loading: companyLoading } = useCompanySettings();
  const { clientInfo: jobClientInfo, jobAddress, loading: jobLoading } = useJobData(jobId || '');
  
  const [enhancedClientInfo, setEnhancedClientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== useDocumentPreviewData Debug ===');
    console.log('JobId received:', jobId);
    console.log('Provided clientInfo:', providedClientInfo);
    console.log('Job client info from hook:', jobClientInfo);
    console.log('Job address from hook:', jobAddress);
    console.log('Document type:', documentType);
    console.log('Company loading:', companyLoading);
    console.log('Job loading:', jobLoading);

    // Wait for all data to load
    if (companyLoading || (jobId && jobLoading)) {
      console.log('Still loading data...');
      return;
    }

    // Determine final client info based on what's available
    let finalClientInfo;

    if (jobId && jobClientInfo) {
      // Use job client info if available (this is the primary source when we have a jobId)
      finalClientInfo = {
        ...jobClientInfo,
        fullAddress: jobAddress || jobClientInfo.fullAddress || 'Address not available'
      };
      console.log('Using job client info:', finalClientInfo);
    } else if (providedClientInfo) {
      // Use provided client info as fallback
      finalClientInfo = {
        name: providedClientInfo.name || 'Client Name',
        email: providedClientInfo.email || '',
        phone: providedClientInfo.phone || '',
        company: providedClientInfo.company || '',
        type: providedClientInfo.type || 'Residential',
        fullAddress: providedClientInfo.address || providedClientInfo.fullAddress || 'Address not available'
      };
      console.log('Using provided client info:', finalClientInfo);
    } else {
      // Complete fallback
      finalClientInfo = {
        name: 'Client Name',
        email: '',
        phone: '',
        company: '',
        type: 'Residential',
        fullAddress: 'Address not available'
      };
      console.log('Using fallback client info:', finalClientInfo);
    }

    console.log('Final client info set:', finalClientInfo);
    setEnhancedClientInfo(finalClientInfo);
    setLoading(false);
  }, [providedClientInfo, jobId, documentNumber, documentType, jobClientInfo, jobAddress, companyLoading, jobLoading]);

  return {
    enhancedClientInfo,
    companyInfo,
    jobAddress: jobAddress || '',
    loading: loading || companyLoading || (jobId ? jobLoading : false)
  };
};
