
import { UserRole } from "@/components/auth/types";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  avatar?: string;
  lastLogin?: string;
}
