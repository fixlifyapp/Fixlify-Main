
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardTitleWithIconProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const CardTitleWithIcon = ({ icon: Icon, children, className }: CardTitleWithIconProps) => {
  return (
    <h3 className={`text-lg font-semibold leading-none tracking-tight flex items-center gap-2 ${className || ''}`}>
      <Icon className="h-5 w-5" />
      {children}
    </h3>
  );
};
