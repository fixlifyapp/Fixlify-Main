
import { PhoneNumberCheck } from '@/components/debug/PhoneNumberCheck';

export default function DebugPhonePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Phone Number Debug</h1>
      <PhoneNumberCheck />
    </div>
  );
}
