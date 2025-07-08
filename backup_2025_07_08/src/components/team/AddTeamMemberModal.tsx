
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRBAC } from "@/components/auth/RBACProvider";
import { UserRole } from "@/components/auth/types";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTeamMemberModal = ({
  open,
  onOpenChange,
}: AddTeamMemberModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("technician");
  const [serviceArea, setServiceArea] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  
  const { allRoles, customRoles } = useRBAC();
  const { sendInvitation, isSubmitting } = useTeamInvitations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await sendInvitation({
      name,
      email,
      phone: phone || undefined,
      role,
      serviceArea: serviceArea || undefined,
      sendWelcomeEmail
    });
    
    if (result.success) {
      resetForm();
      onOpenChange(false);
      
      // Refresh the page after a short delay to show updates
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
  
  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("technician");
    setServiceArea("");
    setSendWelcomeEmail(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team. They'll receive an SMS and/or email with setup instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
                placeholder="John Smith"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
                placeholder="john.smith@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                placeholder="+1234567890 (for SMS notifications)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {allRoles.map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </SelectItem>
                  ))}
                  {customRoles.map((customRole) => (
                    <SelectItem key={customRole.id} value={customRole.name}>
                      {customRole.name} (Custom)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceArea" className="text-right">
                Service Area
              </Label>
              <Input
                id="serviceArea"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="col-span-3"
                placeholder="Optional: City, Region, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="sendEmail" 
                  checked={sendWelcomeEmail} 
                  onCheckedChange={(checked) => setSendWelcomeEmail(checked === true)}
                />
                <Label htmlFor="sendEmail" className="cursor-pointer">
                  Send welcome message with setup instructions
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending Invitation..." : "Invite Team Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
