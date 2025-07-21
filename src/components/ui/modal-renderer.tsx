// Modal renderer stub to fix TypeScript errors
import { ReactNode } from "react";

interface ModalRendererProps {
  children?: ReactNode;
}

export const ModalRenderer = ({ children }: ModalRendererProps) => {
  return <>{children}</>;
};