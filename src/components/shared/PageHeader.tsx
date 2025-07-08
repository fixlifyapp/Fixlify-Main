
import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badges?: React.ReactNode[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badges,
  actions
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-6 w-6" />}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {badges && (
          <div className="flex gap-2">
            {badges.map((badge, index) => (
              <div key={index}>{badge}</div>
            ))}
          </div>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;
