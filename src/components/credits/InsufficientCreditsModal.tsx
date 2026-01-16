import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard, Sparkles } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  requiredCredits?: number;
}

export function InsufficientCreditsModal({
  open,
  onOpenChange,
  featureName = "this feature",
  requiredCredits,
}: InsufficientCreditsModalProps) {
  const navigate = useNavigate();
  const { balance } = useCredits();

  const handleTopUp = () => {
    onOpenChange(false);
    navigate("/settings/billing?tab=credits");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
            <Coins className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Insufficient Credits
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              You don't have enough credits to use {featureName}.
            </p>
            {requiredCredits && (
              <p className="text-sm">
                Required: <span className="font-semibold text-amber-600">{requiredCredits} credits</span>
                {" | "}
                Your balance: <span className="font-semibold text-red-500">{balance} credits</span>
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-violet-900 mb-1">
                Credits power AI features
              </p>
              <p className="text-violet-700">
                SMS, Email, AI replies, and other smart features use credits.
                Top up to continue using these powerful tools.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleTopUp}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Top Up Credits
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
