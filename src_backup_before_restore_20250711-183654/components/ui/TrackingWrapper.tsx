
import { ReactNode, cloneElement, isValidElement } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';

interface TrackingWrapperProps {
  children: ReactNode;
  actionType: string;
  element?: string;
  context?: Record<string, any>;
}

export const TrackingWrapper = ({ 
  children, 
  actionType, 
  element, 
  context = {} 
}: TrackingWrapperProps) => {
  const { trackAction } = useUserTracking();

  const handleClick = (originalOnClick?: (event: any) => void) => {
    trackAction({
      actionType,
      element,
      context
    });
    
    if (originalOnClick) {
      originalOnClick({} as any);
    }
  };

  if (isValidElement(children)) {
    return cloneElement(children, {
      ...children.props,
      onClick: (event: any) => {
        handleClick(children.props.onClick);
        if (children.props.onClick) {
          children.props.onClick(event);
        }
      }
    } as any);
  }

  return <>{children}</>;
};
