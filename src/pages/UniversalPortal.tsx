import { useParams } from 'react-router-dom';
import { usePortalTokenValidation } from '@/hooks/usePortalTokenValidation';
import { UniversalPortalLayout } from '@/components/portal/UniversalPortalLayout';
import EstimatePortal from './EstimatePortal';
import InvoicePortal from './InvoicePortal';

export default function UniversalPortal() {
  const { token } = useParams();
  const { loading, isValid, documentType, error, refetch } = usePortalTokenValidation(token);

  // Show loading or error states
  if (loading || !isValid) {
    return (
      <UniversalPortalLayout
        loading={loading}
        error={error}
        documentType={documentType}
        onRetry={refetch}
      >
        <div></div>
      </UniversalPortalLayout>
    );
  }

  // Render appropriate portal based on document type
  if (documentType === 'estimate') {
    return <EstimatePortal />;
  } else if (documentType === 'invoice') {
    return <InvoicePortal />;
  }

  return (
    <UniversalPortalLayout
      error="Unknown document type"
      onRetry={refetch}
    >
      <div></div>
    </UniversalPortalLayout>
  );
}