import { PageLayout } from '@/components/layout/PageLayout';
import { SMSTestPanel } from '@/components/debug/SMSTestPanel';

const SMSTestPage = () => {
  return (
    <PageLayout>
      <div className="container-responsive py-6">
        <h1 className="text-2xl font-bold mb-6">SMS System Test</h1>
        <SMSTestPanel />
      </div>
    </PageLayout>
  );
};

export default SMSTestPage;